# TaskFlow API - Smart Task & Workflow Management System

A comprehensive workflow-driven task management system with role-based access control, automation, and analytics.

## 🚀 Features

### Core Features
- ✅ **Dynamic Workflow Engine** - Configurable workflows with custom stages
- ✅ **Task Management** - Complete CRUD with activity logging
- ✅ **Role-Based Access Control** - Admin, Manager, Member roles
- ✅ **Automation** - Auto-completion and notifications
- ✅ **Analytics** - Dashboard statistics and performance metrics
- ✅ **Notifications** - Real-time notification system

### Technical Features
- ✅ JWT Authentication (Access + Refresh tokens)
- ✅ Cookie-based token storage
- ✅ MongoDB aggregation pipelines
- ✅ TypeScript type safety
- ✅ Zod validation
- ✅ Activity logging
- ✅ Permission-based access
- ✅ Pagination & filtering
- ✅ Search functionality

## 📋 Tech Stack

- **Runtime:** Bun 1.3+
- **Framework:** Express.js 5.x
- **Language:** TypeScript 5.x
- **Database:** MongoDB 7.x + Mongoose 9.x
- **Validation:** Zod 4.x
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, bcryptjs

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   └── env.ts       # Environment variables
│   ├── constants/       # Constants and enums
│   │   └── roles.ts     # User roles
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── workflow.controller.ts
│   │   ├── task.controller.ts
│   │   ├── notification.controller.ts
│   │   └── analytics.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   ├── models/          # Mongoose models
│   │   ├── User.ts
│   │   ├── Workflow.ts
│   │   ├── Task.ts
│   │   └── Notification.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── workflow.routes.ts
│   │   ├── task.routes.ts
│   │   ├── notification.routes.ts
│   │   └── analytics.routes.ts
│   ├── schemas/         # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   ├── workflow.schema.ts
│   │   └── task.schema.ts
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   ├── token.service.ts
│   │   ├── workflow.service.ts
│   │   ├── task.service.ts
│   │   ├── automation.service.ts
│   │   └── analytics.service.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── AppError.ts
│   │   ├── cookie.util.ts
│   │   ├── handler.ts
│   │   └── validation.util.ts
│   └── app.ts           # Express app setup
├── scripts/             # Seed scripts
│   ├── seedAdmin.ts
│   ├── seedUsers.ts
│   ├── seedWorkflows.ts
│   ├── seedTasks.ts
│   └── seedNotifications.ts
├── tests/               # Unit tests
│   └── workflow.service.test.ts
├── .env.example         # Environment variables template
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## 🛠️ Installation

### Prerequisites

