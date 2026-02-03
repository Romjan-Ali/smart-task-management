# Permission Guide - Role-Based Access Control

## 🔐 Understanding 403 Forbidden Errors

### What is a 403 Error?
- **401 Unauthorized:** Not logged in
- **403 Forbidden:** Logged in but insufficient permissions

---

## 👥 User Roles & Permissions

### Backend Permission Rules:

#### **Admin Role** (Full Access)
- ✅ Create tasks
- ✅ Update any task
- ✅ Delete any task
- ✅ Create workflows
- ✅ Update workflows
- ✅ Delete workflows
- ✅ View all analytics
- ✅ Manage users

#### **Manager Role** (Task & Workflow Management)
- ✅ Create tasks
- ✅ Update own tasks
- ✅ Delete own tasks
- ✅ Create workflows
- ✅ Update own workflows
- ✅ View all tasks
- ✅ View all analytics

#### **Member Role** (Limited Access)
- ❌ Cannot create tasks
- ✅ Update assigned tasks only
- ❌ Cannot delete tasks
- ❌ Cannot create workflows
- ✅ View assigned tasks
- ✅ View own performance

---

## 🐛 Why You're Getting 403 Error

### Backend Code:
```typescript
// backend/src/routes/task.routes.ts
router.post(
  '/',
  authorize('admin', 'manager'),  // ← Only admin and manager can create
  validate(createTaskSchema),
  asyncHandler(taskController.createTask)
)
```

### Possible Causes:

#### 1. **Logged in as Member**
If you registered with role "member", you cannot create tasks.

**Solution:** Login as admin or manager:
- Admin: `admin@taskflow.com` / `Admin@123`
- Manager: `manager@taskflow.com` / `Manager@123`

#### 2. **Role Not in Session**
The backend might not be receiving the user's role.

**Check:** Look at your user menu in the header - what role badge do you see?

---

## ✅ Solutions

### Solution 1: Login as Admin/Manager

**Recommended for testing:**
```
1. Logout (click user menu → Logout)
2. Login with admin credentials:
   - Email: admin@taskflow.com
   - Password: Admin@123
3. Try creating task again
4. Should work! ✅
```

### Solution 2: Change Your User's Role

**If you want to keep your account:**
```bash
# Connect to MongoDB
mongosh taskflow

# Update your user's role
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Solution 3: Modify Backend Permissions

**If you want members to create tasks:**
```typescript
// backend/src/routes/task.routes.ts
router.post(
  '/',
  // Remove authorize middleware or add 'member'
  authorize('admin', 'manager', 'member'),  // ← Add member
  validate(createTaskSchema),
  asyncHandler(taskController.createTask)
)
```

---

## 🔍 How to Debug Permission Issues

### 1. Check Your Role:
```
1. Look at header user menu
2. See role badge (admin/manager/member)
3. Verify it matches expected role
```

### 2. Check Browser Console:
```javascript
// Should see 403 error with message:
{
  "success": false,
  "error": "Insufficient permissions"
}
```

### 3. Check Network Tab:
```
Request URL: POST http://localhost:3000/api/tasks
Status: 403 Forbidden
Response: { "success": false, "error": "Insufficient permissions" }
```

### 4. Check Backend Logs:
```
Should see: "User [email] attempted to access admin/manager route"
```

---

## 🎯 Permission Matrix

| Action | Admin | Manager | Member |
|--------|-------|---------|--------|
| **Tasks** |
| Create Task | ✅ | ✅ | ❌ |
| View All Tasks | ✅ | ✅ | ❌ |
| View Assigned Tasks | ✅ | ✅ | ✅ |
| Update Any Task | ✅ | ✅ | ❌ |
| Update Assigned Task | ✅ | ✅ | ✅ |
| Delete Any Task | ✅ | ✅ | ❌ |
| Change Task Stage | ✅ | ✅ | ✅ |
| **Workflows** |
| Create Workflow | ✅ | ✅ | ❌ |
| View Workflows | ✅ | ✅ | ✅ |
| Update Workflow | ✅ | ✅ | ❌ |
| Delete Workflow | ✅ | ✅ | ❌ |
| **Analytics** |
| View All Analytics | ✅ | ✅ | ❌ |
| View Own Performance | ✅ | ✅ | ✅ |

---

## 💡 Frontend Permission Handling

### Current Implementation:
The frontend doesn't restrict UI based on roles yet. All users see the "New Task" button, but only admin/manager can actually create tasks.

### Recommended Enhancement:
Add role-based UI hiding:

```typescript
// In TaskBoard component
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
const userRole = session?.user?.role;

// Only show "New Task" button for admin/manager
{(userRole === 'admin' || userRole === 'manager') && (
  <Button onClick={() => setIsFormOpen(true)}>
    <Plus className="mr-2 h-4 w-4" />
    New Task
  </Button>
)}
```

---

## 🚀 Quick Fix

### For Immediate Testing:

**Option A: Use Admin Account**
```
1. Logout
2. Login: admin@taskflow.com / Admin@123
3. Create tasks ✅
```

**Option B: Use Manager Account**
```
1. Logout
2. Login: manager@taskflow.com / Manager@123
3. Create tasks ✅
```

**Option C: Register as Manager**
```
1. Go to /register
2. Fill form
3. Select role: "Manager"
4. Register
5. Create tasks ✅
```

---

## 📝 Summary

### Why 403 Error:
- ✅ You're logged in (not 401)
- ❌ Your role doesn't have permission (403)
- Backend requires admin or manager role
- Member role cannot create tasks

### Solution:
- **Login as admin or manager** to create tasks
- Or modify backend to allow members
- Or add role-based UI hiding in frontend

---

## ✅ Verification

After logging in as admin/manager:
- ✅ "New Task" button should work
- ✅ Task creation should succeed
- ✅ No 403 errors
- ✅ Task appears in board

**Login as admin@taskflow.com to test task creation!**
