# TaskFlow Frontend - Smart Task Management System

A modern, feature-rich task management frontend built with Next.js 16, TypeScript, and Redux Toolkit.

## 🚀 Features

### Core Features
- ✅ **NextAuth.js Authentication** - Secure login/register with JWT sessions
- ✅ **Kanban Task Board** - Drag & drop tasks between workflow stages
- ✅ **Task Management** - Create, edit, delete, and assign tasks
- ✅ **Workflow System** - View and manage dynamic workflows
- ✅ **Real-time Notifications** - Bell icon with unread count and polling
- ✅ **Analytics Dashboard** - Statistics, workflow efficiency, user performance
- ✅ **Role-Based Access** - Admin, Manager, Member roles
- ✅ **Responsive Design** - Mobile-first, works on all devices

### Technical Features
- ✅ **Redux Toolkit + RTK Query** - State management and API caching
- ✅ **Optimistic UI Updates** - Instant feedback on drag & drop
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **shadcn/ui Components** - Beautiful, accessible UI
- ✅ **@dnd-kit** - Smooth drag and drop
- ✅ **Sonner Toast** - User-friendly notifications

## 📋 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **State Management:** Redux Toolkit + RTK Query
- **Authentication:** NextAuth.js v4
- **UI Library:** shadcn/ui
- **Drag & Drop:** @dnd-kit
- **Date Utilities:** date-fns
- **Package Manager:** Bun

## 🛠️ Installation

