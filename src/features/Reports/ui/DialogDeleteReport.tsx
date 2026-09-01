import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@shared/components/ui/alert-dialog';
import { Button } from '@shared/components/ui/button';
import { PATHS } from '@shared/config/pathRoute';
import extractApiError from '@shared/api/extractApiError';
import { Spin } from '@mrdn/app-common';
import { Trash } from 'lucide-react';
import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useMutationDeleteReport } from '../hooks/useMutationDeleteReport';
import type { IReport } from '../types';

interface DialogDeleteReportProps {
  report: IReport;
}

function DialogDeleteReport({ report }: DialogDeleteReportProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const removeReport = useMutationDeleteReport();

  const handleDelete = () => {
    removeReport.mutate(report.id, {
      onSuccess: () => {
        toast.success('Отчёт удалён');
        setOpen(false);
        navigate(PATHS.reports.byType(report.documentType), { replace: true });
      },
      onError: (error) => {
        const apiError = extractApiError(error);
        toast.error('При удалении отчёта произошла ошибка', {
          description: apiError.message,
        });
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="mr-2 size-4" />
          Удалить
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Удаление отчёта: {report.documentNumber}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить отчёт {report.documentNumber}? Это
            действие нельзя будет отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={removeReport.isPending}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={removeReport.isPending}
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
          >
            {removeReport.isPending ? (
              <span className="flex items-center gap-2">
                <Spin size={15} width={3} />
                Удаление
              </span>
            ) : (
              'Удалить'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default memo(DialogDeleteReport);
