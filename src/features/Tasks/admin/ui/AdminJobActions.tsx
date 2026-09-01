import { useState } from 'react';
import { Bug, ChevronDown, RotateCcw, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { Label } from '@shared/components/ui/label';
import { Textarea } from '@shared/components/ui/textarea';
import extractApiError from '@shared/api/extractApiError';
import type { ApiEnvelope } from '@shared/api/contracts';
import {
  useAdminJobStatuses,
  useForceAdminJobStatus,
  useResetAdminJob,
  useResetAdminJobCodesFromL2,
  useResetAdminJobReporting,
  useRetryAdminJob,
  useSimulateAdminJobAggregation,
  useSimulateAdminJobCodesFromL2,
  useSimulateAdminJobL2Aggregation,
} from '../hooks';
import type {
  AdminJobId,
  ResetAdminJobReportingResult,
  SimulateAggregationResult,
  SimulateCodesFromL2Result,
  SimulateL2AggregationResult,
} from '../types';

type AdminCommand =
  | 'retry'
  | 'reset'
  | 'reset-codes'
  | 'reset-reporting'
  | 'simulate-codes'
  | 'simulate-aggregation'
  | 'simulate-l2-aggregation';

const commandText: Record<
  AdminCommand,
  { title: string; description: string; confirm: string }
> = {
  retry: {
    title: 'Повторить обработку задания',
    description: 'Задание будет поставлено в очередь на повторную обработку.',
    confirm: 'Повторить',
  },
  reset: {
    title: 'Сбросить задание',
    description:
      'Статус задания будет сброшен в «Черновик», а ошибка и время повторной попытки — очищены.',
    confirm: 'Сбросить',
  },
  'reset-codes': {
    title: 'Сбросить коды от L2',
    description:
      'У упаковок будут очищены флаги получения и обработки кодов, а статус задания изменится на «Отправлено».',
    confirm: 'Сбросить коды',
  },
  'reset-reporting': {
    title: 'Сбросить отчётность',
    description:
      'У упаковок будут сброшены флаги отчётности, связанные документы удалены, а статус задания изменится на «В работе».',
    confirm: 'Сбросить отчётность',
  },
  'simulate-codes': {
    title: 'Симулировать получение кодов от L2',
    description:
      'Упаковкам будут установлены флаги Fill, SentToPrint, Read и Confirmed, а статус задания изменится на Downloading.',
    confirm: 'Запустить симуляцию',
  },
  'simulate-aggregation': {
    title: 'Симулировать агрегацию',
    description:
      'Backend построит связи ParentId и установит признак Aggregated у упаковок задания.',
    confirm: 'Запустить симуляцию',
  },
  'simulate-l2-aggregation': {
    title: 'Симулировать агрегацию L2',
    description:
      'Backend назначит связи ParentId и установит признаки Packaged и Aggregated по алгоритму L2.',
    confirm: 'Запустить симуляцию',
  },
};

function Metrics({ items }: { items: Array<[string, string | number]> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border p-3">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="mt-1 text-lg font-semibold">{value}</div>
        </div>
      ))}
    </div>
  );
}

