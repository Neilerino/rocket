# Training Plan API Specification

## Overview

This API specification outlines the endpoints and data models for the Rocket training plan application. The service provides functionality for managing training plans, intervals, groups, exercises, and parameters for personalized workout programming.

## Base URL

```
https://api.example.com/v1
```

## Authentication

All API endpoints require authentication using a JWT token provided in the Authorization header:

```
Authorization: Bearer {token}
```

## Response Format

All responses are returned in JSON format with the following structure for successful responses:

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

Errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

---

## Plans

### Data Model

```typescript
interface Plan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isTemplate: boolean;
  isPublic: boolean;
  tags?: string[];
  interventionId?: string;
  // Relationships (referenced by ID)
  intervals?: PlanInterval[];
}
```

### Endpoints

#### Get All Plans

```
GET /plans
```

Query Parameters:
- `limit` (optional): Number of records to return (default: 20)
- `offset` (optional): Number of records to skip (default: 0)
- `sort` (optional): Field to sort by (default: 'updatedAt')
- `order` (optional): Sort order ('asc' or 'desc', default: 'desc')
- `isTemplate` (optional): Filter by template status (boolean)
- `isPublic` (optional): Filter by public status (boolean)
- `tags` (optional): Filter by tags (comma-separated list)

Response:
- 200: Returns a list of plans

#### Get Plan By ID

```
GET /plans/{planId}
```

Path Parameters:
- `planId`: ID of the plan to retrieve

Response:
- 200: Returns the requested plan
- 404: Plan not found

#### Create Plan

```
POST /plans
```

Request Body:
```json
{
  "name": "My Training Plan",
  "description": "Description of the plan",
  "isTemplate": false,
  "isPublic": false,
  "tags": ["strength", "endurance"]
}
```

Response:
- 201: Plan created successfully

#### Update Plan

```
PUT /plans/{planId}
```

Path Parameters:
- `planId`: ID of the plan to update

Request Body:
```json
{
  "name": "Updated Plan Name",
  "description": "Updated description",
  "isTemplate": true,
  "isPublic": true,
  "tags": ["updated", "tags"]
}
```

Response:
- 200: Plan updated successfully
- 404: Plan not found

#### Delete Plan

```
DELETE /plans/{planId}
```

Path Parameters:
- `planId`: ID of the plan to delete

Response:
- 204: Plan deleted successfully
- 404: Plan not found

---

## Intervals

### Data Model

```typescript
interface PlanInterval {
  id: string;
  planId: string;
  name: string;
  description?: string;
  duration: string; // e.g., "7 days"
  order: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Relationships (referenced by ID)
  groups?: Group[];
}
```

### Endpoints

#### Get Intervals for Plan

```
GET /plans/{planId}/intervals
```

Path Parameters:
- `planId`: ID of the plan

Response:
- 200: Returns a list of intervals for the specified plan
- 404: Plan not found

#### Get Interval By ID

```
GET /intervals/{intervalId}
```

Path Parameters:
- `intervalId`: ID of the interval to retrieve

Response:
- 200: Returns the requested interval
- 404: Interval not found

#### Create Interval

```
POST /plans/{planId}/intervals
```

Path Parameters:
- `planId`: ID of the plan to add the interval to

Request Body:
```json
{
  "name": "Week 1",
  "description": "Base building with progressive intensity",
  "duration": "7 days",
  "order": 1
}
```

Response:
- 201: Interval created successfully
- 404: Plan not found

#### Update Interval

```
PUT /intervals/{intervalId}
```

Path Parameters:
- `intervalId`: ID of the interval to update

Request Body:
```json
{
  "name": "Updated Interval Name",
  "description": "Updated description",
  "duration": "10 days",
  "order": 2
}
```

Response:
- 200: Interval updated successfully
- 404: Interval not found

#### Delete Interval

```
DELETE /intervals/{intervalId}
```

Path Parameters:
- `intervalId`: ID of the interval to delete

Response:
- 204: Interval deleted successfully
- 404: Interval not found

#### Copy Interval

```
POST /intervals/{intervalId}/copy
```

Path Parameters:
- `intervalId`: ID of the interval to copy

Query Parameters:
- `targetPlanId` (optional): ID of the plan to copy to (defaults to the same plan)

Response:
- 201: Interval copied successfully
- 404: Source interval not found

---

## Groups

### Data Model

```typescript
interface Group {
  id: string;
  intervalId: string;
  name: string;
  description?: string;
  frequency: string; // e.g., "1x per week"
  order: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Relationships (referenced by ID)
  exercises?: ExercisePrescription[];
}
```

### Endpoints

#### Get Groups for Interval

```
GET /intervals/{intervalId}/groups
```

Path Parameters:
- `intervalId`: ID of the interval

Response:
- 200: Returns a list of groups for the specified interval
- 404: Interval not found

#### Get Group By ID

```
GET /groups/{groupId}
```

Path Parameters:
- `groupId`: ID of the group to retrieve

Response:
- 200: Returns the requested group
- 404: Group not found

