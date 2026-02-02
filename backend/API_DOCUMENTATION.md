# TaskFlow API - Complete Documentation

Version: 1.0.0  
Base URL: `http://localhost:3000`

## Table of Contents

1. [Authentication](#authentication)
2. [Workflows](#workflows)
3. [Tasks](#tasks)
4. [Notifications](#notifications)
5. [Analytics](#analytics)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

---

## Authentication

All endpoints except `/health`, `/api/auth/register`, and `/api/auth/login` require authentication.

**Authentication Method:** JWT tokens stored in HTTP-only cookies

### Endpoints

#### Register User
```
POST /api/auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "member"
}
```

#### Login
```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "admin@taskflow.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "Admin User",
      "email": "admin@taskflow.com",
      "role": "admin"
    }
  }
}
```

#### Refresh Token
```
POST /api/auth/refresh
```

#### Logout
```
POST /api/auth/logout
```

#### Get Current User
```
GET /api/auth/me
```

---

## Workflows

Dynamic workflow management with custom stages.

### Endpoints

#### Get All Workflows
```
GET /api/workflows?page=1&limit=20&search=dev&isDefault=true
```

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `search` - Search by name
- `isDefault` - Filter default workflows

#### Get Default Workflows
```
GET /api/workflows/default
```

#### Get Workflow by ID
```
GET /api/workflows/:id
```

#### Get Workflow Stages
```
GET /api/workflows/:id/stages
```

#### Create Workflow (Admin/Manager)
```
POST /api/workflows
```

**Body:**
```json
{
  "name": "Custom Workflow",
  "description": "Description",
  "isDefault": false,
  "stages": [
    {
      "name": "Todo",
      "description": "Tasks to do",
      "order": 0,
      "color": "#6B7280"
    },
    {
      "name": "Done",
      "order": 1,
      "color": "#10B981"
    }
  ]
}
```

#### Update Workflow (Admin/Manager)
```
PUT /api/workflows/:id
```

#### Delete Workflow (Admin/Manager)
```
DELETE /api/workflows/:id
```

#### Validate Stage Transition
```
POST /api/workflows/:id/validate-transition
```

**Body:**
```json
{
  "fromStageId": "...",
  "toStageId": "..."
}
```

---

## Tasks

Complete task management with activity logging.

### Endpoints

#### Get All Tasks
```
GET /api/tasks?page=1&limit=20&priority=high&overdue=true&search=auth
```

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `workflowId` - Filter by workflow
- `stageId` - Filter by stage
- `assignedTo` - Filter by user
- `priority` - Filter by priority (low/medium/high)
- `overdue` - Filter overdue tasks (true/false)
- `search` - Search in title/description

#### Get Task Statistics
```
GET /api/tasks/stats?workflowId=...&assignedTo=...
```

#### Get Task by ID
```
GET /api/tasks/:id
```

#### Create Task (Admin/Manager)
```
POST /api/tasks
```

**Body:**
```json
{
  "title": "Implement Feature X",
  "description": "Detailed description",
  "priority": "high",
  "workflowId": "...",
  "assignedTo": ["userId1", "userId2"],
  "dueDate": "2024-04-01T00:00:00.000Z"
}
```

#### Update Task
```
PUT /api/tasks/:id
```

**Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "medium",
  "assignedTo": ["userId1"],
  "dueDate": "2024-04-15T00:00:00.000Z"
}
```

#### Change Task Stage
```
PATCH /api/tasks/:id/stage
```

**Body:**
```json
{
  "stageId": "..."
}
```

**Validation Rules:**
- Can move to adjacent stages (order difference of 1)
- Can skip to final stage from any stage
- Cannot move backwards from final stage

#### Assign Users to Task
```
POST /api/tasks/:id/assign
```

**Body:**
```json
{
  "userIds": ["userId1", "userId2"]
}
```

#### Unassign User from Task
```
DELETE /api/tasks/:id/assign/:userId
```

#### Delete Task (Admin/Creator)
```
DELETE /api/tasks/:id
```

---

## Notifications

Automatic notification system for task events.

### Notification Types

- `task_assigned` - User assigned to task
- `task_completed` - Task completed
- `task_stage_changed` - Stage transition
- `task_due_soon` - Due within 24 hours
- `task_overdue` - Past due date
- `mention` - User mentioned (future)
- `comment` - New comment (future)

### Endpoints

#### Get Notifications
```
GET /api/notifications?page=1&limit=20&unreadOnly=true
```

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `unreadOnly` - Show only unread (true/false)

#### Get Unread Count
```
GET /api/notifications/unread-count
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

#### Mark Notification as Read
```
PATCH /api/notifications/:id/read
```

#### Mark All as Read
```
PATCH /api/notifications/read-all
```

**Response:**
```json
{
  "success": true,
  "message": "Marked 5 notifications as read",
  "data": {
    "modifiedCount": 5
  }
}
```

#### Delete Notification
```
DELETE /api/notifications/:id
```

---

## Analytics

Comprehensive analytics with MongoDB aggregations.

### Endpoints

#### Dashboard Statistics
```
GET /api/analytics/dashboard?workflowId=...&userId=...&startDate=...&endDate=...
```

**Query Parameters:**
- `workflowId` - Filter by workflow
- `userId` - Filter by user
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasksByStage": [
      { "stageName": "In Progress", "count": 5, "stageId": "..." }
    ],
    "tasksByPriority": [
      { "priority": "high", "count": 4 }
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

#### Workflow Efficiency
```
GET /api/analytics/workflow-efficiency?workflowId=...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "workflowId": "...",
      "workflowName": "Software Development",
      "totalTasks": 25,
      "completedTasks": 15,
      "avgCompletionTime": 345600000,
      "stageDistribution": [
        { "stageName": "Backlog", "count": 5 }
      ],
      "completionRate": 60
    }
  ]
}
```

#### User Performance
```
GET /api/analytics/user-performance?userId=...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "...",
      "userName": "John Doe",
      "tasksAssigned": 12,
      "tasksCompleted": 8,
      "avgCompletionTime": 259200000,
      "overdueCount": 1,
      "completionRate": 66.67,
      "tasksByPriority": [
        { "priority": "high", "count": 4 }
      ]
    }
  ]
}
```

#### Tasks Per Stage
```
GET /api/analytics/workflow/:workflowId/stages
```

#### Completion Time Trends
```
GET /api/analytics/completion-trends?days=30
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-03-01",
      "avgCompletionTime": 259200000,
      "count": 3
    }
  ]
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 500 | Internal Server Error | Server error |

### Common Errors

#### Authentication Errors
```json
{
  "success": false,
  "error": "No token provided"
}
```

```json
{
  "success": false,
  "error": "Token expired"
}
```

#### Validation Errors
```json
{
  "success": false,
  "error": "Title is required"
}
```

#### Permission Errors
```json
{
  "success": false,
  "error": "Not authorized to modify this task"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Recommended for production:

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.use('/api/', limiter)
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## Filtering & Search

### Task Filtering

```
GET /api/tasks?workflowId=...&stageId=...&priority=high&overdue=true&search=auth
```

### Workflow Filtering

```
GET /api/workflows?search=dev&isDefault=true
```

---

## Data Formats

### Dates
All dates are in ISO 8601 format (UTC):
```
2024-03-15T10:00:00.000Z
```

### ObjectIds
MongoDB ObjectIds are 24-character hexadecimal strings:
```
65f1234567890abcdef12345
```

### Time Durations
Completion times are in milliseconds:
- 86400000 ms = 1 day
- 259200000 ms = 3 days
- 604800000 ms = 7 days

---

## Role-Based Access

### Admin
- Full access to all resources
- Can create/modify/delete workflows
- Can create/modify/delete tasks
- Can view all analytics
- Can manage all users

### Manager
- Can create tasks
- Can modify own tasks
- Can create/modify own workflows
- Can view all tasks
- Can view all analytics
- Cannot delete other users' resources

### Member
- Can view assigned tasks only
- Can modify assigned tasks only
- Can view default workflows
- Can view own performance metrics
- Cannot create workflows or tasks

---

## Automation Rules

### Automatic Actions

1. **Task Completion:**
   - Trigger: Task moved to final stage
   - Action: Set `completedAt`, notify users

2. **Task Assignment:**
   - Trigger: User assigned to task
   - Action: Notify assigned user

3. **Stage Change:**
   - Trigger: Task stage changed
   - Action: Notify assigned users

### Scheduled Jobs (Ready for Implementation)

4. **Overdue Check:**
   - Schedule: Daily at 9 AM
   - Action: Notify users of overdue tasks

5. **Due Soon Check:**
   - Schedule: Daily at 9 AM
   - Action: Notify users of tasks due within 24 hours

---

## Best Practices

### Creating Tasks
1. Always use valid workflow IDs
2. Validate user IDs before assignment
3. Set realistic due dates
4. Use appropriate priority levels

### Stage Transitions
1. Follow workflow order
2. Validate transitions before applying
3. Check activity log for history

### Notifications
1. Mark as read after viewing
2. Delete old notifications periodically
3. Check unread count regularly

### Analytics
1. Use date filters for specific periods
2. Filter by workflow for focused metrics
3. Monitor completion rates
4. Track overdue tasks

---

## Security Considerations

### Production Checklist

- [ ] Change all default secrets
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use environment variables
- [ ] Regular security audits
- [ ] Keep dependencies updated

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## Performance Tips

### Database
- Use indexes for frequent queries
- Limit result sets with pagination
- Use aggregation pipelines for analytics
- Monitor slow queries

### API
- Use pagination for large datasets
- Implement caching (Redis)
- Optimize populate operations
- Use lean() for read-only queries

### Frontend
- Cache static data (workflows)
- Implement optimistic updates
- Use RTK Query for state management
- Debounce search inputs

---

## Monitoring

### Health Check
```
GET /health
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-03-15T10:00:00.000Z",
  "service": "TaskFlow API",
  "environment": "production",
  "uptime": 3600
}
```

### Logging

All requests are logged with Morgan:
- Development: `dev` format
- Production: `combined` format

---

## Support

For issues and questions:
- Check documentation files
- Review API examples
- Test with provided seed data
- Check server logs

---

**Last Updated:** 2024-03-15  
**API Version:** 1.0.0  
**Documentation Version:** 1.0.0
