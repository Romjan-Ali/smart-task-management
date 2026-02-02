# API Testing Guide

Base URL: `http://localhost:3000/api`

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "member"
}
```

**Response (201):**

```json
{
    "success": true,
    "data": {
        "user": {
            "id": "6980228e9b3e5dbd7d1c6b80",
            "email": "user@example.com",
            "name": "John Doe",
            "role": "member",
            "createdAt": "2026-02-02T04:05:34.979Z"
        }
    }
}
```

**Notes:**
- `role` is optional, defaults to "member"
- Valid roles: "admin", "manager", "member"
- Tokens are set in HTTP-only cookies

---

### 2. Login
**POST** `/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
    "success": true,
    "data": {
        "user": {
            "id": "6980228e9b3e5dbd7d1c6b80",
            "email": "user@example.com",
            "name": "John Doe",
            "role": "member",
            "lastLoginAt": "2026-02-02T04:06:56.140Z"
        }
    }
}
```

**Notes:**
- Tokens are set in HTTP-only cookies
- Updates lastLoginAt timestamp

---

### 3. Refresh Token
**POST** `/auth/refresh`

**Request Body:**

```json
{}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Tokens refreshed successfully"
}
```

**Notes:**
- Reads refresh token from cookies
- Sets new access and refresh tokens in cookies
- No request body needed

---

### 4. Logout
**POST** `/auth/logout`

**Request Body:**

```json
{}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Notes:**
- Clears all authentication cookies
- Removes refresh token from database

---

### 5. Get Profile (Protected)
**GET** `/auth/profile`

**Headers:**
```
Cookie: accessToken=<your-access-token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "member",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Notes:**
- Requires authentication (access token in cookies)
- Returns user profile without password and refresh token

---

### 6. Update Profile (Protected)
**PATCH** `/auth/profile`

**Headers:**
```
Cookie: accessToken=<your-access-token>
```

**Request Body:**

```json
{
  "name": "Jane Doe"
}
```

**Response (200):**

```json
{
    "success": true,
    "data": {
        "_id": "6980228e9b3e5dbd7d1c6b80",
        "email": "user@example.com",
        "name": "Jane Doe",
        "role": "member",
        "isActive": true,
        "createdAt": "2026-02-02T04:05:34.979Z",
        "updatedAt": "2026-02-02T04:11:16.231Z",
        "lastLoginAt": "2026-02-02T04:09:57.104Z"
    }
}
```

**Notes:**
- Requires authentication (access token in cookies)
- Only name can be updated

---

## Testing with cURL

### Register

```sh
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "member"
  }' \
  -c cookies.txt
```

### Login

```sh
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

### Get Profile

```sh
curl -X GET http://localhost:3000/api/auth/profile \
  -b cookies.txt
```

### Update Profile

```sh
curl -X PATCH http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }' \
  -b cookies.txt
```

### Refresh Token

```sh
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

### Logout

```sh
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## Testing with Postman/Thunder Client

1. **Enable Cookie Handling:**
   - Postman: Settings → General → Enable "Automatically follow redirects" and "Send cookies"
   - Thunder Client: Cookies are handled automatically

2. **Test Flow:**
   1. Register a new user
   2. Login with credentials
   3. Get profile (cookies are sent automatically)
   4. Update profile
   5. Refresh token
   6. Logout

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
  "error": "No token provided"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Account is disabled"
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "User not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "error": "User already exists"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error"
}
```