#### Create Group

```
POST /intervals/{intervalId}/groups
```

Path Parameters:
- `intervalId`: ID of the interval to add the group to

Request Body:
```json
{
  "name": "Upper Body",
  "description": "Upper body strength training",
  "frequency": "3x per week",
  "order": 1
}
```

Response:
- 201: Group created successfully
- 404: Interval not found

#### Update Group

```
PUT /groups/{groupId}
```

Path Parameters:
- `groupId`: ID of the group to update

Request Body:
```json
{
  "name": "Updated Group Name",
  "description": "Updated description",
  "frequency": "2x per week",
  "order": 2
}
```

Response:
- 200: Group updated successfully
- 404: Group not found

#### Delete Group

```
DELETE /groups/{groupId}
```

Path Parameters:
- `groupId`: ID of the group to delete

Response:
- 204: Group deleted successfully
- 404: Group not found

---

## Exercises

### Data Model

```typescript
interface Exercise {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isPublic: boolean;
  tags?: string[];
  // Relationships (referenced by ID)
  variations?: ExerciseVariation[];
}

interface ExerciseVariation {
  id: string;
  exerciseId: string;
  name: string;
  description?: string;
  // Parameter configurations
  parameters?: Record<string, {
    defaultValue?: number;
    minValue?: number;
    maxValue?: number;
  }>;
}
```

### Endpoints

#### Get All Exercises

```
GET /exercises
```

Query Parameters:
- `limit` (optional): Number of records to return (default: 20)
- `offset` (optional): Number of records to skip (default: 0)
- `sort` (optional): Field to sort by (default: 'name')
- `order` (optional): Sort order ('asc' or 'desc', default: 'asc')
- `isPublic` (optional): Filter by public status (boolean)
- `tags` (optional): Filter by tags (comma-separated list)
- `search` (optional): Search term to match against name and description

Response:
- 200: Returns a list of exercises

#### Get Exercise By ID

```
GET /exercises/{exerciseId}
```

Path Parameters:
- `exerciseId`: ID of the exercise to retrieve

Response:
- 200: Returns the requested exercise
- 404: Exercise not found

#### Create Exercise

```
POST /exercises
```

Request Body:
```json
{
  "name": "Bench Press",
  "description": "Horizontal pressing movement",
  "isPublic": true,
  "tags": ["strength", "chest", "push"]
}
```

Response:
- 201: Exercise created successfully

#### Update Exercise

```
PUT /exercises/{exerciseId}
```

Path Parameters:
- `exerciseId`: ID of the exercise to update

Request Body:
```json
{
  "name": "Updated Exercise Name",
  "description": "Updated description",
  "isPublic": false,
  "tags": ["updated", "tags"]
}
```

Response:
- 200: Exercise updated successfully
- 404: Exercise not found

#### Delete Exercise

```
DELETE /exercises/{exerciseId}
```

Path Parameters:
- `exerciseId`: ID of the exercise to delete

Response:
- 204: Exercise deleted successfully
- 404: Exercise not found

---

## Exercise Prescriptions

### Data Model

```typescript
interface ExercisePrescription {
  id: string;
  groupId: string;
  exerciseId: string;
  variationId?: string;
  sets: number;
  reps?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  rest?: string; // Format: "MM:SS"
  rpe?: number; // Rate of Perceived Exertion (1-10)
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  // Dynamic parameters
  parameters: Record<string, number>;
  // Locked parameters (cannot be changed)
  lockedParameters?: Record<string, number>;
}
```

### Endpoints

#### Get Exercise Prescriptions for Group

```
GET /groups/{groupId}/exercises
```

Path Parameters:
- `groupId`: ID of the group

Response:
- 200: Returns a list of exercise prescriptions for the specified group
- 404: Group not found

#### Get Exercise Prescription By ID

```
GET /exercise-prescriptions/{prescriptionId}
```

Path Parameters:
- `prescriptionId`: ID of the exercise prescription to retrieve

Response:
- 200: Returns the requested exercise prescription
- 404: Exercise prescription not found

#### Create Exercise Prescription

```
POST /groups/{groupId}/exercises
```

Path Parameters:
- `groupId`: ID of the group to add the exercise prescription to

Request Body:
```json
{
  "exerciseId": "ex123",
  "variationId": "var456",
  "sets": 3,
  "reps": 12,
  "rest": "00:02:00",
  "rpe": 8,
  "parameters": {
    "weight": 100,
    "tempo": 3010
  },
  "lockedParameters": {
    "edge_size": 20
  }
}
```

Response:
- 201: Exercise prescription created successfully
- 404: Group or exercise not found

#### Update Exercise Prescription

```
PUT /exercise-prescriptions/{prescriptionId}
```

Path Parameters:
- `prescriptionId`: ID of the exercise prescription to update

Request Body:
```json
{
  "sets": 4,
  "reps": 10,
  "rest": "00:01:30",
  "rpe": 9,
  "parameters": {
    "weight": 110,
    "tempo": 2010
  }
}
```

