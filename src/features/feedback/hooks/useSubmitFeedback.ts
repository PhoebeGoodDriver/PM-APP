import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Cre2b_feedbacksService } from '../../../generated/services/Cre2b_feedbacksService';

export interface SubmitFeedbackInput {
  feedbackText: string;
  submittedBy?: string;
}

async function submitFeedback(input: SubmitFeedbackInput) {
  const result = await Cre2b_feedbacksService.create({
    statecode: 0,
    cre2b_feedbacktext: input.feedbackText,
    cre2b_submittedby: input.submittedBy || undefined,
    cre2b_submittedat: new Date().toISOString(),
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to submit feedback');
  }
  return result.data;
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}
