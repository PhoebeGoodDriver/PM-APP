import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import * as XLSX from '@e965/xlsx';
import {
  Button,
  MessageBar,
  MessageBarBody,
  makeStyles,
  Text,
  ProgressBar,
} from '@fluentui/react-components';
import { ArrowDownloadRegular } from '@fluentui/react-icons';
import { PageHeader } from '../components/PageHeader';
import { NumberedSectionCard } from '../components/NumberedSectionCard';
import { LoadingState } from '../components/LoadingState';
import { FileDropZone } from '../features/batch-upload/components/FileDropZone';
import { ValidationPreviewTable } from '../features/batch-upload/components/ValidationPreviewTable';
import { parseWorkOrderWorkbook } from '../features/batch-upload/utils/parseWorkOrderWorkbook';
import { validateWorkOrderRows } from '../features/batch-upload/utils/validateWorkOrderRows';
import type { ValidatedRow } from '../features/batch-upload/utils/validateWorkOrderRows';
import { buildTemplateWorkbookRows } from '../features/batch-upload/utils/workOrderColumnTemplate';
import { useBulkCreateWorkOrders } from '../features/batch-upload/hooks/useBulkCreateWorkOrders';
import { useServiceCenterList } from '../features/service-centers/hooks/useServiceCenterList';
import { useServiceCenterProximityList } from '../features/service-centers/hooks/useServiceCenterProximity';
import { usePersonnelRoster } from '../features/personnel/hooks/usePersonnelRoster';
import { useCurrentUser } from '../lib/useCurrentUser';

const useStyles = makeStyles({
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  summary: {
    marginBottom: '16px',
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px',
  },
});

function downloadTemplate() {
  const sheet = XLSX.utils.json_to_sheet(buildTemplateWorkbookRows());
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Work Orders');
  XLSX.writeFile(workbook, 'work-order-batch-template.xlsx');
}

export function BatchUploadPage() {
  const styles = useStyles();
  const [fileName, setFileName] = useState<string | null>(null);
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const { data: serviceCenters } = useServiceCenterList();
  const { data: personnel } = usePersonnelRoster();
  const { data: proximities } = useServiceCenterProximityList();
  const { data: currentUser } = useCurrentUser();
  const bulkCreate = useBulkCreateWorkOrders();

  const validCount = useMemo(
    () => validatedRows?.filter((r) => r.errors.length === 0).length ?? 0,
    [validatedRows],
  );

  async function handleFile(file: File) {
    if (!serviceCenters || !personnel || !proximities) {
      setParseError('Still loading reference data — try again in a moment.');
      return;
    }
    setFileName(file.name);
    setParseError(null);
    setValidatedRows(null);
    try {
      const rows = await parseWorkOrderWorkbook(file);
      setValidatedRows(
        validateWorkOrderRows(rows, serviceCenters ?? [], personnel ?? [], proximities ?? []),
      );
    } catch {
      setParseError('Could not read this file. Make sure it is a valid .xlsx or .csv file.');
    }
  }

  async function handleCommit() {
    if (!validatedRows) return;
    const rowsToCreate = validatedRows
      .filter((r): r is ValidatedRow & { input: NonNullable<ValidatedRow['input']> } => r.input !== null)
      .map((r) => ({ rowNumber: r.rowNumber, input: r.input }));
    const results = await bulkCreate.run(rowsToCreate, currentUser);
    results
      .filter((r) => !r.success)
      .forEach((r) => console.error(`Row ${r.rowNumber} failed: ${r.error}`));
  }

  return (
    <div>
      <PageHeader
        title="Batch Upload"
        subtitle="Create many work orders from a spreadsheet"
        actions={
          <Button icon={<ArrowDownloadRegular />} onClick={downloadTemplate}>
            Download Template
          </Button>
        }
      />

      <NumberedSectionCard number={1} title="Upload File">
        <Text block className={styles.summary}>
          AssignedToPersonnelName is optional — leave it blank and set AssignPool (TSR Only / TSR +
          Advisor) instead to auto-assign the closest matching person for each row's service
          center. At least one of the two is required.
        </Text>
        <FileDropZone onFile={handleFile} />
        {fileName && (
          <Text block style={{ marginTop: '12px' }}>
            {fileName}
          </Text>
        )}
        {parseError && (
          <MessageBar intent="error" style={{ marginTop: '12px' }}>
            <MessageBarBody>{parseError}</MessageBarBody>
          </MessageBar>
        )}
      </NumberedSectionCard>

      {validatedRows && validatedRows.length > 0 && (
        <NumberedSectionCard number={2} title="Preview & Validate">
          <Text block className={styles.summary}>
            {validCount} of {validatedRows.length} rows are valid and ready to create.
          </Text>
          <ValidationPreviewTable rows={validatedRows} />

          {bulkCreate.isRunning && (
            <div style={{ marginTop: '16px' }}>
              <ProgressBar value={bulkCreate.progress.done} max={bulkCreate.progress.total} />
              <Text size={200}>
                Creating work orders… {bulkCreate.progress.done} / {bulkCreate.progress.total}
              </Text>
            </div>
          )}

          {!bulkCreate.isRunning && bulkCreate.results.length > 0 && (
            <MessageBar
              intent={bulkCreate.results.every((r) => r.success) ? 'success' : 'warning'}
              style={{ marginTop: '16px' }}
            >
              <MessageBarBody>
                Created {bulkCreate.results.filter((r) => r.success).length} of{' '}
                {bulkCreate.results.length} work orders
                {bulkCreate.batch ? ` under Batch ${bulkCreate.batch.number}` : ''}.
                {bulkCreate.results.some((r) => !r.success) &&
                  ` ${bulkCreate.results.filter((r) => !r.success).length} failed — see console for details.`}
                {bulkCreate.batch && (
                  <>
                    {' '}
                    <RouterLink to={`/batches/${bulkCreate.batch.id}`}>View Batch</RouterLink>
                  </>
                )}
              </MessageBarBody>
            </MessageBar>
          )}

          <div className={styles.submitRow}>
            <Button
              appearance="primary"
              disabled={validCount === 0 || bulkCreate.isRunning}
              onClick={handleCommit}
            >
              {bulkCreate.isRunning ? 'Creating…' : `Create ${validCount} Work Order${validCount === 1 ? '' : 's'}`}
            </Button>
          </div>
        </NumberedSectionCard>
      )}

      {(!serviceCenters || !personnel || !proximities) && (
        <LoadingState label="Loading reference data…" />
      )}
    </div>
  );
}
