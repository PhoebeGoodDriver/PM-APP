import { useQuery } from '@tanstack/react-query';
import { getContext } from '@microsoft/power-apps/app';

async function fetchCurrentUserName(): Promise<string> {
  const context = await getContext();
  return context.user.fullName ?? context.user.userPrincipalName ?? 'Unknown user';
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUserName,
    staleTime: Infinity,
  });
}
