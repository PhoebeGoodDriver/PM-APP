import { useQuery } from '@tanstack/react-query';
import { Cre2b_feedbacksService } from '../../../generated/services/Cre2b_feedbacksService';

async function fetchFeedback() {
  const result = await Cre2b_feedbacksService.getAll({
    filter: 'statecode eq 0',
    orderBy: ['cre2b_submittedat desc'],
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to load feedback');
  }
  return result.data;
}

export function useFeedbackList() {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: fetchFeedback,
    staleTime: 60_000,
  });
}
