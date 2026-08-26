import { useRef, useState } from 'react';
import { makeStyles, tokens, Text, Button } from '@fluentui/react-components';
import { ArrowUploadRegular, DocumentTableRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  zone: {
    border: `2px dashed ${tokens.colorNeutralStroke1}`,
    borderRadius: '8px',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  zoneActive: {
    border: '2px dashed #4B2E83',
    backgroundColor: 'rgba(75, 46, 131, 0.04)',
  },
  icon: {
    fontSize: '32px',
    color: tokens.colorNeutralForeground3,
  },
  hint: {
    fontSize: '13px',
    color: tokens.colorNeutralForeground3,
  },
});

export function FileDropZone({ onFile }: { onFile: (file: File) => void }) {
  const styles = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={isOver ? `${styles.zone} ${styles.zoneActive}` : styles.zone}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
    >
      <DocumentTableRegular className={styles.icon} />
      <Text weight="semibold">Drag & drop a spreadsheet here, or click to browse</Text>
      <Text className={styles.hint}>.xlsx or .csv, following the Work Order column template</Text>
      <Button icon={<ArrowUploadRegular />}>Choose File</Button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
