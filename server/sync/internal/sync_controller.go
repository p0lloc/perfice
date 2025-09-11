package internal

import (
	"slices"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"perfice.adoe.dev/util"
)

type SyncController struct {
	syncService *SyncService
	validator   *validator.Validate
	entityTypes []string
}

func getUserId(ctx *fiber.Ctx) string {
	return ctx.Locals(userIdLocal).(string)
}

func getSessionId(ctx *fiber.Ctx) string {
	return ctx.Locals(sessionIdLocal).(string)
}

func NewSyncController(syncService *SyncService, entityTypes []string) *SyncController {
	return &SyncController{
		syncService,
		validator.New(validator.WithRequiredStructEnabled()),
		entityTypes,
	}
}

type PushRequest struct {
	Updates []IncomingSyncUpdateDTO `json:"updates" validate:"required,dive"`
}

type FullSyncRequest struct {
	EntityTypes []string `json:"entityTypes"`
}

type FullPushRequest struct {
	Entities map[string][]IncomingSavedEntity `json:"entities" validate:"required,dive"`
}

type FullPullResponse struct {
	Entities map[string][]OutgoingSavedEntity `json:"entities"`
}

type AckRequest struct {
	Updates []string `json:"updates" validate:"required"`
}

type PushResponse struct {
	Ack []string `json:"ack"`
}

type PullResponse struct {
	Key     []byte               `json:"key"`
	Updates []OutgoingSyncUpdate `json:"updates"`
}

type IncomingSyncUpdateDTO struct {
	ID         string                 `json:"id" validate:"required,uuid"`
	Operation  string                 `json:"operation" validate:"oneof=create put delete fullSync"`
	EntityType string                 `json:"entityType" validate:"required"`
	Timestamp  int64                  `json:"timestamp" validate:"required"`
	Entities   []IncomingUpdateEntity `json:"entities" validate:"required,dive"`
}

type IncomingUpdateEntity struct {
	ID      string `json:"id"`
	Version int    `json:"version" validate:"required"`
	Data    []byte `json:"data"`
}

type OutgoingSyncUpdate struct {
	ID         string                 `json:"id"`
	Operation  string                 `json:"operation"`
	EntityType string                 `json:"entityType"`
	Timestamp  int64                  `json:"timestamp"`
	Entities   []OutgoingUpdateEntity `json:"entities"`
}

type OutgoingUpdateEntity struct {
	ID      string `json:"id"`
	Version int    `json:"version"`
	Data    []byte `json:"data"`
}

type OutgoingSavedEntity struct {
	ID      string `json:"id"`
	Version int    `json:"version"`
	Data    []byte `json:"data"`
}

type IncomingSavedEntity struct {
	ID      string `json:"id" validate:"required"`
	Version int    `json:"version" validate:"required"`
	Data    []byte `json:"data" validate:"required"`
}

func deserializeUpdateEntity(entity IncomingUpdateEntity) (UpdateEntity, error) {
	return UpdateEntity{
		ID:      entity.ID,
		Version: entity.Version,
		Data:    entity.Data,
	}, nil
}

func serializeUpdateEntity(entity UpdateEntity) (OutgoingUpdateEntity, error) {
	return OutgoingUpdateEntity{
		ID:      entity.ID,
		Version: entity.Version,
		Data:    entity.Data,
	}, nil
}

func serializeSavedEntity(entity Entity) (OutgoingSavedEntity, error) {
	return OutgoingSavedEntity{
		ID:      entity.ID,
		Version: entity.Version,
		Data:    entity.Data,
	}, nil
}

func (c *SyncController) Push(ctx *fiber.Ctx) error {
	var req PushRequest
	if err := ParseAndValidate(ctx, c.validator, &req); err != nil {
		return err
	}

	userId := getUserId(ctx)
	sessionId := getSessionId(ctx)

	var updates []IncomingSyncUpdate
	for _, update := range req.Updates {
		if !slices.Contains(c.entityTypes, update.EntityType) {
			return ctx.Status(fiber.StatusBadRequest).SendString("Invalid entity type")
		}

		entities, err := util.SliceMapErr[IncomingUpdateEntity, UpdateEntity](update.Entities, deserializeUpdateEntity)
		if err != nil {
			return err
		}

		updates = append(updates, IncomingSyncUpdate{
			ID:         update.ID,
			Operation:  update.Operation,
			EntityType: update.EntityType,
			Timestamp:  update.Timestamp,
			Entities:   entities,
		})
	}

	ackIds, err := c.syncService.Push(updates, userId, sessionId)
	if err != nil {
		return err
	}

	return ctx.JSON(PushResponse{ackIds})
}

func (c *SyncController) Pull(ctx *fiber.Ctx) error {
	userId := getUserId(ctx)
	sessionId := getSessionId(ctx)

	updates, key, err := c.syncService.Pull(userId, sessionId)
	if err != nil {
		return err
	}

	outgoingUpdates, err := util.SliceMapErr(updates, func(update SyncUpdate) (OutgoingSyncUpdate, error) {
		entities, err := util.SliceMapErr(update.Entities, func(entity UpdateEntity) (OutgoingUpdateEntity, error) {
			return serializeUpdateEntity(entity)
		})

		if err != nil {
			return OutgoingSyncUpdate{}, err
		}

		return OutgoingSyncUpdate{
			ID:         update.ID,
			Operation:  update.Operation,
			EntityType: update.EntityType,
			Timestamp:  update.Timestamp,
			Entities:   entities,
		}, nil
	})

	if err != nil {
		return err
	}

	return ctx.JSON(PullResponse{key, outgoingUpdates})
}

func (c *SyncController) Ack(ctx *fiber.Ctx) error {
	var req AckRequest
	if err := ParseAndValidate(ctx, c.validator, &req); err != nil {
		return err
	}

	sessionId := getSessionId(ctx)
	err := c.syncService.Ack(sessionId, req.Updates)
	if err != nil {
		return err
	}

	return ctx.SendStatus(fiber.StatusOK)
}

func (c *SyncController) FullPull(ctx *fiber.Ctx) error {
	var req FullSyncRequest
	if err := ParseAndValidate(ctx, c.validator, &req); err != nil {
		return err
	}

	userId := getUserId(ctx)
	sessionId := getSessionId(ctx)

	entities, err := c.syncService.FullPull(userId, sessionId, req.EntityTypes)
	if err != nil {
		return err
	}

	result := map[string][]OutgoingSavedEntity{}
	for entityType, entities := range entities {
		converted, err := util.SliceMapErr[Entity, OutgoingSavedEntity](entities, func(entity Entity) (OutgoingSavedEntity, error) {
			return serializeSavedEntity(entity)
		})

		if err != nil {
			return err
		}

		result[entityType] = converted
	}

	return ctx.JSON(FullPullResponse{result})
}
