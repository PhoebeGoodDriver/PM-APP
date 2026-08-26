import { Input, makeStyles } from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    marginBottom: '16px',
    maxWidth: '360px',
  },
});

export function FeedbackFilters({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Input
        contentBefore={<SearchRegular />}
        placeholder="Search by submitted by or feedback text"
        value={query}
        onChange={(_, data) => onQueryChange(data.value)}
      />
    </div>
  );
}
