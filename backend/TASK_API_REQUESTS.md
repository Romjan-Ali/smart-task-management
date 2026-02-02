# Task API - JSON Request Scripts

Base URL: `http://localhost:3000/api/tasks`

## Prerequisites

1. **Login first to get authentication token:**
```json
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@taskflow.com",
  "password": "Admin@123"
}
```

2. **Seed data (run these commands):**
```bash
cd backend
bun run seed:admin
bun run seed:user  
bun run seed:workflows
bun run seed:tasks
```

---

## 1. Create Task

**POST** `/api/tasks`

**Permissions:** Admin or Manager only

**Request:**
```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/tasks",
  "headers": {
    "Content-Type": "application/json",
    "Cookie": "accessToken=YOUR_TOKEN"
  },
  "body": {
    "title": "Implement Dark Mode",
    "description": "Add dark mode support to the application with theme toggle",
    "priority": "medium",
    "workflowId": "WORKFLOW_ID_HERE",
    "assignedTo": ["USER_ID_1", "USER_ID_2"],
    "dueDate": "2024-04-01T00:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{
    "title": "Implement Dark Mode",
    "description": "Add dark mode support to the application",
    "priority": "medium",
    "workflowId": "WORKFLOW_ID",
    "assignedTo": ["USER_ID"],
    "dueDate": "2024-04-01T00:00:00.000Z"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "title": "Implement Dark Mode",
    "description": "Add dark mode support to the application",
    "priority": "medium",
    "workflow": {
      "_id": "65f1234567890abcdef12340",
      "name": "Software Development",
      "stages": [...]
    },
    "currentStage": "65f1234567890abcdef12341",
    "assignedTo": [
      {
        "_id": "65f1234567890abcdef12342",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "createdBy": {
      "_id": "65f1234567890abcdef12343",
      "name": "Admin User",
      "email": "admin@taskflow.com"
    },
    "dueDate": "2024-04-01T00:00:00.000Z",
    "activityLog": [
      {
        "_id": "65f1234567890abcdef12344",
        "action": "created",
        "performedBy": "65f1234567890abcdef12343",
        "timestamp": "2024-03-15T10:00:00.000Z",
        "details": "Task created in stage: Backlog"
      }
    ],
    "createdAt": "2024-03-15T10:00:00.000Z",
    "updatedAt": "2024-03-15T10:00:00.000Z"
  }
}
```

---

## 2. Get All Tasks

**GET** `/api/tasks`

**Permissions:** All authenticated users (members see only assigned tasks)

**Request (No filters):**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/tasks",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**Request (With filters):**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/tasks?page=1&limit=10&priority=high&overdue=true",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `workflowId` - Filter by workflow
- `stageId` - Filter by stage
- `assignedTo` - Filter by assigned user
- `priority` - Filter by priority (low/medium/high)
- `overdue` - Filter overdue tasks (true/false)
- `search` - Search in title and description

**cURL:**
```bash
# Get all tasks
curl -X GET "http://localhost:3000/api/tasks" \
  -H "Cookie: accessToken=YOUR_TOKEN"

# Get high priority tasks
curl -X GET "http://localhost:3000/api/tasks?priority=high" \
  -H "Cookie: accessToken=YOUR_TOKEN"

# Get overdue tasks
curl -X GET "http://localhost:3000/api/tasks?overdue=true" \
  -H "Cookie: accessToken=YOUR_TOKEN"

# Search tasks
curl -X GET "http://localhost:3000/api/tasks?search=authentication" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "Implement User Authentication",
      "description": "Add JWT-based authentication",
      "priority": "high",
      "workflow": {
        "_id": "65f1234567890abcdef12340",
        "name": "Software Development"
      },
      "currentStage": "65f1234567890abcdef12341",
      "assignedTo": [...],
      "createdBy": {...},
      "dueDate": "2024-03-20T00:00:00.000Z",
      "isOverdue": false,
      "createdAt": "2024-03-15T10:00:00.000Z",
      "updatedAt": "2024-03-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

---

## 3. Get Task by ID

**GET** `/api/tasks/:id`

**Permissions:** Authenticated users with access to the task

**Request:**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/tasks/TASK_ID",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/tasks/TASK_ID" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "title": "Implement User Authentication",
    "description": "Add JWT-based authentication with refresh tokens",
    "priority": "high",
    "workflow": {
      "_id": "65f1234567890abcdef12340",
      "name": "Software Development",
      "stages": [...]
    },
    "currentStage": "65f1234567890abcdef12341",
    "assignedTo": [
      {
        "_id": "65f1234567890abcdef12342",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "createdBy": {
      "_id": "65f1234567890abcdef12343",
      "name": "Admin User",
      "email": "admin@taskflow.com"
    },
    "dueDate": "2024-03-20T00:00:00.000Z",
    "completedAt": null,
    "activityLog": [
      {
        "_id": "65f1234567890abcdef12344",
        "action": "created",
        "performedBy": {
          "_id": "65f1234567890abcdef12343",
          "name": "Admin User",
          "email": "admin@taskflow.com"
        },
        "timestamp": "2024-03-15T10:00:00.000Z",
        "details": "Task created in stage: Backlog"
      }
    ],
    "isOverdue": false,
    "createdAt": "2024-03-15T10:00:00.000Z",
    "updatedAt": "2024-03-15T10:00:00.000Z"
  }
}
```

