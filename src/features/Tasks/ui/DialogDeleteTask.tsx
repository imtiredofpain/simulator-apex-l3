import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@shared/components/ui/alert-dialog';
import { Button } from '@shared/components/ui/button';
import { Trash } from 'lucide-react';
import { memo, useState } from 'react';
import type { TaskDto } from '../types';
import { Spin } from '@mrdn/app-common';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAdminJob, useRemoveAdminJob } from '../admin/hooks';
import extractApiError from '@shared/api/extractApiError';

interface DialogDeleteTaskProps {
  idTask: TaskDto['id'];
}

function DialogDeleteTask(props: DialogDeleteTaskProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { idTask: id } = props;
  const { data: { data: { job: task } = {} } = {}, isLoading: isLoadingTask } =
    useAdminJob(id);
  const removeJob = useRemoveAdminJob();
  const isLoadingDeleteTask = removeJob.isPending;

  const deleteTask = () => {
    removeJob.mutate(id, {
      onSuccess: () => {
        toast.success('Задание удалено');
        setOpen(false);
        navigate(-1);
      },
      onError: (error) => {
        const apiError = extractApiError(error);
        toast.error('При удалении задания произошла ошибка', {
          description: apiError.message,
        });
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="w-4 h-4 mr-2" />
          Удалить
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          {!isLoadingTask && (
            <AlertDialogTitle>
              Удаление задания: {task?.jobNumber}
            </AlertDialogTitle>
          )}

          {isLoadingTask ? (
            <div className="flex flex-row gap-3 items-center">
              <Spin width={4} />
              <div>
                <div className="font-bold">Загрузка задания</div>
                <div className="text-muted-foreground text-[14px]">
                  Пожалуйста, подождите...
                </div>
              </div>
            </div>
          ) : (
            `Вы действительно хотите удалить задание: ${task?.jobNumber}, это
          действие нельзя будет отменить!`
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoadingDeleteTask}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoadingDeleteTask || isLoadingTask}
            onClick={(e) => {
              e.preventDefault();
              deleteTask();
            }}
          >
            {isLoadingDeleteTask ? (
              <div className="flex gap-2 items-center">
                <Spin size={15} width={3} />
                <div>Удаление</div>
              </div>
            ) : (
              'Удалить'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default memo(DialogDeleteTask);
