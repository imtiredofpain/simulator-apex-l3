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
import useQueryTask from '../hooks/useQueryTask';
import { Spin } from '@mrdn/app-common';
import { toast } from 'sonner';
import { useMutationDeleteTask } from '../hooks/useMutationDeleteTask';
import { useNavigate } from 'react-router-dom';

interface DialogDeleteTaskProps {
  idTask: TaskDto['id'];
}

function DialogDeleteTask(props: DialogDeleteTaskProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { idTask: id } = props;
  const { data: { data: { job: task } = {} } = {}, isLoading: isLoadingTask } =
    useQueryTask(id);
  const { mutate: deleteTask, status: fetchStatus } = useMutationDeleteTask(
    id,
    (s) => {
      if (s == 'success') {
        setOpen(false);
        navigate(-1);
      } else toast.error('При удалении задания произошла ошибка');
    }
  );
  const isLoadingDeleteTask = fetchStatus === 'pending';

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
