# Exploration Checklist

Structured checklists for what to explore based on feature type. Use these to guide Explore agent queries during Step 1. Adapt paths, layer names, and framework assumptions to the actual project rather than forcing this checklist onto the repo.

## Table of Contents
- [Service Or API Feature](#service-or-api-feature)
- [Ui Or Screen Feature](#ui-or-screen-feature)
- [Cross-Cutting Feature](#cross-cutting-feature)
- [Data Model Or Contract Change](#data-model-or-contract-change)

---

## Service Or API Feature

When the feature adds or modifies service logic, APIs, automation, or backend behavior.

### Data Or Source-Of-Truth Layer
- [ ] Find the source-of-truth models, schemas, contracts, or config relevant to the feature
- [ ] Check recent changes that show how this part of the system evolves over time
- [ ] Look for seeds, fixtures, example payloads, or reference data if they exist

### Core Logic Layer
- [ ] Find the closest existing module, service, feature, or bounded area
- [ ] Study core entities, value objects, types, or business concepts for naming conventions
- [ ] Review where business rules currently live
- [ ] Check shared abstractions, base classes, or common types

### Orchestration Layer
- [ ] Study use cases, services, handlers, or workflows that coordinate the feature
- [ ] Review input/output object patterns
- [ ] Check for existing mappers, transformers, serializers, or adapters
- [ ] Look for cross-module dependencies or side effects

### Integration Layer
- [ ] Review data access patterns and repository/service boundaries
- [ ] Check external integrations such as third-party APIs, auth providers, queues, jobs, or storage
- [ ] Identify permissions, policy checks, or security-sensitive boundaries

### Delivery Layer
- [ ] Study controller, route, resolver, or handler patterns
- [ ] Review endpoint/event naming, request/response formats, and validation
- [ ] Check how errors, retries, and status reporting are handled

### Testing
- [ ] Check the unit/integration/e2e test structure for the closest prior art
- [ ] Review factories, fixtures, helpers, and test data setup
- [ ] Note how environment setup, mocks, and database/service dependencies are handled

### Documentation
- [ ] Look for architecture docs, module docs, ADRs, or onboarding references
- [ ] Review any local agent rules or project conventions that constrain design choices
- [ ] Note documentation gaps that increase design risk

---

## Ui Or Screen Feature

When the feature adds or modifies screens, views, client flows, or user-facing interactions.

### Navigation & Routing
- [ ] Identify the relevant routes, navigation hierarchy, or entry points
- [ ] Check how similar screens or flows are organized
- [ ] Note how users enter, exit, and recover within the flow

### Components & Design System
- [ ] Inventory reusable components, primitives, or shared UI patterns
- [ ] Review documented design system rules, tokens, spacing, typography, or visual conventions
- [ ] Find nearby screens or components worth visually aligning with

### State Management
- [ ] Check how existing screens manage local vs. shared state
- [ ] Review data fetching, caching, optimistic updates, and refresh behavior
- [ ] Identify where loading, empty, error, and success states are currently handled

### API Integration
- [ ] Map required data to existing services, endpoints, or data providers
- [ ] Identify whether new backend or service changes are required
- [ ] Check authentication, authorization, and permission patterns in data access

### Styling & Animation
- [ ] Review existing animation, transition, and layout patterns
- [ ] Check for performance-sensitive areas like long lists, heavy media, or complex interactions
- [ ] Note responsiveness, motion, and visual consistency constraints

### Platform Considerations
- [ ] Check platform, device, browser, or input-method differences
- [ ] Review accessibility expectations
- [ ] Note viewport, safe area, keyboard, or responsive layout considerations

---

## Cross-Cutting Feature

When the feature spans multiple system surfaces such as backend + client, API + workflow automation, or data model + UX.

### API Contract
- [ ] Define the contract or shared surface first: endpoints, events, payloads, or shared state
- [ ] Check existing request/response or producer/consumer patterns
- [ ] Review how different system parts currently consume similar functionality

### Service / API Checklist
- [ ] Follow the [Service Or API Feature](#service-or-api-feature) checklist above

### UI / Screen Checklist
- [ ] Follow the [Ui Or Screen Feature](#ui-or-screen-feature) checklist above

### Integration Points
- [ ] Authentication and identity flow across boundaries
- [ ] Error propagation and how failures surface to users or operators
- [ ] Real-time, background, or asynchronous update behavior
- [ ] Offline, retry, or eventual consistency behavior
- [ ] Analytics, observability, and audit implications if relevant

---

## Data Model Or Contract Change

When the feature primarily involves schema or data model changes.

### Impact Analysis
- [ ] Read the affected models, schemas, contracts, or shared types fully
- [ ] Search for all references to affected concepts across the codebase
- [ ] Identify all readers, writers, and downstream consumers
- [ ] Check for cascade effects such as relations, required fields, uniqueness, backward compatibility, or validation assumptions

### Migration Safety
- [ ] Is this an additive change (new fields/tables) or destructive (removing/renaming)?
- [ ] Does it require data migration, backfill, re-indexing, or compatibility shims?
- [ ] Can the change be rolled out safely without downtime or coordination issues?

### Downstream Effects
- [ ] Which DTOs, serializers, adapters, or generated types need updating?
- [ ] Which use cases, screens, reports, or automations reference the changed shape?
- [ ] Are seed data, fixtures, or example payloads affected?
- [ ] Do existing tests, docs, or integrations assume the old shape?
