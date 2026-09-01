import { useMemo, useState } from 'react';
import { CheckCircle2, RadioTower, SlidersHorizontal, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import extractApiError from '@shared/api/extractApiError';
import { Badge } from '@shared/components/ui/badge';
import { Button } from '@shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import { Label } from '@shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { Textarea } from '@shared/components/ui/textarea';
import {
  useAdminJobStatuses,
  useBulkForceAdminJobStatus,
  useBulkSimulateAdminJobCodesFromL2,
} from '../hooks';
import type {
  AdminJobId,
  BulkJobOperationItemResult,
  BulkJobOperationResult,
} from '../types';

const MAX_BULK_JOBS = 100;

interface SelectedJob {
  id: AdminJobId;
  jobNumber: string;
}

interface ResultDialogState {
  title: string;
  result: BulkJobOperationResult;
  jobNumbers: Map<AdminJobId, string>;
}

interface AdminJobBulkActionsProps {
  selectedJobs: SelectedJob[];
  onSelectedIdsChange: (ids: ReadonlySet<AdminJobId>) => void;
}

export function AdminJobBulkActions({
  selectedJobs,
  onSelectedIdsChange,
}: AdminJobBulkActionsProps) {
  const [forceOpen, setForceOpen] = useState(false);
  const [simulateOpen, setSimulateOpen] = useState(false);
  const [resultDialog, setResultDialog] = useState<ResultDialogState | null>(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [comment, setComment] = useState('');

  const statuses = useAdminJobStatuses(forceOpen);
  const bulkForceStatus = useBulkForceAdminJobStatus();
  const bulkSimulate = useBulkSimulateAdminJobCodesFromL2();

  const selectedIds = useMemo(
    () => selectedJobs.map((job) => job.id),
    [selectedJobs]
  );
  const isOverLimit = selectedIds.length > MAX_BULK_JOBS;
  const isPending = bulkForceStatus.isPending || bulkSimulate.isPending;

  if (selectedJobs.length === 0) return null;

  const showError = (error: unknown) => {
    const apiError = extractApiError(error);
    toast.error('Массовая операция не выполнена', {
      description: apiError.message,
    });
  };

  const handleResult = <TItem extends BulkJobOperationItemResult>(
    title: string,
    result: BulkJobOperationResult<TItem>
  ) => {
    const failedIds = new Set(
      result.items.filter((item) => !item.isSuccess).map((item) => item.jobId)
    );
    const jobNumbers = new Map(
      selectedJobs.map((job) => [job.id, job.jobNumber] as const)
    );

    onSelectedIdsChange(failedIds);
    setResultDialog({ title, result, jobNumbers });

    if (result.failedCount === 0) {
      toast.success(`Обработано заданий: ${result.succeededCount}`);
    } else {
      toast.warning(
        `Успешно: ${result.succeededCount}, с ошибкой: ${result.failedCount}`
      );
    }
  };

  const forceStatus = async () => {
    if (!targetStatus || isOverLimit) return;

    try {
      const response = await bulkForceStatus.mutateAsync({
        jobIds: selectedIds,
        targetStatus: Number(targetStatus),
        comment: comment.trim() || undefined,
      });
      setForceOpen(false);
      handleResult('Массовая установка статуса', response.data);
    } catch (error) {
      showError(error);
    }
  };

  const simulateCodes = async () => {
    if (isOverLimit) return;

    try {
      const response = await bulkSimulate.mutateAsync({ jobIds: selectedIds });
      setSimulateOpen(false);
      handleResult('Массовая симуляция кодов L2', response.data);
    } catch (error) {
      showError(error);
    }
  };

  return (
    <>
      <div className="mx-1 h-7 w-px bg-border" />
      <Badge variant={isOverLimit ? 'destructive' : 'secondary'}>
        Выбрано: {selectedJobs.length}
      </Badge>
      <Button
        variant="outline"
        disabled={isOverLimit || isPending}
        onClick={() => setForceOpen(true)}
      >
        <SlidersHorizontal />
        Установить статус
      </Button>
      <Button
        variant="outline"
        disabled={isOverLimit || isPending}
        onClick={() => setSimulateOpen(true)}
      >
        <RadioTower />
        Симулировать коды L2
      </Button>
      <Button
        variant="ghost"
        disabled={isPending}
        onClick={() => onSelectedIdsChange(new Set())}
      >
        Снять выбор
      </Button>
      {isOverLimit && (
        <span className="text-sm text-destructive">
          За одну операцию можно выбрать не более {MAX_BULK_JOBS} заданий.
        </span>
      )}

      <Dialog open={forceOpen} onOpenChange={setForceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Установить статус для {selectedJobs.length} заданий</DialogTitle>
            <DialogDescription>
              Статус будет установлен независимо для каждого задания. Ошибка в
              одном задании не отменит успешно обработанные.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Новый статус</Label>
              <Select value={targetStatus} onValueChange={setTargetStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  {(statuses.data?.data ?? []).map((status) => (
                    <SelectItem key={status.value} value={String(status.value)}>
                      {status.description} ({status.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bulk-force-comment">Комментарий</Label>
              <Textarea
                id="bulk-force-comment"
                value={comment}
                maxLength={1000}
                placeholder="Необязательный комментарий"
                onChange={(event) => setComment(event.target.value)}
              />
              <div className="text-right text-xs text-muted-foreground">
                {comment.length}/1000
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForceOpen(false)}>
              Отмена
            </Button>
            <Button
              disabled={!targetStatus || bulkForceStatus.isPending}
              onClick={() => void forceStatus()}
            >
              {bulkForceStatus.isPending ? 'Выполнение…' : 'Применить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={simulateOpen} onOpenChange={setSimulateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Симулировать получение кодов для {selectedJobs.length} заданий?
            </DialogTitle>
            <DialogDescription>
              Backend обновит флаги зарезервированных кодов и переведёт успешно
              обработанные задания в статус формирования отчётов. Каждое задание
              выполняется в отдельной транзакции.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSimulateOpen(false)}>
              Отмена
            </Button>
            <Button
              disabled={bulkSimulate.isPending}
              onClick={() => void simulateCodes()}
            >
              {bulkSimulate.isPending ? 'Выполнение…' : 'Симулировать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={resultDialog !== null}
        onOpenChange={(open) => !open && setResultDialog(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{resultDialog?.title}</DialogTitle>
            <DialogDescription>
              Успешно: {resultDialog?.result.succeededCount ?? 0}, с ошибкой:{' '}
              {resultDialog?.result.failedCount ?? 0}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] space-y-2 overflow-auto pr-1">
            {resultDialog?.result.items.map((item) => (
              <div
                key={item.jobId}
                className="flex items-start justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <div className="font-medium">
                    {resultDialog.jobNumbers.get(item.jobId) ?? `ID ${item.jobId}`}
                  </div>
                  <div className="text-xs text-muted-foreground">ID {item.jobId}</div>
                  {!item.isSuccess && item.message && (
                    <div className="mt-1 text-sm text-destructive">
                      {item.message}
                      {item.errorCode ? ` (${item.errorCode})` : ''}
                    </div>
                  )}
                </div>
                {item.isSuccess ? (
                  <Badge variant="secondary" className="gap-1 text-emerald-700">
                    <CheckCircle2 /> Успешно
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle /> Ошибка
                  </Badge>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setResultDialog(null)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
