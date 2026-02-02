# Phase 4 API - JSON Request Scripts

## Notification API

Base URL: `http://localhost:3000/api/notifications`

### 1. Get Notifications

**GET** `/api/notifications`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `unreadOnly` - Show only unread (true/false)

**Request:**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/notifications?page=1&limit=10",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
# Get all notifications
curl -X GET "http://localhost:3000/api/notifications" \
  -b cookies.txt

# Get only unread notifications
curl -X GET "http://localhost:3000/api/notifications?unreadOnly=true" \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "recipient": "65f1234567890abcdef12340",
      "type": "task_assigned",
      "title": "New Task Assigned",
      "message": "You have been assigned to task: \"Implement Dark Mode\"",
      "task": {
        "_id": "65f1234567890abcdef12350",
        "title": "Implement Dark Mode"
      },
      "workflow": {
        "_id": "65f1234567890abcdef12360",
        "name": "Software Development"
      },
      "triggeredBy": {
        "_id": "65f1234567890abcdef12370",
        "name": "Admin User",
        "email": "admin@taskflow.com"
      },
      "isRead": false,
      "createdAt": "2024-03-15T10:00:00.000Z",
      "updatedAt": "2024-03-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  },
  "unreadCount": 3
}
```

---

### 2. Get Unread Count

**GET** `/api/notifications/unread-count`

**Request:**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/notifications/unread-count",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/notifications/unread-count" \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 3
  }
}
```

---

### 3. Mark Notification as Read

**PATCH** `/api/notifications/:id/read`

**Request:**
```json
{
  "method": "PATCH",
  "url": "http://localhost:3000/api/notifications/NOTIFICATION_ID/read",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
curl -X PATCH "http://localhost:3000/api/notifications/NOTIFICATION_ID/read" \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "isRead": true,
    "readAt": "2024-03-15T11:00:00.000Z",
    ...
  }
}
```

---

### 4. Mark All as Read

**PATCH** `/api/notifications/read-all`

**Request:**
```json
{
  "method": "PATCH",
  "url": "http://localhost:3000/api/notifications/read-all",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
curl -X PATCH "http://localhost:3000/api/notifications/read-all" \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Marked 3 notifications as read",
  "data": {
    "modifiedCount": 3
  }
}
```

---

### 5. Delete Notification

**DELETE** `/api/notifications/:id`

**Request:**
```json
{
  "method": "DELETE",
  "url": "http://localhost:3000/api/notifications/NOTIFICATION_ID",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
curl -X DELETE "http://localhost:3000/api/notifications/NOTIFICATION_ID" \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## Analytics API

Base URL: `http://localhost:3000/api/analytics`

### 1. Get Dashboard Statistics

**GET** `/api/analytics/dashboard`

**Query Parameters:**
- `workflowId` - Filter by workflow
- `userId` - Filter by user
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)

**Request:**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/analytics/dashboard",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**Request (With filters):**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/analytics/dashboard?workflowId=WORKFLOW_ID&startDate=2024-03-01T00:00:00.000Z",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
# Get all stats
curl -X GET "http://localhost:3000/api/analytics/dashboard" \
  -b cookies.txt

# Get stats for specific workflow
curl -X GET "http://localhost:3000/api/analytics/dashboard?workflowId=WORKFLOW_ID" \
  -b cookies.txt

