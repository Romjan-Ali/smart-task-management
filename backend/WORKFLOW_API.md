# Workflow API Documentation

Base URL: `http://localhost:3000/api/workflows`

## Authentication

All workflow endpoints require authentication. Include the access token in cookies:
```
Cookie: accessToken=<your_jwt_token>
```

## Endpoints

### 1. Get All Workflows

**GET** `/api/workflows`

Get a paginated list of workflows. Non-admin users only see workflows they created or default workflows.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search by workflow name
- `isDefault` (optional): Filter by default status (true/false)

**Request Example:**

```sh
curl -X GET "http://localhost:3000/api/workflows?page=1&limit=10&search=dev" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

**JSON Request (for REST clients):**

```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/workflows",
  "params": {
    "page": 1,
    "limit": 10,
    "search": "dev",
    "isDefault": "true"
  }
}
```

**Response (200 OK):**

```json
{
    "success": true,
    "data": [
        {
            "_id": "698031e09198ac3d1584f688",
            "name": "Software Development",
            "description": "Standard software development lifecycle workflow",
            "stages": [
                {
                    "name": "Backlog",
                    "order": 0,
                    "color": "#6B7280",
                    "isInitial": true,
                    "isFinal": false,
                    "_id": "698031e09198ac3d1584f689"
                },
                {
                    "name": "Analysis",
                    "order": 1,
                    "color": "#3B82F6",
                    "isInitial": false,
                    "isFinal": false,
                    "_id": "698031e09198ac3d1584f68a"
                },
                {
                    "name": "Development",
                    "order": 2,
                    "color": "#8B5CF6",
                    "isInitial": false,
                    "isFinal": false,
                    "_id": "698031e09198ac3d1584f68b"
                },
                {
                    "name": "Code Review",
                    "order": 3,
                    "color": "#F59E0B",
                    "isInitial": false,
                    "isFinal": false,
                    "_id": "698031e09198ac3d1584f68c"
                },
                {
                    "name": "QA Testing",
                    "order": 4,
                    "color": "#10B981",
                    "isInitial": false,
                    "isFinal": false,
                    "_id": "698031e09198ac3d1584f68d"
                },
                {
                    "name": "Deployment",
                    "order": 5,
                    "color": "#EF4444",
                    "isInitial": false,
                    "isFinal": false,
                    "_id": "698031e09198ac3d1584f68e"
                },
                {
                    "name": "Done",
                    "order": 6,
                    "color": "#64748B",
                    "isInitial": false,
                    "isFinal": true,
                    "_id": "698031e09198ac3d1584f68f"
                }
            ],
            "isDefault": true,
            "createdBy": {
                "_id": "698031b58f5d88f2a1cffc64",
                "email": "admin@taskflow.com",
                "name": "System Administrator"
            },
            "createdAt": "2026-02-02T05:10:56.066Z",
            "updatedAt": "2026-02-02T05:10:56.066Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "pages": 1
    }
}
```

---

### 2. Get Default Workflows

**GET** `/api/workflows/default`

Get all default workflows available to all users.

**Request Example:**

```sh
curl -X GET "http://localhost:3000/api/workflows/default" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

**JSON Request:**

```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/workflows/default"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "name": "Software Development",
      "description": "Standard software development lifecycle workflow",
      "isDefault": true,
      "stages": [...],
      "createdBy": {...},
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-15T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Workflow by ID

**GET** `/api/workflows/:id`

Get a specific workflow by its ID.

**Path Parameters:**
- `id`: Workflow ID (MongoDB ObjectId)

**Request Example:**

```sh
curl -X GET "http://localhost:3000/api/workflows/65f1234567890abcdef12345" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

**JSON Request:**

```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/workflows/65f1234567890abcdef12345"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12345",
    "name": "Software Development",
    "description": "Standard software development lifecycle workflow",
    "isDefault": true,
    "stages": [
      {
        "_id": "65f1234567890abcdef12346",
        "name": "Backlog",
        "description": "Tasks waiting to be started",
        "order": 0,
        "color": "#6B7280",
        "isInitial": true,
        "isFinal": false
      }
    ],
    "createdBy": {
      "_id": "65f1234567890abcdef12340",
      "name": "Admin User",
      "email": "admin@taskflow.com"
    },
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Workflow not found
- `403 Forbidden`: Access denied to this workflow

---

### 4. Get Workflow Stages

**GET** `/api/workflows/:id/stages`

Get only the stages of a specific workflow.

**Path Parameters:**
- `id`: Workflow ID

**Request Example:**

```sh
curl -X GET "http://localhost:3000/api/workflows/65f1234567890abcdef12345/stages" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

**JSON Request:**

```json
{
  "method": "GET",
  "url": "http://localhost:3000/api/workflows/65f1234567890abcdef12345/stages"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1234567890abcdef12346",
      "name": "Backlog",
      "description": "Tasks waiting to be started",
      "order": 0,
      "color": "#6B7280",
      "isInitial": true,
      "isFinal": false
    },
    {
      "_id": "65f1234567890abcdef12347",
      "name": "Analysis",
      "order": 1,
      "color": "#3B82F6",
      "isInitial": false,
      "isFinal": false
    }
  ]
}
```

---

### 5. Create Workflow

**POST** `/api/workflows`

Create a new workflow. Requires admin or manager role.

**Request Body:**

```json
{
    "success": true,
    "data": {
        "name": "Custom Development Workflow",
        "description": "Our team's custom development process",
        "stages": [
            {
                "name": "Planning",
                "description": "Plan the work",
                "order": 0,
                "color": "#8B5CF6",
                "isInitial": true,
                "isFinal": false,
                "_id": "6980331b3fae74b22f5f6d5a"
            },
            {
                "name": "Development",
                "order": 1,
                "color": "#3B82F6",
                "isInitial": false,
                "isFinal": false,
                "_id": "6980331b3fae74b22f5f6d5b"
            },
            {
                "name": "Testing",
                "order": 2,
                "color": "#10B981",
                "isInitial": false,
                "isFinal": false,
                "_id": "6980331b3fae74b22f5f6d5c"
            },
            {
                "name": "Deployed",
                "order": 3,
                "color": "#059669",
                "isInitial": false,
                "isFinal": true,
                "_id": "6980331b3fae74b22f5f6d5d"
            }
        ],
        "isDefault": false,
        "createdBy": "698031b58f5d88f2a1cffc64",
        "_id": "6980331b3fae74b22f5f6d59",
        "createdAt": "2026-02-02T05:16:11.607Z",
        "updatedAt": "2026-02-02T05:16:11.607Z"
    }
}
```

**Request Example:**

```sh
curl -X POST "http://localhost:3000/api/workflows" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{
    "name": "Custom Development Workflow",
    "description": "Our team'\''s custom development process",
    "isDefault": false,
    "stages": [
      {
        "name": "Planning",
        "order": 0,
        "color": "#8B5CF6"
      },
      {
        "name": "Development",
        "order": 1,
        "color": "#3B82F6"
      },
      {
        "name": "Testing",
        "order": 2,
        "color": "#10B981"
      },
      {
        "name": "Deployed",
        "order": 3,
        "color": "#059669"
      }
    ]
  }'
```

**JSON Request:**

```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/workflows",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "name": "Custom Development Workflow",
    "description": "Our team's custom development process",
    "isDefault": false,
    "stages": [
      {
        "name": "Planning",
        "description": "Plan the work",
        "order": 0,
        "color": "#8B5CF6"
      },
      {
        "name": "Development",
        "order": 1,
        "color": "#3B82F6"
      },
      {
        "name": "Testing",
        "order": 2,
        "color": "#10B981"
      },
      {
        "name": "Deployed",
        "order": 3,
        "color": "#059669"
      }
    ]
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12350",
    "name": "Custom Development Workflow",
    "description": "Our team's custom development process",
    "isDefault": false,
    "stages": [
      {
        "_id": "65f1234567890abcdef12351",
        "name": "Planning",
        "description": "Plan the work",
        "order": 0,
        "color": "#8B5CF6",
        "isInitial": true,
        "isFinal": false
      },
      {
        "_id": "65f1234567890abcdef12354",
        "name": "Deployed",
        "order": 3,
        "color": "#059669",
        "isInitial": false,
        "isFinal": true
      }
    ],
    "createdBy": "65f1234567890abcdef12340",
    "createdAt": "2024-03-15T11:00:00.000Z",
    "updatedAt": "2024-03-15T11:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions (not admin/manager)
- `409 Conflict`: Workflow with this name already exists
- `400 Bad Request`: Validation errors

**Validation Rules:**
- `name`: Required, 1-100 characters, must be unique
- `description`: Optional, max 500 characters
- `stages`: Required, at least 1 stage
- `stages[].name`: Required, 1-100 characters
- `stages[].order`: Required, non-negative integer, must be unique within workflow
- `stages[].color`: Required, valid hex color code (#RGB or #RRGGBB)
- `stages[].description`: Optional, max 500 characters

---

### 6. Update Workflow

**PUT** `/api/workflows/:id`

Update an existing workflow. Requires admin role or manager who created it.

**Path Parameters:**
- `id`: Workflow ID

**Request Body (all fields optional):**

```json
{
  "name": "Updated Workflow Name",
  "description": "Updated description",
  "isDefault": false,
  "stages": [
    {
      "name": "New Stage 1",
      "order": 0,
      "color": "#8B5CF6"
    },
    {
      "name": "New Stage 2",
      "order": 1,
      "color": "#3B82F6"
    }
  ]
}
```

**Request Example:**

```sh
curl -X PUT "http://localhost:3000/api/workflows/65f1234567890abcdef12350" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{
    "name": "Updated Custom Workflow",
    "description": "Updated description",
    "stages": [
      {
        "name": "Planning",
        "order": 0,
        "color": "#8B5CF6"
      },
      {
        "name": "In Progress",
        "order": 1,
        "color": "#3B82F6"
      },
      {
        "name": "Done",
        "order": 2,
        "color": "#10B981"
      }
    ]
  }'
```

**JSON Request:**

```json
{
  "method": "PUT",
  "url": "http://localhost:3000/api/workflows/65f1234567890abcdef12350",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "name": "Updated Custom Workflow",
    "description": "Updated description",
    "stages": [
      {
        "name": "Planning",
        "order": 0,
        "color": "#8B5CF6"
      },
      {
        "name": "In Progress",
        "order": 1,
        "color": "#3B82F6"
      },
      {
        "name": "Done",
        "order": 2,
        "color": "#10B981"
      }
    ]
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12350",
    "name": "Updated Custom Workflow",
    "description": "Updated description",
    "isDefault": false,
    "stages": [...],
    "createdBy": "65f1234567890abcdef12340",
    "createdAt": "2024-03-15T11:00:00.000Z",
    "updatedAt": "2024-03-15T11:30:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Not authorized to modify this workflow
- `404 Not Found`: Workflow not found
- `409 Conflict`: Workflow name already exists

---

### 7. Delete Workflow

**DELETE** `/api/workflows/:id`

Delete a workflow. Requires admin role or manager who created it. Cannot delete default workflows.

**Path Parameters:**
- `id`: Workflow ID

**Request Example:**

```sh
curl -X DELETE "http://localhost:3000/api/workflows/65f1234567890abcdef12350" \
  -H "Cookie: accessToken=YOUR_TOKEN"
```

**JSON Request:**

```json
{
  "method": "DELETE",
  "url": "http://localhost:3000/api/workflows/65f1234567890abcdef12350"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Workflow deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Not authorized to delete this workflow
- `404 Not Found`: Workflow not found
- `400 Bad Request`: Cannot delete default workflow

---

### 8. Validate Stage Transition

**POST** `/api/workflows/:id/validate-transition`

Validate if a transition from one stage to another is allowed in the workflow.

**Path Parameters:**
- `id`: Workflow ID

**Request Body:**

```json
{
  "fromStageId": "65f1234567890abcdef12346",
  "toStageId": "65f1234567890abcdef12347"
}
```

**Request Example:**

```sh
curl -X POST "http://localhost:3000/api/workflows/65f1234567890abcdef12345/validate-transition" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=YOUR_TOKEN" \
  -d '{
    "fromStageId": "65f1234567890abcdef12346",
    "toStageId": "65f1234567890abcdef12347"
  }'
```

**JSON Request:**

```json
{
  "method": "POST",
  "url": "http://localhost:3000/api/workflows/65f1234567890abcdef12345/validate-transition",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "fromStageId": "65f1234567890abcdef12346",
    "toStageId": "65f1234567890abcdef12347"
  }
}
```

**Response (200 OK) - Valid Transition:**

```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

