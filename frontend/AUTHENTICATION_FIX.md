# Authentication Fix - Cookie-Based Auth with NextAuth

## 🔧 Problem

The backend uses cookie-based JWT authentication, but NextAuth creates its own session. This causes API calls to fail because the backend cookies aren't being set.

## ✅ Solution Implemented

### 1. **Dual Authentication Approach**

The login flow now works in two steps:

```
User Login → Backend API (sets cookies) → NextAuth (creates session) → Dashboard
```

### 2. **Updated Files**

#### [`lib/api-client.ts`](frontend/src/lib/api-client.ts) - NEW
- Direct API client for backend calls
- Includes credentials (cookies)
- `loginToBackend()` function to authenticate with backend

#### [`app/(auth)/login/page.tsx`](frontend/src/app/(auth)/login/page.tsx) - UPDATED
- Calls backend API first to set cookies
- Then creates NextAuth session
- Both authentications work together

### 3. **How It Works**

```typescript
// Step 1: Login to backend (sets HTTP-only cookies)
const backendResult = await loginToBackend(email, password);

// Step 2: Create NextAuth session (for frontend state)
const nextAuthResult = await signIn('credentials', {
  email, password, redirect: false
});

// Step 3: Navigate to dashboard
router.push('/dashboard');
```

## 🧪 Testing

### 1. Check Backend is Running:
```bash
cd backend
bun run dev
# Should see: Server running on port 3000
```

### 2. Check Backend Cookies:
```bash
# Test backend login directly
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@taskflow.com", "password": "Admin@123"}' \
  -c cookies.txt -v

# Should see Set-Cookie headers
```

### 3. Test Frontend Login:
1. Visit http://localhost:3001/login
2. Enter: `admin@taskflow.com` / `Admin@123`
3. Click "Sign In"
4. Open DevTools → Application → Cookies
5. Should see both:
   - `accessToken` (backend)
   - `next-auth.session-token` (NextAuth)

### 4. Test API Calls:
1. After login, navigate to `/tasks`
2. Open DevTools → Network tab
3. Check API calls to backend
4. Should see cookies being sent
5. Should see 200 responses

## 🐛 Debugging

### Issue: "No data showing"

**Check 1: Backend Cookies**
```javascript
// In browser console after login:
document.cookie
// Should include: accessToken=...
```

**Check 2: API Calls**
```javascript
// In Network tab, check request headers:
Cookie: accessToken=...; refreshToken=...
```

**Check 3: CORS**
Backend must allow credentials from frontend:
```typescript
// backend/src/app.ts
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));
```

### Issue: "401 Unauthorized"

**Solution:** Backend cookies not being sent.

**Fix:** Ensure `credentials: 'include'` in all API calls:
```typescript
// Already configured in baseApi.ts
credentials: 'include'
```

### Issue: "CORS Error"

**Solution:** Backend CORS not configured for frontend.

**Check backend:**
```typescript
// backend/src/app.ts should have:
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
```

## 📝 Backend CORS Configuration

Your backend needs to allow the frontend origin with credentials:

```typescript
// backend/src/app.ts
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3001',  // Frontend dev
    process.env.FRONTEND_URL  // Production
  ],
  credentials: true,  // IMPORTANT!
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 🔐 Cookie Flow

### Login Flow:
```
1. User submits login form
2. Frontend calls backend /api/auth/login
3. Backend validates credentials
4. Backend sets HTTP-only cookies:
   - accessToken (15 min)
   - refreshToken (7 days)
5. Frontend creates NextAuth session
6. User redirected to dashboard
7. All API calls include cookies automatically
```

### API Call Flow:
```
Frontend → RTK Query → fetch with credentials: 'include'
→ Backend receives cookies → Validates JWT → Returns data
```

## ✅ Verification Checklist

After login, verify:
- [ ] Backend cookies are set (`accessToken`, `refreshToken`)
- [ ] NextAuth session cookie is set (`next-auth.session-token`)
- [ ] API calls include cookies in headers
- [ ] Backend returns 200 (not 401)
- [ ] Data displays in frontend

## 🚀 Quick Fix Commands

### If data still not showing:

1. **Clear all cookies:**
   ```javascript
   // In browser console:
   document.cookie.split(";").forEach(c => {
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   ```

2. **Restart both servers:**
   ```bash
   # Terminal 1
   cd backend && bun run dev

   # Terminal 2
   cd frontend && bun run dev
   ```

3. **Login again and check Network tab**

## 📞 Still Having Issues?

### Check these:
1. Backend is running on port 3000
2. Frontend is running on port 3001
3. Backend has CORS enabled with credentials
4. Backend is seeded with data
5. Browser allows third-party cookies
6. No browser extensions blocking cookies

### Debug API Calls:
```typescript
// Add to baseApi.ts for debugging:
baseQuery: fetchBaseQuery({
  baseUrl: `${baseUrl}/api`,
  credentials: 'include',
  prepareHeaders: (headers) => {
    console.log('API Call Headers:', headers);
    return headers;
  },
}),
```

## ✅ Expected Behavior

After implementing this fix:
- ✅ Login sets both backend and NextAuth cookies
- ✅ All API calls include backend cookies
- ✅ Tasks, workflows, notifications load correctly
- ✅ Drag & drop works
- ✅ Create/edit operations work
- ✅ Analytics data displays

---

**The authentication system now properly integrates NextAuth with your backend's cookie-based JWT authentication!**