- **Bun** 1.3 or higher ([Install Bun](https://bun.sh))
- **MongoDB** 7.0 or higher
- **Node.js** 18+ (for TypeScript)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/taskflow
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   COOKIE_SECRET=your-super-secret-cookie-key-change-this
   ```

4. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0

   # Or use local MongoDB installation
   mongod
   ```

5. **Seed the database:**
   ```bash
   bun run seed:all
   ```

6. **Start the development server:**
   ```bash
   bun run dev
   ```

   Server will start on `http://localhost:3000`

### Docker Setup

1. **Using Docker Compose (Recommended):**
   ```bash
   # Start all services
   docker-compose up -d

   # View logs
   docker-compose logs -f

   # Stop services
   docker-compose down
   ```

2. **Build and run manually:**
   ```bash
   # Build image
   docker build -t taskflow-api .

   # Run container
   docker run -p 3000:3000 --env-file .env taskflow-api
   ```

## 📝 Available Scripts

```bash
# Development
bun run dev              # Start dev server with hot reload
bun run build            # Build for production
bun run start            # Start production server
bun run type-check       # Run TypeScript type checking

# Database Seeding
bun run seed:admin       # Seed admin user
bun run seed:user        # Seed manager & member users
bun run seed:workflows   # Seed default workflows
bun run seed:tasks       # Seed sample tasks
bun run seed:notifications # Seed sample notifications
bun run seed:all         # Seed everything

# Utilities
bun run clean            # Clean build artifacts
```

## 🔐 Default Credentials

After seeding, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskflow.com | Admin@123 |
| Manager | manager@taskflow.com | Manager@123 |
| Member | member@taskflow.com | Member@123 |

## 🎯 API Endpoints

### Authentication (`/api/auth`)
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
POST   /api/auth/refresh         - Refresh access token
POST   /api/auth/logout          - Logout user
GET    /api/auth/me              - Get current user
```

### Workflows (`/api/workflows`)
```
GET    /api/workflows            - Get all workflows
GET    /api/workflows/default    - Get default workflows
GET    /api/workflows/:id        - Get workflow by ID
GET    /api/workflows/:id/stages - Get workflow stages
POST   /api/workflows            - Create workflow (admin/manager)
PUT    /api/workflows/:id        - Update workflow (admin/manager)
DELETE /api/workflows/:id        - Delete workflow (admin/manager)
POST   /api/workflows/:id/validate-transition - Validate stage transition
```

### Tasks (`/api/tasks`)
```
GET    /api/tasks                - Get all tasks
GET    /api/tasks/stats          - Get task statistics
GET    /api/tasks/:id            - Get task by ID
POST   /api/tasks                - Create task (admin/manager)
PUT    /api/tasks/:id            - Update task
PATCH  /api/tasks/:id/stage      - Change task stage
POST   /api/tasks/:id/assign     - Assign users to task
DELETE /api/tasks/:id/assign/:userId - Unassign user from task
DELETE /api/tasks/:id            - Delete task
```

### Notifications (`/api/notifications`)
```
GET    /api/notifications        - Get user's notifications
GET    /api/notifications/unread-count - Get unread count
PATCH  /api/notifications/:id/read - Mark notification as read
PATCH  /api/notifications/read-all - Mark all as read
DELETE /api/notifications/:id    - Delete notification
```

### Analytics (`/api/analytics`)
```
GET /api/analytics/dashboard                  - Dashboard statistics
GET /api/analytics/workflow-efficiency        - Workflow efficiency metrics
GET /api/analytics/user-performance           - User performance metrics
GET /api/analytics/workflow/:workflowId/stages - Tasks per stage
GET /api/analytics/completion-trends          - Completion time trends
```

## 📚 Documentation

- **[API_TESTING.md](./API_TESTING.md)** - Authentication API examples
- **[WORKFLOW_API.md](./WORKFLOW_API.md)** - Workflow API documentation
- **[TASK_API_REQUESTS.md](./TASK_API_REQUESTS.md)** - Task API with JSON examples
- **[PHASE4_API_REQUESTS.md](./PHASE4_API_REQUESTS.md)** - Notifications & Analytics API
- **[PHASE2_FIXES.md](./PHASE2_FIXES.md)** - Phase 2 implementation details
- **[PHASE3_COMPLETE.md](./PHASE3_COMPLETE.md)** - Phase 3 implementation details
- **[PHASE4_COMPLETE.md](./PHASE4_COMPLETE.md)** - Phase 4 implementation details

## 🧪 Testing

### Manual Testing with cURL

1. **Login:**
   ```bash
   curl -X POST "http://localhost:3000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@taskflow.com", "password": "Admin@123"}' \
     -c cookies.txt
   ```

2. **Get workflows:**
   ```bash
   curl -X GET "http://localhost:3000/api/workflows" -b cookies.txt
   ```

3. **Create task:**
   ```bash
   curl -X POST "http://localhost:3000/api/tasks" \
     -H "Content-Type: application/json" \
     -b cookies.txt \
     -d '{
       "title": "Test Task",
       "workflowId": "WORKFLOW_ID",
       "priority": "medium"
     }'
   ```

4. **Get dashboard stats:**
   ```bash
   curl -X GET "http://localhost:3000/api/analytics/dashboard" -b cookies.txt
   ```

### Using Thunder Client / Postman

Import the collection from [`thunder-collection.json`](./thunder-collection.json)

## 🏗️ Architecture

### Authentication Flow
```
Client → Login → JWT Token → Cookie → Authenticated Requests
                    ↓
              Refresh Token (7 days)
                    ↓
              New Access Token (15 min)
```

### Task Workflow Flow
```
Create Task → Initial Stage → Stage Transitions → Final Stage → Auto-Complete
                                    ↓
                              Validation Rules
                                    ↓
                              Activity Logging
                                    ↓
                              Notifications
```

### Automation Flow
```
Task Event (Stage Change, Assignment, etc.)
    ↓