---

## 4. Update Task

**PUT** `/api/tasks/:id`

**Permissions:** Users with modify permission

**Request:**
```json
{
  "method": "PUT",
  "url": "http://localhost:3000/api/tasks/TASK_ID",
  "headers": {
    "Content-Type": "application/json",
    "Cookie": "accessToken=YOUR_TOKEN"
  },
  "body": {
    "title": "Updated Task Title",
    "description": "Updated description",
    "priority": "high",
    "dueDate": "2024-04-15T00:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X PUT "http://localhost:3000/api/tasks/TASK_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{
    "title": "Updated Task Title",
    "priority": "high"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "title": "Updated Task Title",
    "description": "Updated description",
    "priority": "high",
    "activityLog": [
      {
        "action": "updated",
        "performedBy": "65f1234567890abcdef12343",
        "timestamp": "2024-03-15T11:00:00.000Z",
        "details": "Title updated",
        "previousValue": "Old Title",
        "newValue": "Updated Task Title"
      },
      {
        "action": "priority_changed",
        "performedBy": "65f1234567890abcdef12343",
        "timestamp": "2024-03-15T11:00:00.000Z",
        "details": "Priority changed",
        "previousValue": "medium",
        "newValue": "high"
      }
    ],
    ...
  }
}
```

---

## 5. Change Task Stage

**PATCH** `/api/tasks/:id/stage`

**Permissions:** Users with modify permission

**Request:**
```json
{
  "method": "PATCH",
  "url": "http://localhost:3000/api/tasks/TASK_ID/stage",
  "headers": {
    "Content-Type": "application/json",
    "Cookie": "accessToken=YOUR_TOKEN"
  },
  "body": {
    "stageId": "NEW_STAGE_ID"
  }
}
```

**cURL:**
```bash
curl -X PATCH "http://localhost:3000/api/tasks/TASK_ID/stage" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{
    "stageId": "NEW_STAGE_ID"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "currentStage": "65f1234567890abcdef12350",
    "activityLog": [
      {
        "action": "stage_changed",
        "performedBy": "65f1234567890abcdef12343",
        "timestamp": "2024-03-15T12:00:00.000Z",
        "details": "Stage changed from \"Backlog\" to \"In Progress\"",
        "previousValue": "Backlog",
        "newValue": "In Progress"
      }
    ],
    ...
  }
}
```

**Error Response (Invalid Transition):**
```json
{
  "success": false,
  "error": "Can only move to adjacent stages (or final stage)"
}
```

---

## 6. Assign Users to Task

**POST** `/api/tasks/:id/assign`

**Permissions:** Users with modify permission

**Request:**
```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/tasks/TASK_ID/assign",
  "headers": {
    "Content-Type": "application/json",
    "Cookie": "accessToken=YOUR_TOKEN"
  },
  "body": {
    "userIds": ["USER_ID_1", "USER_ID_2", "USER_ID_3"]
  }
}
```

**cURL:**
```bash
curl -X POST "http://localhost:3000/api/tasks/TASK_ID/assign" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{
    "userIds": ["USER_ID_1", "USER_ID_2"]
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "assignedTo": [
      {
        "_id": "USER_ID_1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      {
        "_id": "USER_ID_2",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    ],
    "activityLog": [
      {
        "action": "assigned",
        "performedBy": "65f1234567890abcdef12343",
        "timestamp": "2024-03-15T13:00:00.000Z",
        "details": "2 user(s) assigned to task"
      }
    ],
    ...
  }
}
```

