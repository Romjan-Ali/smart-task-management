import { useAppSelector } from './redux';
import { useGetCurrentUserQuery } from '@/store/api/authApi';

export function useAuth() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  return {
    user: user || data?.data,
    isAuthenticated,
    isLoading,
    error,
  };
}
