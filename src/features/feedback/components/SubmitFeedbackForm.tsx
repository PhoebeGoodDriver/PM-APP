import { useState } from 'react';
import {
  Button,
  Field,
  Input,
  Textarea,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { SendRegular } from '@fluentui/react-icons';
import { useSubmitFeedback } from '../hooks/useSubmitFeedback';

const useStyles = makeStyles({
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: '16px',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px',
  },
});

export function SubmitFeedbackForm() {
  const styles = useStyles();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const submitFeedback = useSubmitFeedback();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    submitFeedback.mutate(
      { feedbackText: text.trim(), submittedBy: name.trim() },
      {
        onSuccess: () => {
          setText('');
        },
      },
    );
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <div className={styles.title}>Share Feedback</div>
      <div className={styles.row}>
        <Field label="Name (optional)">
          <Input
            value={name}
            onChange={(_, data) => setName(data.value)}
            placeholder="Leave blank to submit anonymously"
          />
        </Field>
        <Field label="Feedback" required>
          <Textarea
            value={text}
            onChange={(_, data) => {
              setText(data.value);
              if (submitFeedback.isSuccess || submitFeedback.isError) submitFeedback.reset();
            }}
            placeholder="Suggestions, issues, or comments about the app…"
            rows={4}
          />
        </Field>

        {submitFeedback.isError && (
          <MessageBar intent="error">
            <MessageBarBody>
              {submitFeedback.error instanceof Error
                ? submitFeedback.error.message
                : 'Failed to submit feedback.'}
            </MessageBarBody>
          </MessageBar>
        )}
        {submitFeedback.isSuccess && (
          <MessageBar intent="success">
            <MessageBarBody>Thanks for your feedback!</MessageBarBody>
          </MessageBar>
        )}
      </div>
      <div className={styles.actions}>
        <Button
          type="submit"
          appearance="primary"
          icon={<SendRegular />}
          disabled={!text.trim() || submitFeedback.isPending}
        >
          {submitFeedback.isPending ? 'Submitting…' : 'Submit Feedback'}
        </Button>
      </div>
    </form>
  );
}