# Get stats for date range
curl -X GET "http://localhost:3000/api/analytics/dashboard?startDate=2024-03-01T00:00:00.000Z&endDate=2024-03-31T23:59:59.999Z" \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tasksByStage": [
      {
        "stageName": "In Progress",
        "count": 5,
        "stageId": "65f1234567890abcdef12345"
      },
      {
        "stageName": "Backlog",
        "count": 3,
        "stageId": "65f1234567890abcdef12346"
      },
      {
        "stageName": "Done",
        "count": 8,
        "stageId": "65f1234567890abcdef12347"
      }
    ],
    "tasksByPriority": [
      { "priority": "high", "count": 4 },
      { "priority": "medium", "count": 6 },
      { "priority": "low", "count": 2 }
    ],
    "overdueCount": 2,
    "completedCount": 8,
    "totalTasks": 15,
    "avgCompletionTime": 259200000,
    "tasksDueToday": 1,
    "tasksDueThisWeek": 3
  }
}
```

**Note:** `avgCompletionTime` is in milliseconds (259200000 ms = 3 days)

---

### 2. Get Workflow Efficiency

**GET** `/api/analytics/workflow-efficiency`

**Query Parameters:**
- `workflowId` - Filter by specific workflow (optional)

**Request:**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/analytics/workflow-efficiency",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
# Get all workflows
curl -X GET "http://localhost:3000/api/analytics/workflow-efficiency" \
  -b cookies.txt

# Get specific workflow
curl -X GET "http://localhost:3000/api/analytics/workflow-efficiency?workflowId=WORKFLOW_ID" \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "workflowId": "65f1234567890abcdef12345",
      "workflowName": "Software Development",
      "totalTasks": 25,
      "completedTasks": 15,
      "avgCompletionTime": 345600000,
      "stageDistribution": [
        { "stageName": "Backlog", "count": 5 },
        { "stageName": "In Progress", "count": 8 },
        { "stageName": "Code Review", "count": 2 },
        { "stageName": "Done", "count": 10 }
      ],
      "completionRate": 60
    },
    {
      "workflowId": "65f1234567890abcdef12346",
      "workflowName": "Bug Fixing",
      "totalTasks": 12,
      "completedTasks": 8,
      "avgCompletionTime": 172800000,
      "stageDistribution": [
        { "stageName": "Reported", "count": 2 },
        { "stageName": "Investigating", "count": 2 },
        { "stageName": "Verified", "count": 8 }
      ],
      "completionRate": 66.67
    }
  ]
}
```

---

### 3. Get User Performance

**GET** `/api/analytics/user-performance`

**Query Parameters:**
- `userId` - Filter by specific user (optional, members can only see their own)

**Request:**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/analytics/user-performance",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
# Get all users (admin/manager only)
curl -X GET "http://localhost:3000/api/analytics/user-performance" \
  -b cookies.txt

# Get specific user
curl -X GET "http://localhost:3000/api/analytics/user-performance?userId=USER_ID" \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "userId": "65f1234567890abcdef12340",
      "userName": "John Doe",
      "tasksAssigned": 12,
      "tasksCompleted": 8,
      "avgCompletionTime": 259200000,
      "overdueCount": 1,
      "completionRate": 66.67,
      "tasksByPriority": [
        { "priority": "high", "count": 4 },
        { "priority": "medium", "count": 6 },
        { "priority": "low", "count": 2 }
      ]
    },
    {
      "userId": "65f1234567890abcdef12341",
      "userName": "Jane Smith",
      "tasksAssigned": 8,
      "tasksCompleted": 7,
      "avgCompletionTime": 172800000,
      "overdueCount": 0,
      "completionRate": 87.5,
      "tasksByPriority": [
        { "priority": "high", "count": 3 },
        { "priority": "medium", "count": 4 },
        { "priority": "low", "count": 1 }
      ]
    }
  ]
}
```

---

### 4. Get Tasks Per Stage

**GET** `/api/analytics/workflow/:workflowId/stages`

**Path Parameters:**
- `workflowId` - Workflow ID

**Request:**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/analytics/workflow/WORKFLOW_ID/stages",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/analytics/workflow/WORKFLOW_ID/stages" \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "workflowId": "65f1234567890abcdef12345",
    "workflowName": "Software Development",
    "stages": [
      {
        "stageId": "65f1234567890abcdef12346",
        "stageName": "Backlog",
        "order": 0,
        "taskCount": 5
      },
      {
        "stageId": "65f1234567890abcdef12347",
        "stageName": "In Progress",
        "order": 1,
        "taskCount": 8
      },
      {
        "stageId": "65f1234567890abcdef12348",
        "stageName": "Done",
        "order": 6,
        "taskCount": 12
      }
    ]
  }
}
```

---

### 5. Get Completion Time Trends

**GET** `/api/analytics/completion-trends`

**Query Parameters:**
- `days` - Number of days to analyze (default: 30)

