import { useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { useFeedbackList } from '../features/feedback/hooks/useFeedbackList';
import { FeedbackFilters } from '../features/feedback/components/FeedbackFilters';
import { FeedbackTable } from '../features/feedback/components/FeedbackTable';
import { SubmitFeedbackForm } from '../features/feedback/components/SubmitFeedbackForm';

export function FeedbackPage() {
  const { data: feedback, isLoading, isError } = useFeedbackList();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!feedback) return [];
    const q = query.trim().toLowerCase();
    if (!q) return feedback;
    return feedback.filter(
      (f) =>
        f.cre2b_submittedby?.toLowerCase().includes(q) ||
        f.cre2b_feedbacktext?.toLowerCase().includes(q),
    );
  }, [feedback, query]);

  return (
    <div>
      <PageHeader title="Feedback" subtitle="Share suggestions or comments about the app" />

      <SubmitFeedbackForm />

      {isLoading && <LoadingState label="Loading feedback…" />}
      {isError && <EmptyState message="Could not load feedback." />}
      {feedback && (
        <>
          <FeedbackFilters query={query} onQueryChange={setQuery} />
          {filtered.length === 0 ? (
            <EmptyState message="No feedback matches your search." />
          ) : (
            <FeedbackTable feedback={filtered} />
          )}
        </>
      )}
    </div>
  );
}
