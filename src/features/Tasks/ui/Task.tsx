import { SimplePage } from "@shared/components/SimplePage";
import { Button } from "@shared/components/ui/button";
import { Badge, SquarePen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { memo } from "react";
import { PATHS } from "@shared/config/pathRoute";
import useEnum from "@shared/api/hooks/enums/useEnum";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@shared/components/ui/tooltip";
import DialogDeleteTask from "./DialogDeleteTask";
import { Skeleton } from "@shared/components/ui/skeleton";
import type { EnumUnit } from "@shared/api/hooks/enums/types";
import { toast } from "sonner";
import { NotFound } from "@features/Errors";
import { AdminJobActions } from "../admin/ui";
import { useAdminJob, useExecuteAdminJobAction } from "../admin/hooks";
import extractApiError from "@shared/api/extractApiError";
import TaskDetails from "./TaskDetails";

function TaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: { data: actions } = {}, isLoading: isLoadingActions } =
    useEnum<EnumUnit>({
      name: "job-actions",
    });
  const { data: { data: statuses } = {} } = useEnum<
    EnumUnit<{ color: string }>
  >({ name: "job-status" });
  const {
    data: {
      data: { job: task, actions: accessActions, jobStatusDetails } = {},
    } = {},
    isLoading,
  } = useAdminJob(id ? Number(id) : undefined);
  const executeAction = useExecuteAdminJobAction();

  const handleAction = async (key: string) => {
    const label = actions?.[key]?.description || `Действие ${key}`;
    try {
      const res = await executeAction.mutateAsync({
        id: Number(id),
        body: { action: Number(key) },
      });

      if (res.isSuccess) {
        toast.success(`Действие «${label}» успешно выполнено`);
        return;
      }

      toast.error("Произошла ошибка", {
        description: res.message,
      });
    } catch (error) {
      const apiError = extractApiError(error);
      toast.error(`Не удалось выполнить действие «${label}»`, {
        description: apiError.message,
      });
    }
  };

  const status = statuses?.[task?.jobStatus || 0];
  const actionKeys = Array.from(
    new Set([
      ...Object.keys(actions || {}),
      ...Object.keys(accessActions || {}),
    ]),
  );

  if (isLoading || !id) return null;

  if (!task || !jobStatusDetails) {
    return <NotFound title="Задание не найдено" />;
  }

  return (
    <SimplePage
      title={
        <div className="flex w-full flex-row items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs! font-medium! uppercase tracking-wide text-muted-foreground">
              Задание #{task.id}
            </div>
            <div className="mt-1 break-all">{task.jobNumber}</div>
          </div>
          <div className="shrink-0 text-[16px]! font-normal!">
            <Badge
              style={
                status?.color
                  ? {
                      backgroundColor: `#${status.color.replace("#", "")}36`,
                      color: `#${status.color.replace("#", "")}`,
                    }
                  : undefined
              }
            >
              {status?.description || jobStatusDetails.description}
            </Badge>
          </div>
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
          <AdminJobActions
            jobId={task.id}
            currentStatus={Number(task.jobStatus)}
          />
          {isLoadingActions
            ? Array(3)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="w-24 h-9" />)
            : actionKeys.map((key) => {
                const availability = accessActions?.[key];
                const forbidden = !availability || availability.forbidden;
                const label = actions?.[key]?.description || `Действие ${key}`;
                const button = (
                  <Button
                    disabled={forbidden || executeAction.isPending}
                    onClick={() => handleAction(key)}
                  >
                    {label}
                  </Button>
                );

                if (forbidden) return;

                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <span className="inline-flex" tabIndex={0}>
                        {button}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>
                      {availability?.why ||
                        "Backend не разрешил действие в текущем статусе"}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
        </div>
      }
      contentComponent={
        <TaskDetails
          job={task}
          statusDetails={jobStatusDetails}
          actionAvailability={accessActions || {}}
          statusLabel={status?.description}
          statusColor={status?.color}
        />
      }
    />
  );
}

export default memo(TaskPage);