### Prerequisites
- **Bun** 1.3+ ([Install Bun](https://bun.sh))
- **Node.js** 18+
- **Backend API** running on port 3000

### Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   bun install
   ```

2. **Configure environment:**
   ```bash
   # .env.local is already configured
   # Update if needed:
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXTAUTH_URL=http://localhost:3001
   NEXTAUTH_SECRET=your-secret-key
   ```

3. **Start development server:**
   ```bash
   bun run dev
   ```

   Frontend will start on `http://localhost:3001`

## 📝 Available Scripts

```bash
# Development
bun run dev              # Start dev server (port 3001)
bun run build            # Build for production
bun run start            # Start production server
bun run lint             # Run ESLint

# Type Checking
bunx tsc --noEmit        # Check TypeScript types
```

## 🔐 Default Credentials

Use these credentials to login (after backend seeding):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskflow.com | Admin@123 |
| Manager | manager@taskflow.com | Manager@123 |
| Member | member@taskflow.com | Member@123 |

## 📁 Project Structure

```
frontend/src/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── dashboard/       # Home dashboard
│   │   ├── tasks/           # Task board (Kanban)
│   │   ├── workflows/       # Workflows list
│   │   ├── analytics/       # Analytics & metrics
│   │   ├── notifications/   # Notifications page
│   │   └── layout.tsx       # Dashboard layout
│   ├── api/
│   │   └── auth/[...nextauth]/ # NextAuth API route
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components (14)
│   ├── layout/              # Layout components
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   └── Header.tsx       # Header with user menu
│   ├── dashboard/           # Dashboard components
│   │   └── StatCard.tsx     # Statistics card
│   ├── tasks/               # Task components
│   │   ├── TaskCard.tsx     # Task card UI
│   │   ├── SortableTaskCard.tsx # Draggable wrapper
│   │   ├── TaskColumn.tsx   # Kanban column
│   │   └── TaskFormDialog.tsx # Create/edit form
│   ├── notifications/       # Notification components
│   │   └── NotificationBell.tsx # Bell with dropdown
│   └── providers.tsx        # App providers
├── store/
│   ├── store.ts             # Redux store
│   ├── api/                 # RTK Query API slices
│   │   ├── baseApi.ts       # Base API config
│   │   ├── authApi.ts       # Auth endpoints
│   │   ├── taskApi.ts       # Task endpoints
│   │   ├── workflowApi.ts   # Workflow endpoints
│   │   ├── notificationApi.ts # Notification endpoints
│   │   └── analyticsApi.ts  # Analytics endpoints
│   └── slices/              # Redux slices
│       └── authSlice.ts     # Auth state
├── types/
│   ├── index.ts             # Type definitions
│   └── next-auth.d.ts       # NextAuth types
├── hooks/
│   ├── redux.ts             # Typed Redux hooks
│   └── useAuth.ts           # Auth hook
└── lib/
    └── utils.ts             # Utility functions
```

## 🎯 Key Features

### 1. Authentication
- **NextAuth.js** with credentials provider
- JWT session management (7-day expiration)
- Protected routes with automatic redirect
- User menu with role badge
- Logout functionality

### 2. Task Board (Kanban)
- **Drag & Drop** with @dnd-kit
- Multiple columns (workflow stages)
- Task cards with:
  - Title, description
  - Priority badges (high/medium/low)
  - Due dates with overdue indicators
  - Assigned user avatars
- **Optimistic updates** for instant feedback
- Stage transition validation
- Create/Edit task dialog

### 3. Workflows
- View all workflows
- Display workflow stages with colors
- Default workflow indicators
- Stage count badges

### 4. Notifications
- **Bell icon** in header with unread count
- **Real-time polling** (30s intervals)
- Dropdown with recent notifications
- Mark as read (single/all)
- Delete notifications
- Full notifications page
- Notification types with badges

### 5. Analytics
- **Dashboard statistics:**
  - Total tasks
  - Completed tasks
  - Overdue tasks
  - Due today/this week
  - Average completion time
- **Workflow efficiency:**
  - Completion rate
  - Average time per workflow
  - Stage distribution
- **User performance:**
  - Tasks assigned/completed
  - Completion rate
  - Overdue count

### 6. Navigation
- **Sidebar** with active state highlighting
- **Header** with user menu and notifications
- **Protected routes** with auth check
- **Responsive layout** with mobile support

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_NAME=TaskFlow
NEXT_PUBLIC_APP_URL=http://localhost:3001

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-this-in-production
```

### API Integration

The frontend connects to the backend API at `http://localhost:3000/api`.

All API calls include credentials (cookies) for authentication:
```typescript
baseQuery: fetchBaseQuery({
  baseUrl: `${baseUrl}/api`,
  credentials: 'include', // Important for cookie-based auth
})
```

## 🎨 UI Components

### shadcn/ui Components Used:
1. Button
2. Card
3. Form
4. Input
5. Label
6. Select
7. Table
8. Badge
9. Avatar
10. Dialog
11. Dropdown Menu
12. Separator
13. Skeleton
14. Sonner (Toast)

## 🧪 Testing

### Manual Testing Flow:

1. **Start Backend:**
   ```bash
   cd backend
   bun run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   bun run dev
   ```

3. **Test Authentication:**
   - Visit http://localhost:3001
   - Click "Sign In"
   - Login with demo credentials
   - Verify redirect to dashboard

4. **Test Task Board:**
   - Navigate to "Tasks"
   - See Kanban board
   - Drag tasks between columns
   - Click "New Task" to create
   - Fill form and submit

5. **Test Notifications:**
   - Click bell icon in header
   - See unread count
   - Mark notifications as read
   - Visit notifications page

6. **Test Analytics:**
   - Navigate to "Analytics"
   - View workflow efficiency
   - View user performance
   - Check dashboard stats

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"
**Solution:** Ensure backend is running on port 3000

### Issue: "Authentication failed"
**Solution:** Check backend is seeded with demo users

### Issue: "Tasks not loading"
**Solution:** Verify backend has workflows and tasks seeded

### Issue: "Drag & drop not working"
**Solution:** Check browser console for errors, ensure @dnd-kit is installed

## 📊 Performance Optimization

### Implemented:
- ✅ RTK Query caching
- ✅ Optimistic updates
- ✅ Code splitting (automatic with Next.js)
- ✅ Static generation where possible
- ✅ Lazy loading
- ✅ Efficient re-renders

### Future Optimizations:
- [ ] Image optimization
- [ ] Bundle analysis
- [ ] Service worker
- [ ] Progressive Web App

## 🔒 Security

- ✅ NextAuth.js with JWT sessions
- ✅ HTTP-only cookies
- ✅ CSRF protection
- ✅ Protected routes
- ✅ Input validation
- ✅ XSS prevention
- ✅ Secure password handling

## 📚 Documentation

- **[PHASE1_COMPLETE.md](./PHASE1_COMPLETE.md)** - Phase 1 details
- **[PHASE_1_2_3_4_COMPLETE.md](./PHASE_1_2_3_4_COMPLETE.md)** - Complete progress
- **[FRONTEND_ACCELERATED_PLAN.md](../FRONTEND_ACCELERATED_PLAN.md)** - Implementation plan

## 🎊 Deliverables

### Completed:
- ✅ Authentication system
- ✅ Task board with drag & drop
- ✅ Task creation/editing
- ✅ Workflow management
- ✅ Notification system
- ✅ Analytics dashboard
- ✅ Responsive design
- ✅ Type-safe codebase

### Remaining:
- [ ] Final polish
- [ ] Production deployment
- [ ] Complete testing

## 🚀 Deployment

### Build for Production:
```bash
bun run build
```

### Deploy to Vercel:
```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel deploy --prod
```

### Environment Variables (Vercel):
- `NEXT_PUBLIC_API_URL` - Your production API URL
- `NEXTAUTH_URL` - Your production frontend URL
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

## 📞 Support

For issues or questions:
- Check the documentation files
- Review the backend API documentation
- Check browser console for errors
- Verify environment variables

---

## ✅ Status: MVP COMPLETE

**The frontend application is feature-complete and ready for testing!**

All core features are implemented:
- Authentication ✅
- Task Management ✅
- Drag & Drop ✅
- Workflows ✅
- Notifications ✅
- Analytics ✅

**Next:** Final testing and deployment