function Warnings({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
      <div className="mb-2 font-medium">Предупреждения</div>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {items.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}

function Counters({
  title,
  values,
}: {
  title: string;
  values: Record<string, number>;
}) {
  const items = Object.entries(values);
  if (items.length === 0) return null;

  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 font-medium">{title}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(([name, value]) => (
          <div key={name} className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{name}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DebugCommandResult({
  command,
  data,
}: {
  command: AdminCommand;
  data: unknown;
}) {
  if (command === 'reset-codes') {
    return <Metrics items={[["Сброшено упаковок", Number(data)]]} />;
  }

  if (command === 'reset-reporting') {
    const result = data as ResetAdminJobReportingResult;
    return (
      <Metrics
        items={[
          ['Сброшено упаковок', result.packsReset],
          ['Удалено документов', result.documentsDeleted],
        ]}
      />
    );
  }

  if (command === 'simulate-codes') {
    const result = data as SimulateCodesFromL2Result;
    return (
      <div className="space-y-3">
        <Metrics
          items={[
            ['Всего упаковок', result.totalPacks],
            ['Обновлено', result.updatedPacks],
            ['Пропущено', result.skippedPacks],
            ['Новый статус', result.newJobStatus],
          ]}
        />
        <Counters title="Обновлено по уровням" values={result.updatedByLevel} />
      </div>
    );
  }

  if (command === 'simulate-aggregation') {
    const result = data as SimulateAggregationResult;
    return (
      <div className="space-y-3">
        <Metrics
          items={[
            ['Всего упаковок', result.totalPacks],
            ['Агрегировано', result.aggregatedPacks],
          ]}
        />
        <Counters title="Родители по уровням" values={result.parentsByLevel} />
        <Counters title="Дочерние по уровням" values={result.childrenByLevel} />
        <Warnings items={result.warnings} />
      </div>
    );
  }

  if (command === 'simulate-l2-aggregation') {
    const result = data as SimulateL2AggregationResult;
    return (
      <div className="space-y-3">
        <Metrics
          items={[
            ['Всего упаковок', result.totalPacks],
            ['Агрегировано', result.aggregatedPacks],
          ]}
        />
        <div className="space-y-2">
          {Object.entries(result.levels).map(([name, level]) => (
            <div key={name} className="rounded-md border p-3 text-sm">
              <div className="mb-2 font-medium">Уровень {level.level}</div>
              <div className="grid gap-1 text-muted-foreground sm:grid-cols-2">
                <span>Родительский уровень: {level.parentLevel ?? '—'}</span>
                <span>Родителей: {level.parentCount}</span>
                <span>Назначено дочерних: {level.childrenAssigned}</span>
                <span>Вместимость: {level.capacity}</span>
                <span>Осталось: {level.remaining}</span>
              </div>
            </div>
          ))}
        </div>
        <Warnings items={result.warnings} />
      </div>
    );
  }

  return null;
}

interface AdminJobActionsProps {
  jobId: AdminJobId;
  currentStatus?: number;
}

export function AdminJobActions({
  jobId,
  currentStatus,
}: AdminJobActionsProps) {
  const [command, setCommand] = useState<AdminCommand | null>(null);
  const [forceStatusOpen, setForceStatusOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [comment, setComment] = useState('');
  const [result, setResult] = useState<{
    command: AdminCommand;
    title: string;
    data: unknown;
  } | null>(null);

  const statuses = useAdminJobStatuses(forceStatusOpen);
  const retry = useRetryAdminJob();
  const reset = useResetAdminJob();
  const resetCodes = useResetAdminJobCodesFromL2();
  const resetReporting = useResetAdminJobReporting();
  const simulateCodes = useSimulateAdminJobCodesFromL2();
  const simulateAggregation = useSimulateAdminJobAggregation();
  const simulateL2Aggregation = useSimulateAdminJobL2Aggregation();
  const forceStatus = useForceAdminJobStatus();

  const isPending =
    retry.isPending ||
    reset.isPending ||
    resetCodes.isPending ||
    resetReporting.isPending ||
    simulateCodes.isPending ||
    simulateAggregation.isPending ||
    simulateL2Aggregation.isPending ||
    forceStatus.isPending;

  const showSuccess = (
    completedCommand: AdminCommand,
    response: ApiEnvelope<unknown>
  ) => {
    const title = commandText[completedCommand].title;
    toast.success(title);
    if (response.data !== undefined && response.data !== null) {
      setResult({ command: completedCommand, title, data: response.data });
    }
  };

  const showError = (error: unknown) => {
    const apiError = extractApiError(error);
    toast.error('Административная операция не выполнена', {
      description: apiError.message,
    });
  };

  const runCommand = async () => {
    if (!command) return;

    try {
      let response: ApiEnvelope<unknown>;
      switch (command) {
        case 'retry':
          response = await retry.mutateAsync(jobId);
          break;
        case 'reset':
          response = await reset.mutateAsync(jobId);
          break;
        case 'reset-codes':
          response = await resetCodes.mutateAsync(jobId);
          break;
        case 'reset-reporting':
          response = await resetReporting.mutateAsync(jobId);
          break;
        case 'simulate-codes':
          response = await simulateCodes.mutateAsync(jobId);
          break;
        case 'simulate-aggregation':
          response = await simulateAggregation.mutateAsync(jobId);
          break;
        case 'simulate-l2-aggregation':
          response = await simulateL2Aggregation.mutateAsync(jobId);
          break;
      }

      showSuccess(command, response);
      setCommand(null);
    } catch (error) {
      showError(error);
    }
  };

  const applyForcedStatus = async () => {
    if (targetStatus === '') return;

    try {
      await forceStatus.mutateAsync({
        id: jobId,
        body: {
          targetStatus: Number(targetStatus),
          comment: comment.trim() || undefined,
        },
      });
      toast.success('Статус задания изменён');
      setForceStatusOpen(false);
      setComment('');
    } catch (error) {
      showError(error);
    }
  };

  const statusItems = statuses.data?.data ?? [];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isPending}>
            <ShieldAlert />
            Администрирование
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-72">
          <DropdownMenuLabel>Операции с заданием</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setCommand('retry')}>
            <RotateCcw />
            Повторить обработку
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setTargetStatus('');
              setForceStatusOpen(true);
            }}
          >
            <ShieldAlert />
            Установить статус вручную
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCommand('reset')}>
            <RotateCcw />
            Сбросить в черновик
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Диагностика</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setCommand('reset-codes')}>
            <Bug />
            Сбросить коды от L2
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCommand('reset-reporting')}>
            <Bug />
            Сбросить отчётность
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCommand('simulate-codes')}>
            <Bug />
            Симулировать коды от L2
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setCommand('simulate-aggregation')}
          >
            <Bug />
            Симулировать агрегацию
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setCommand('simulate-l2-aggregation')}
          >
            <Bug />
            Симулировать агрегацию L2
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={command !== null}
        onOpenChange={(open) => !open && !isPending && setCommand(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {command ? commandText[command].title : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {command ? commandText[command].description : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                void runCommand();
              }}
            >
              {isPending
                ? 'Выполнение…'
                : command
                  ? commandText[command].confirm
                  : 'Выполнить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={forceStatusOpen} onOpenChange={setForceStatusOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="border-b bg-muted/30 px-6 py-5">
            <DialogTitle className="text-lg">Изменить статус задания</DialogTitle>
            <DialogDescription>
              Укажите статус, который нужно установить вручную.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 px-6 py-5">
            <div className="rounded-lg border bg-muted/20 p-4 text-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Текущий статус
              </div>
              <div className="mt-1 text-base font-medium">
                {statusItems.find((status) => status.value === currentStatus)
                  ?.description ?? currentStatus ?? '—'}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-job-status">Установить статус</Label>
              <Select value={targetStatus} onValueChange={setTargetStatus}>
                <SelectTrigger
                  id="admin-job-status"
                  disabled={statuses.isLoading}
                >
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  {statusItems
                    .filter((status) => status.value !== currentStatus)
                    .map((status) => (
                      <SelectItem
                        key={status.value}
                        value={String(status.value)}
                      >
                        {status.description} ({status.value})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-job-comment">
                Комментарий <span className="text-muted-foreground">(необязательно)</span>
              </Label>
              <Textarea
                id="admin-job-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Причина ручного изменения статуса"
                className="min-h-24 resize-y"
              />
            </div>
          </div>

          <DialogFooter className="border-t bg-muted/20 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => setForceStatusOpen(false)}
              disabled={isPending}
            >
              Отмена
            </Button>
            <Button
              onClick={() => void applyForcedStatus()}
              disabled={targetStatus === '' || isPending}
            >
              {isPending ? 'Сохранение…' : 'Установить статус'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={result !== null} onOpenChange={() => setResult(null)}>
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{result?.title}</DialogTitle>
            <DialogDescription>
              Backend вернул результат диагностической операции.
            </DialogDescription>
          </DialogHeader>
          {result && (
            <>
              <DebugCommandResult
                command={result.command}
                data={result.data}
              />
              <details className="rounded-md border p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Технический ответ
                </summary>
                <pre className="mt-3 max-h-[35vh] overflow-auto rounded-md bg-muted p-4 text-xs">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            </>
          )}
          <DialogFooter>
            <Button onClick={() => setResult(null)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