Response:
- 200: Exercise prescription updated successfully
- 404: Exercise prescription not found

#### Delete Exercise Prescription

```
DELETE /exercise-prescriptions/{prescriptionId}
```

Path Parameters:
- `prescriptionId`: ID of the exercise prescription to delete

Response:
- 204: Exercise prescription deleted successfully
- 404: Exercise prescription not found

---

## Parameter Types

### Data Model

```typescript
interface ParameterType {
  id: string;
  name: string;
  description?: string;
  dataType: 'number' | 'string' | 'boolean';
  unit?: string;
  defaultUnit?: string;
  minValue?: number;
  maxValue?: number;
  stepSize?: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isSystem: boolean; // System parameters can't be modified by users
}
```

### Endpoints

#### Get All Parameter Types

```
GET /parameter-types
```

Query Parameters:
- `limit` (optional): Number of records to return (default: 50)
- `offset` (optional): Number of records to skip (default: 0)
- `isSystem` (optional): Filter by system status (boolean)

Response:
- 200: Returns a list of parameter types

#### Get Parameter Type By ID

```
GET /parameter-types/{parameterTypeId}
```

Path Parameters:
- `parameterTypeId`: ID of the parameter type to retrieve

Response:
- 200: Returns the requested parameter type
- 404: Parameter type not found

#### Create Parameter Type

```
POST /parameter-types
```

Request Body:
```json
{
  "name": "Weight",
  "description": "Weight used for the exercise",
  "dataType": "number",
  "unit": "kg",
  "defaultUnit": "kg",
  "minValue": 0,
  "maxValue": 500,
  "stepSize": 2.5
}
```

Response:
- 201: Parameter type created successfully

#### Update Parameter Type

```
PUT /parameter-types/{parameterTypeId}
```

Path Parameters:
- `parameterTypeId`: ID of the parameter type to update

Request Body:
```json
{
  "name": "Updated Parameter Type",
  "description": "Updated description",
  "minValue": 5,
  "maxValue": 600,
  "stepSize": 5
}
```

Response:
- 200: Parameter type updated successfully
- 404: Parameter type not found

#### Delete Parameter Type

```
DELETE /parameter-types/{parameterTypeId}
```

Path Parameters:
- `parameterTypeId`: ID of the parameter type to delete

Response:
- 204: Parameter type deleted successfully
- 404: Parameter type not found
- 400: Cannot delete system parameter types

---

## Analytics and Insights

### Endpoints

#### Get Training Volume Over Time

```
GET /analytics/volume
```

Query Parameters:
- `planId` (optional): Filter by plan ID
- `timeframe`: Timeframe for analysis ('week', 'month', 'quarter', 'year')
- `metric`: Volume metric ('sets', 'reps', 'total_load')
- `exerciseId` (optional): Filter by exercise ID
- `groupId` (optional): Filter by group ID
- `startDate` (optional): Start date for analysis (ISO date string)
- `endDate` (optional): End date for analysis (ISO date string)

Response:
- 200: Returns volume data over the specified timeframe

#### Get Training Progression

```
GET /analytics/progression
```

Query Parameters:
- `exerciseId`: Exercise ID to analyze
- `parameterTypeId`: Parameter type ID to track (e.g., weight, reps)
- `timeframe`: Timeframe for analysis ('week', 'month', 'quarter', 'year')
- `aggregation`: Aggregation method ('max', 'avg', 'sum')
- `startDate` (optional): Start date for analysis (ISO date string)
- `endDate` (optional): End date for analysis (ISO date string)

Response:
- 200: Returns progression data for the specified exercise and parameter

---

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication is required or has failed |
| `FORBIDDEN` | User does not have permission to perform this action |
| `NOT_FOUND` | The requested resource was not found |
| `VALIDATION_ERROR` | Request validation failed |
| `CONFLICT` | Resource conflict (e.g., duplicate name) |
| `INTERNAL_ERROR` | Server encountered an unexpected error |
| `RATE_LIMIT_EXCEEDED` | API rate limit has been exceeded |

---

## Webhooks (for integrations)

### Events

- `plan.created`
- `plan.updated`
- `plan.deleted`
- `interval.created`
- `interval.updated`
- `interval.deleted`
- `group.created`
- `group.updated`
- `group.deleted`
- `exercise_prescription.created`
- `exercise_prescription.updated`
- `exercise_prescription.deleted`

### Webhook Registration

```
POST /webhooks
```

Request Body:
```json
{
  "url": "https://your-app.com/webhook-handler",
  "events": ["plan.created", "plan.updated"],
  "description": "Sync plans with external system"
}
```

Response:
- 201: Webhook registered successfully

### Additional Webhook Management Endpoints

- `GET /webhooks`: List registered webhooks
- `GET /webhooks/{webhookId}`: Get webhook details
- `PUT /webhooks/{webhookId}`: Update webhook configuration
- `DELETE /webhooks/{webhookId}`: Delete webhook registration
- `POST /webhooks/{webhookId}/ping`: Send test event to webhook endpoint
