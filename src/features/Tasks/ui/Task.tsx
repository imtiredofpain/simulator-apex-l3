import { FormGenerator } from '@mrdn/app-common';
import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { Badge, SquarePen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { memo } from 'react';
import { PATHS } from '@shared/config/pathRoute';
import useQueryTask from '../hooks/useQueryTask';
import definitionTask from '../models/Definitions/task';
import useEnum from '@shared/api/hooks/enums/useEnum';
import { Tooltip, TooltipTrigger } from '@shared/components/ui/tooltip';
import DialogDeleteTask from './DialogDeleteTask';
import { Skeleton } from '@shared/components/ui/skeleton';
import type { EnumUnit } from '@shared/api/hooks/enums/types';
import { endpoints } from '@shared/api/endpoints';
import { apiClientInn } from '@shared/api/httpInn';
import { toast } from 'sonner';
import { t } from 'i18next';
import { NotFound } from '@features/Errors';
import AccordionContentItem from '@features/ApiLogs/ui/logsContents/AccordionContentItem';

function TaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: { data: actions } = {}, isLoading: isLoadingActions } =
    useEnum<EnumUnit>({
      name: 'job-actions',
    });
  const { data: { data: statuses } = {}, isLoading: isLoadingStatus } = useEnum<
    EnumUnit<{
      color: string;
    }>
  >({
    name: 'job-status',
  });
  const {
    data: {
      data: { job: task, actions: accessActions, jobStatusDetails } = {},
      timestamp = '',
    } = {},
    isLoading,
  } = useQueryTask(parseInt(id || ''));

  const handleAction = async (key: string) => {
    const res = await endpoints.tasks.action.call(apiClientInn, {
      params: { id },
      body: { action: parseInt(key) },
    });

    if (res.isSuccess)
      toast.success(
        `Действие "${actions?.[key].description}" успешно выполнено`
      );

    if (!res.isSuccess)
      toast.error('Произошла ошибка', {
        description: t(`errors.${res.message}`),
      });
  };

  const status = statuses?.[task?.jobStatus || 0];

  if (isLoading || isLoadingStatus || !id) return null;

  if (!task || !jobStatusDetails) {
    return <NotFound title="Задание не найдено" />;
  }

  return (
    <SimplePage
      title={
        <div className="flex flex-row gap-2 justify-between items-start w-full">
          <div>{task.jobNumber}</div>
          {status && (
            <div className="text-[16px]! font-normal!">
              <Badge
                style={{
                  backgroundColor: `#${status.color}36`,
                  color: `#${status.color}`,
                }}
              >
                {status.description}
              </Badge>
            </div>
          )}
        </div>
      }
      actionComponent={
        <div className="flex flex-row items-center justify-left gap-1 flex-wrap">
          <Button
            variant="submit"
            onClick={() => {
              navigate(PATHS.tasks.edit(id));
            }}
            className="dark:text-white"
          >
            <SquarePen className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
          <DialogDeleteTask idTask={task.id} />
          {isLoadingActions
            ? Array(3)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="w-24 h-9" />)
            : Object.keys(actions || {}).map((key) => {
                const forbidden = accessActions?.[key].forbidden;
                if (forbidden) return null;
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <Button
                        key={key}
                        onClick={() => {
                          handleAction(key);
                        }}
                      >
                        {actions?.[key].description}
                      </Button>
                    </TooltipTrigger>
                  </Tooltip>
                );
              })}
        </div>
      }
      contentComponent={
        <div className="overflow-hidden">
          <div>
            <FormGenerator
              definition={definitionTask}
              initialValues={{ ...task, line: task.line.name }}
              key={timestamp + task.id}
              engineConfig={{
                clearOnHideDefault: true,
                visibleSubmitButton: true,
                visibleCancelButton: false,
                visibleErrors: true,
              }}
            />
          </div>

          <div className="flex flex-col gap-3 mt-3 flex-1 outline-none overflow-auto">
            <AccordionContentItem
              name="Детали задания"
              data={JSON.stringify(task, null, 2)}
            />
            <AccordionContentItem
              name="Детали статуса"
              data={JSON.stringify(jobStatusDetails, null, 2)}
            />
          </div>
        </div>
      }
    />
  );
}

export default memo(TaskPage);