Automation Service
    ↓
Create Notifications
    ↓
Notify Users
```

## 🔒 Security

- **JWT Authentication** - Secure token-based auth
- **HTTP-only Cookies** - Prevents XSS attacks
- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **bcryptjs** - Password hashing
- **Input Validation** - Zod schema validation
- **Role-Based Access** - Permission checking

## 🎭 User Roles & Permissions

### Admin
- Full access to all resources
- Can create/modify/delete workflows
- Can create/modify/delete tasks
- Can view all analytics

### Manager
- Can create tasks
- Can modify own tasks
- Can create/modify own workflows
- Can view all tasks
- Can view all analytics

### Member
- Can view assigned tasks
- Can modify assigned tasks
- Can view default workflows
- Can view own performance metrics

## 📊 Database Schema

### Collections
- **users** - User accounts with roles
- **workflows** - Dynamic workflow definitions
- **tasks** - Tasks with activity logs
- **notifications** - User notifications

### Relationships
```
User ←→ Task (creator, assignedTo)
Workflow ←→ Task (workflow stages)
User ←→ Notification (recipient)
Task ←→ Notification (related task)
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/taskflow |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_REFRESH_SECRET` | Refresh token secret | (required) |
| `JWT_EXPIRES_IN` | Access token expiry | 15m |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 7d |
| `COOKIE_SECRET` | Cookie signing secret | (required) |

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# 1. Create .env file
cp .env.example .env

# 2. Start services
docker-compose up -d

# 3. Check logs
docker-compose logs -f backend

# 4. Seed database (one-time)
docker-compose exec backend bun run seed:all

# 5. Access API
curl http://localhost:3000/health
```

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart backend
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build

# Remove volumes (clean database)
docker-compose down -v
```

## 📈 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Paginated Response
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

## 🧪 Testing

### Run Type Checking
```bash
bun run type-check
```

### Run Unit Tests
```bash
bun test
```

### Manual API Testing

See documentation files:
- [TASK_API_REQUESTS.md](./TASK_API_REQUESTS.md) - Task API examples
- [PHASE4_API_REQUESTS.md](./PHASE4_API_REQUESTS.md) - Notifications & Analytics

## 🚦 Development Workflow

1. **Start development server:**
   ```bash
   bun run dev
   ```

2. **Make changes** - Server auto-reloads

3. **Check types:**
   ```bash
   bun run type-check
   ```

4. **Test endpoints** - Use Thunder Client or cURL

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

## 📦 Production Deployment

### Using Docker

```bash
# Build production image
docker build -t taskflow-api:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name taskflow-api \
  taskflow-api:latest
```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start bun --name taskflow-api -- run start

# View logs
pm2 logs taskflow-api

# Restart
pm2 restart taskflow-api

# Stop
pm2 stop taskflow-api
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong secrets for JWT and cookies
3. Configure MongoDB connection string
4. Set up CORS allowed origins
5. Enable HTTPS in production

## 🔍 Troubleshooting

### MongoDB Connection Error
```bash
# Check MongoDB is running
docker ps | grep mongo

# Or check local MongoDB
mongosh
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001

# Or kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### TypeScript Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
bun install
bun run type-check
```

### Seed Errors
```bash
# Seed in correct order
bun run seed:admin
bun run seed:user
bun run seed:workflows
bun run seed:tasks
bun run seed:notifications
```

## 📊 Performance

- **Indexes:** Optimized MongoDB indexes on all collections
- **Aggregations:** Efficient MongoDB aggregation pipelines
- **Pagination:** Server-side pagination for large datasets
- **Caching:** Ready for Redis integration
- **Connection Pooling:** MongoDB connection pooling enabled

## 🔄 API Versioning

Current version: `v1` (implicit)

Future versions can be added:
```typescript
app.use('/api/v1/tasks', taskRoutes)
app.use('/api/v2/tasks', taskRoutesV2)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking
5. Submit a pull request

## 📄 License

MIT License

## 👥 Authors

TaskFlow Development Team

## 🙏 Acknowledgments

- Express.js team
- Mongoose team
- Bun team
- TypeScript team

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check documentation files
- Review API examples

---

**Built with ❤️ using Bun, Express, TypeScript, and MongoDB**