**Request:**
```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/analytics/completion-trends?days=30",
  "headers": {
    "Cookie": "accessToken=YOUR_TOKEN"
  }
}
```

**cURL:**
```bash
# Get last 30 days
curl -X GET "http://localhost:3000/api/analytics/completion-trends" \
  -b cookies.txt

# Get last 7 days
curl -X GET "http://localhost:3000/api/analytics/completion-trends?days=7" \
  -b cookies.txt
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-03-01",
      "avgCompletionTime": 259200000,
      "count": 3
    },
    {
      "date": "2024-03-02",
      "avgCompletionTime": 345600000,
      "count": 2
    },
    {
      "date": "2024-03-03",
      "avgCompletionTime": 172800000,
      "count": 5
    }
  ]
}
```

---

## Complete Test Flow

### 1. Setup & Login
```bash
cd backend
bun run seed:all
bun run dev

# In another terminal
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@taskflow.com", "password": "Admin@123"}' \
  -c cookies.txt
```

### 2. Create Task (Triggers Notifications)
```bash
# Get workflow ID first
curl -X GET "http://localhost:3000/api/workflows" -b cookies.txt

# Create task with assignment
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Test Notification",
    "workflowId": "REAL_WORKFLOW_ID",
    "assignedTo": ["USER_ID"],
    "priority": "high"
  }'
```

### 3. Check Notifications
```bash
# Get all notifications
curl -X GET "http://localhost:3000/api/notifications" -b cookies.txt

# Get unread count
curl -X GET "http://localhost:3000/api/notifications/unread-count" -b cookies.txt
```

### 4. Change Task Stage (Triggers More Notifications)
```bash
curl -X PATCH "http://localhost:3000/api/tasks/TASK_ID/stage" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"stageId": "NEXT_STAGE_ID"}'
```

### 5. View Dashboard Analytics
```bash
curl -X GET "http://localhost:3000/api/analytics/dashboard" -b cookies.txt
```

### 6. View Workflow Efficiency
```bash
curl -X GET "http://localhost:3000/api/analytics/workflow-efficiency" -b cookies.txt
```

### 7. View User Performance
```bash
curl -X GET "http://localhost:3000/api/analytics/user-performance" -b cookies.txt
```

### 8. Mark Notifications as Read
```bash
# Mark single notification
curl -X PATCH "http://localhost:3000/api/notifications/NOTIFICATION_ID/read" -b cookies.txt

# Mark all as read
curl -X PATCH "http://localhost:3000/api/notifications/read-all" -b cookies.txt
```

---

## Automation Triggers

### Automatic Notifications

1. **Task Assignment:**
   - Trigger: User assigned to task
   - Recipients: Newly assigned users
   - Type: `task_assigned`

2. **Stage Change:**
   - Trigger: Task stage changed
   - Recipients: All assigned users
   - Type: `task_stage_changed`

3. **Task Completion:**
   - Trigger: Task moved to final stage
   - Recipients: All assigned users
   - Type: `task_completed`
   - Additional: Sets `completedAt` timestamp

### Scheduled Notifications (Future)

These are ready for cron job integration:

4. **Overdue Tasks:**
   - Trigger: Daily cron job
   - Recipients: Assigned users
   - Type: `task_overdue`

5. **Tasks Due Soon:**
   - Trigger: Daily cron job
   - Recipients: Assigned users
   - Type: `task_due_soon`

---

## Analytics Metrics Explained

### Average Completion Time
Time in milliseconds from task creation to completion.

**Conversion:**
- 86400000 ms = 1 day
- 259200000 ms = 3 days
- 604800000 ms = 7 days

### Completion Rate
Percentage of completed tasks out of total tasks.

**Formula:** `(completedTasks / totalTasks) * 100`

### Stage Distribution
Number of tasks currently in each stage of a workflow.

### Overdue Count
Tasks past their due date that are not yet completed.

---

## Error Responses

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
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Notification not found"
}
```

---

## Notes

- Notifications are automatically created by the system
- Users can only see their own notifications
- Members can only see their own performance metrics
- Admins and managers can see all analytics
- Notifications auto-delete after 30 days
- All timestamps are in ISO 8601 format (UTC)
- Completion times are in milliseconds
