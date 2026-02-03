// API client for direct backend calls (bypassing NextAuth for data fetching)
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const url = `${apiUrl}/api${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important: include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
}

export async function loginToBackend(email: string, password: string) {
  const response = await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Login failed');
  }

  return data;
}