---

## 7. Unassign User from Task

**DELETE** `/api/tasks/:id/assign/:userId`

**Permissions:** Users with modify permission

**Request:**
```json
{
  "method": "DELETE",
  "url": "http://localhost:3000/api/tasks/TASK_ID/assign/USER_ID",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
curl -X DELETE "http://localhost:3000/api/tasks/TASK_ID/assign/USER_ID" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "assignedTo": [
      {
        "_id": "REMAINING_USER_ID",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "activityLog": [
      {
        "action": "unassigned",
        "performedBy": "65f1234567890abcdef12343",
        "timestamp": "2024-03-15T14:00:00.000Z",
        "details": "User unassigned from task"
      }
    ],
    ...
  }
}
```

---

## 8. Get Task Statistics

**GET** `/api/tasks/stats`

**Permissions:** All authenticated users

**Request:**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/tasks/stats",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**Request (With filters):**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/tasks/stats?workflowId=WORKFLOW_ID&assignedTo=USER_ID",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
# Get all stats
curl -X GET "http://localhost:3000/api/tasks/stats" \
  -H "Cookie: accessToken=YOUR_TOKEN"

# Get stats for specific workflow
curl -X GET "http://localhost:3000/api/tasks/stats?workflowId=WORKFLOW_ID" \
  -H "Cookie: accessToken=YOUR_TOKEN"

# Get stats for specific user
curl -X GET "http://localhost:3000/api/tasks/stats?assignedTo=USER_ID" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "byPriority": [
      { "_id": "high", "count": 5 },
      { "_id": "medium", "count": 8 },
      { "_id": "low", "count": 3 }
    ],
    "byStage": [
      { "_id": "65f1234567890abcdef12341", "count": 4 },
      { "_id": "65f1234567890abcdef12342", "count": 6 },
      { "_id": "65f1234567890abcdef12343", "count": 3 }
    ],
    "overdue": [
      { "count": 2 }
    ],
    "completed": [
      { "count": 5 }
    ],
    "total": [
      { "count": 16 }
    ]
  }
}
```

---

## 9. Delete Task

**DELETE** `/api/tasks/:id`

**Permissions:** Admin or task creator only

**Request:**
```json
{
  "method": "DELETE",
  "url": "http://localhost:3000/api/tasks/TASK_ID",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
curl -X DELETE "http://localhost:3000/api/tasks/TASK_ID" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## Complete Test Flow

### 1. Setup (Run once)
```bash
cd backend
bun run seed:admin
bun run seed:user
bun run seed:workflows
bun run seed:tasks
```

### 2. Login
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taskflow.com",
    "password": "Admin@123"
  }' \
  -c cookies.txt
```

### 3. Get Workflows (to get workflow ID)
```bash
curl -X GET "http://localhost:3000/api/workflows" \
  -b cookies.txt
```

### 4. Create Task
```bash
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Test Task",
    "description": "Testing task creation",
    "priority": "medium",
    "workflowId": "WORKFLOW_ID_FROM_STEP_3",
    "dueDate": "2024-04-01T00:00:00.000Z"
  }'
```

### 5. Get All Tasks
```bash
curl -X GET "http://localhost:3000/api/tasks" \
  -b cookies.txt
```

### 6. Update Task
```bash
curl -X PUT "http://localhost:3000/api/tasks/TASK_ID" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "priority": "high"
  }'
```

### 7. Change Stage
```bash
curl -X PATCH "http://localhost:3000/api/tasks/TASK_ID/stage" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "stageId": "NEW_STAGE_ID"
  }'
```

### 8. Get Statistics
```bash
curl -X GET "http://localhost:3000/api/tasks/stats" \
  -b cookies.txt
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Not authorized to modify this task"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Task not found"
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- MongoDB ObjectIds are 24-character hexadecimal strings
- Members can only see and modify tasks assigned to them
- Managers can create tasks and modify their own tasks
- Admins have full access to all tasks
- Stage transitions must follow workflow rules
- Tasks are automatically completed when moved to final stage
- All actions are logged in the activity log
