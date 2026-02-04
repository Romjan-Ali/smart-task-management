import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Server-side API client for fetching data with authentication
 */
export async function serverApiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return null;
    }

    // Get cookies for authentication
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    // Build URL with query params
    let url = `${apiUrl}/api${endpoint}`;
    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        ...options.headers,
      },
      cache: options.cache || 'no-store', // Default to no cache for fresh data
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Server API Client Error:', error);
    return null;
  }
}

/**
 * Fetch tasks from server
 */
export async function fetchTasksServer(params?: {
  workflowId?: string;
  stageId?: string;
  assignedTo?: string;
  priority?: string;
  overdue?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return serverApiClient('/tasks', { params });
}

/**
 * Fetch workflows from server
 */
export async function fetchWorkflowsServer(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isDefault?: boolean;
}) {
  return serverApiClient('/workflows', { params });
}

/**
 * Fetch dashboard stats from server
 */
export async function fetchDashboardStatsServer() {
  return serverApiClient('/analytics/dashboard');
}

/**
 * Fetch analytics data from server
 */
export async function fetchAnalyticsServer(params?: {
  workflowId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return serverApiClient('/analytics', { params });
}

/**
 * Fetch notifications from server
 */
export async function fetchNotificationsServer(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) {
  return serverApiClient('/notifications', { params });
}

/**
 * Fetch users from server
 */
export async function fetchUsersServer(params?: {
  search?: string;
  role?: string;
}) {
  return serverApiClient('/users', { params });
}
