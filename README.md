# Smart Task & Workflow Management System

A full-stack workflow-driven task management system with role-based access control, real-time updates, and analytics. Think Trello + automation + analytics (mini Jira).

## 🚀 Features

### Core Functionality
- **Dynamic Workflow Engine**: Create custom workflows with configurable stages
- **Task Management**: Full CRUD operations with drag-and-drop stage transitions
- **Role-Based Access Control (RBAC)**: Admin, Manager, and Member roles with different permissions
- **Real-time Notifications**: Automated notifications for task assignments, completions, and stage changes
- **Analytics Dashboard**: Comprehensive metrics and insights
- **Markdown Support**: Rich text formatting in task descriptions

### Key Highlights
- ✅ Drag & drop task cards between workflow stages
- ✅ Automatic task completion when moved to final stage
- ✅ Activity logging for all task changes
- ✅ Overdue task tracking and notifications
- ✅ User assignment with multi-select
- ✅ Server-side pagination
- ✅ Optimistic UI updates with RTK Query

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **UI Library**: Tailwind CSS + shadcn/ui
- **Drag & Drop**: @dnd-kit
- **Authentication**: NextAuth.js

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (Access + Refresh tokens)
- **Validation**: Zod
- **Runtime**: Bun

## 📋 Prerequisites

- Node.js 18+ or Bun 1.0+
- MongoDB 6.0+
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-task-management
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Update .env with your configuration:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_ACCESS_SECRET: Random 32+ character string
# - JWT_REFRESH_SECRET: Different random 32+ character string
# - COOKIE_SECRET: Another random 32+ character string

# Seed the database with test data
bun run tsx scripts/seedUsers.ts      # Create test users
bun run tsx scripts/seedTestData.ts   # Create workflows and tasks

# Start the development server
bun run dev
```

Backend will run on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
bun install

# Copy environment file (if needed)
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:3000
# NEXTAUTH_SECRET=your-nextauth-secret
# NEXTAUTH_URL=http://localhost:3001

# Start the development server
bun run dev
```

Frontend will run on `http://localhost:3001`

## 👥 Test Accounts

After running the seed scripts, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskflow.com | Admin@123 |
| Manager | manager@taskflow.com | Manager@123 |
| Member | member@taskflow.com | Member@123 |

## 🔐 Role-Based Permissions

### Admin
- ✅ Full access to all features
- ✅ Create, edit, delete workflows
- ✅ Create, edit, delete all tasks
- ✅ Assign tasks to users
- ✅ View all analytics

### Manager
- ✅ Create, edit, delete workflows
- ✅ Create, edit, delete all tasks
- ✅ Assign tasks to users
- ✅ View all analytics
- ❌ Cannot access admin-only features

### Member
- ✅ View assigned tasks only
- ✅ View workflows (read-only)
- ✅ View notifications
- ❌ Cannot create or modify tasks
- ❌ Cannot create or modify workflows
- ❌ Cannot assign tasks

## 📁 Project Structure

```
smart-task-management/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   ├── scripts/            # Database seed scripts
│   └── tests/              # Unit tests
│
└── frontend/
    ├── src/
    │   ├── app/            # Next.js app router pages
    │   ├── components/     # React components
    │   ├── hooks/          # Custom React hooks
    │   ├── lib/            # Utility functions
    │   ├── store/          # Redux store & RTK Query
    │   └── types/          # TypeScript types
    └── public/             # Static assets
```

## 🎯 Key Features Explained

### 1. Dynamic Workflow Engine

Create custom workflows with any number of stages:
- Define stage names, colors, and order
- Mark final stages for auto-completion
- Validate stage transitions
- Prevent illegal stage jumps

Example workflow: `Backlog → In Progress → Code Review → QA → Done`

### 2. Task Management

Each task includes:
- Title and description (with markdown support)
- Priority (Low, Medium, High)
- Current stage in workflow
- Assigned users (multiple)
- Due date with overdue tracking
- Activity log (auto-tracked)
- Completion timestamp

### 3. Automation

Automatic actions:
- Set `completedAt` when task reaches final stage
- Notify assigned users on task completion
- Notify users on task assignment
- Notify users on stage changes
- Track overdue tasks

### 4. Analytics

Dashboard metrics:
- Tasks per stage
- Overdue tasks count
- Average completion time per workflow
- Tasks completed per user
- Priority distribution
- Due date tracking

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (Admin/Manager only)
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/stage` - Change task stage
- `POST /api/tasks/:id/assign` - Assign users to task
- `DELETE /api/tasks/:id/assign/:userId` - Unassign user
- `DELETE /api/tasks/:id` - Delete task (Admin/Creator only)

### Workflows
- `GET /api/workflows` - Get all workflows
- `GET /api/workflows/default` - Get default workflows
- `GET /api/workflows/:id` - Get workflow by ID
- `POST /api/workflows` - Create workflow (Admin/Manager only)
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/workflow-efficiency` - Workflow metrics
- `GET /api/analytics/user-performance` - User performance metrics

### Users
- `GET /api/users` - Get all users (for assignment)
- `GET /api/users/:id` - Get user by ID

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
bun test
```

### Seed Test Data
```bash
cd backend
bun run tsx scripts/seedTestData.ts
```

This creates:
- 3 workflows (Software Development, Marketing Campaign, Bug Tracking)
- 12 sample tasks across all workflows
- 3 notifications
- Tasks with various states (overdue, completed, in-progress)

## 🚢 Deployment

### Backend (Vercel)
```bash
cd backend
vercel deploy
```

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Environment Variables

**Backend (.env)**:
```env
NODE_ENV=production
MONGODB_URI=your-mongodb-uri
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-secret
COOKIE_SECRET=your-secret
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-frontend-url.vercel.app
```

## 📚 Documentation

- **API Documentation**: See `backend/API_DOCUMENTATION.md`
- **API Testing**: See `backend/API_TESTING.md`
- **Backend README**: See `backend/README.md`
- **Frontend README**: See `frontend/README.md`

## 🎨 UI Features

- Responsive design (mobile, tablet, desktop)
- Dark mode support (via system preference)
- Toast notifications for user feedback
- Loading states and skeletons
- Error boundaries for graceful error handling
- Accessible components (ARIA labels, keyboard navigation)

## 🔒 Security Features

- HTTP-only cookies for tokens
- CSRF protection
- Input validation with Zod
- SQL injection prevention (MongoDB)
- XSS protection
- Rate limiting ready
- Secure password hashing (bcrypt)

## 🐛 Known Issues & Limitations

- Real-time updates require manual refresh (no WebSocket yet)
- Email notifications are logged only (no actual email sending)
- No file attachments for tasks
- No task comments/discussions
- No time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built as a demonstration of modern full-stack development practices.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn/ui for beautiful components
- Redux Toolkit team for excellent state management
- MongoDB team for the database

---

**Happy Task Managing! 🎉**