**Response (200 OK) - Invalid Transition:**

```json
{
  "success": false,
  "data": {
    "valid": false,
    "message": "Can only move to adjacent stages (or final stage)"
  }
}
```

**Transition Rules:**
- Can move to adjacent stages (order difference of 1)
- Can skip to final stage from any stage
- Cannot move backwards from final stage
- Both stages must exist in the workflow

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or token invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate name)
- `500 Internal Server Error`: Server error

---

## Testing with cURL

### Complete Test Flow

1. **Login to get token:**

```sh
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@taskflow.com",
    "password": "Admin@123"
  }' \
  -c cookies.txt
```

2. **Get all workflows:**

```sh
curl -X GET "http://localhost:3000/api/workflows" \
  -b cookies.txt
```

3. **Create a workflow:**

```sh
curl -X POST "http://localhost:3000/api/workflows" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "My Workflow",
    "stages": [
      {"name": "Todo", "order": 0, "color": "#6B7280"},
      {"name": "Done", "order": 1, "color": "#10B981"}
    ]
  }'
```

4. **Get workflow by ID:**

```sh
curl -X GET "http://localhost:3000/api/workflows/WORKFLOW_ID" \
  -b cookies.txt
```

5. **Update workflow:**

```sh
curl -X PUT "http://localhost:3000/api/workflows/WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Updated Workflow Name"
  }'
```

6. **Delete workflow:**

```sh
curl -X DELETE "http://localhost:3000/api/workflows/WORKFLOW_ID" \
  -b cookies.txt
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- MongoDB ObjectIds are 24-character hexadecimal strings
- Color codes must be valid hex format: `#RGB` or `#RRGGBB`
- Stage order values must be unique within a workflow
- The first stage (order 0) is automatically marked as `isInitial: true`
- The last stage is automatically marked as `isFinal: true`
- Stages are automatically sorted by order when saved