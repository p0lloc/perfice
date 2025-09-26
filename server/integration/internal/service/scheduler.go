package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"maps"
	"math/rand"
	"slices"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/go-co-op/gocron/v2"
	"github.com/google/uuid"
	"perfice.adoe.dev/integration/internal/model"
	pb "perfice.adoe.dev/proto"
	"perfice.adoe.dev/util"
)

type IntegrationSchedulerService struct {
	fetchService           *IntegrationFetchService
	typeService            *IntegrationTypeService
	userIntegrationService *UserIntegrationService
	authClient             pb.UserServiceClient

	jobs      map[string]uuid.UUID
	scheduler gocron.Scheduler
}

func NewIntegrationSchedulerService(fetchService *IntegrationFetchService, typeService *IntegrationTypeService, userIntegrationService *UserIntegrationService, authClient pb.UserServiceClient) *IntegrationSchedulerService {
	return &IntegrationSchedulerService{fetchService, typeService, userIntegrationService, authClient, map[string]uuid.UUID{}, nil}
}

func (s *IntegrationSchedulerService) Load() error {
	scheduler, err := gocron.NewScheduler()
	if err != nil {
		return err
	}

	s.scheduler = scheduler

	integrations, err := s.userIntegrationService.GetAllIntegrations()
	if err != nil {
		return err
	}

	userIds := map[string]bool{}
	for _, integration := range integrations {
		userIds[integration.UserId] = true
	}

	resp, err := s.authClient.GetUsersTimeZones(context.Background(), &pb.GetUsersTimeZonesRequest{UserIds: slices.Collect(maps.Keys(userIds))})
	if err != nil {
		return err
	}

	for _, integration := range integrations {
		timezone := util.GetFromMapOrNil(resp.Timezones, integration.UserId)
		if timezone == nil {
			continue
		}

		pullSource := s.typeService.ExtractPullSource(integration.IntegrationType, integration.EntityType)
		if pullSource == nil {
			continue
		}

		if err := s.ScheduleIntegration(integration, *pullSource, *timezone); err != nil {
			return err
		}
	}

	s.scheduler.Start()
	return nil
}

func (s *IntegrationSchedulerService) UnscheduleJobByIntegrationId(integrationId string) error {
	jobId := util.GetFromMapOrNil(s.jobs, integrationId)
	if jobId == nil {
		return nil
	}

	return s.scheduler.RemoveJob(*jobId)
}

func (s *IntegrationSchedulerService) ScheduleIntegration(integration model.UserIntegration, pullSource model.PullIntegrationEntitySourceSettings, timezone string) error {
	definition := s.typeService.GetIntegrationEntityByIntegrationTypeAndEntityType(integration.IntegrationType, integration.EntityType)
	if definition == nil {
		return nil
	}

	if pullSource.Interval.Cron == "" {
		return nil
	}

	cron := fmt.Sprintf("TZ=%s %s", timezone, pullSource.Interval.Cron)

	log.Println("Scheduling new job", integration.IntegrationType, integration.EntityType, cron)

	job, err := s.scheduler.NewJob(gocron.CronJob(cron, true), gocron.NewTask(func() {
		jitter := time.Duration(0)
		if pullSource.Interval.Jitter > 0 {
			jitter = time.Minute * time.Duration(rand.Intn(pullSource.Interval.Jitter))
		}

		time.Sleep(jitter)

		integration, err := s.userIntegrationService.GetIntegrationById(integration.Id)
		if integration == nil {
			log.Println("Running integration: couldn't find integration")
			return
		}

		if err != nil {
			log.Printf("Failed to get integration %s:%s: %v\n", integration.IntegrationType, integration.EntityType, err)
			return
		}

		err = s.fetchService.pullIntegration(*integration, pullSource)
		if err != nil {
			sentry.CaptureException(fmt.Errorf("Failed to run integration %s:%s: %v\n", integration.IntegrationType, integration.EntityType, err))
			if errors.Is(err, IntegrationFetchError{}) {
				_, _ = s.scheduler.NewJob(gocron.OneTimeJob(gocron.OneTimeJobStartDateTime(time.Now().Add(time.Second*10))), gocron.NewTask(func() {
					log.Printf("Retrying integration %s:%s\n", integration.IntegrationType, integration.EntityType)
					err := s.fetchService.pullIntegration(*integration, pullSource)
					if err != nil {
						sentry.CaptureException(fmt.Errorf("Integration re-fetch failed %s:%s: %v\n", integration.IntegrationType, integration.EntityType, err))
					}
				}))
			}
		}
	}))

	if err != nil {
		return err
	}

	s.jobs[integration.Id] = job.ID()
	return nil
}

func (s *IntegrationSchedulerService) RescheduleIntegrations(integrations []model.UserIntegration, timezone string) error {
	log.Println("Rescheduling integrations due to timezone change")
	for _, integration := range integrations {
		jobId := util.GetFromMapOrNil(s.jobs, integration.Id)
		if jobId == nil {
			continue
		}

		if err := s.UnscheduleJobByIntegrationId(integration.Id); err != nil {
			return err
		}

		pullSource := s.typeService.ExtractPullSource(integration.IntegrationType, integration.EntityType)
		if pullSource == nil {
			continue
		}

		if err := s.ScheduleIntegration(integration, *pullSource, timezone); err != nil {
			return err
		}
	}

	return nil
}
