import { memo, useMemo } from 'react';
import { Badge } from '@shared/components/ui/badge';
import { Check, Timer } from 'lucide-react';
import { useNow } from '@mrdn/app-common';
import { formatByUnit } from '@shared/lib/formatByUnit';
import type { TaskDto } from '../types';

interface CellTimeProps {
  times: {
    plannedStartTime: TaskDto['plannedStartTime'];
    plannedEndTime: TaskDto['plannedEndTime'];
    actualStartTime?: TaskDto['actualStartTime'];
    actualEndTime?: TaskDto['actualEndTime'];
  };
}

function CellTime({ times }: CellTimeProps) {
  const now = useNow(5000);

  const state = useMemo(() => {
    const nowTs = now.getTime();

    // Фактическое завершение
    if (times.actualEndTime) {
      const time = new Date(times.actualEndTime).getTime();
      return {
        labelPast: 'Завершено',
        labelFuture: 'Завершение',
        time,
        isCompleted: true,
        variant: 'success',
      };
    }

    // Фактическое начало (в работе)
    if (times.actualStartTime) {
      const time = new Date(times.actualStartTime).getTime();
      return {
        labelPast: 'В работе',
        labelFuture: 'Начало',
        time,
        isCompleted: nowTs >= time,
        variant: nowTs >= time ? 'success' : 'outline',
      };
    }

    // Плановое завершение
    if (times.plannedEndTime) {
      const time = new Date(times.plannedEndTime).getTime();
      return {
        labelPast: nowTs >= time ? 'Завершено' : 'Завершено',
        labelFuture: nowTs >= time ? 'Завершено' : 'Завершение',
        time,
        isCompleted: nowTs >= time,
        variant: nowTs >= time ? 'success' : 'outline',
      };
    }

    // Плановое начало
    const plannedTime = new Date(times.plannedStartTime).getTime();

    return {
      labelPast: 'Запланировано', // TODO: Можно писать "запланировано"
      labelFuture: 'Начало',
      time: plannedTime,
      isCompleted: nowTs >= plannedTime,
      variant:
        nowTs >= plannedTime ? ('success' as const) : ('outline' as const),
    };
  }, [times, now]);

  const { durationMs, duration } = useMemo(() => {
    const diff = now.getTime() - state.time;

    return {
      durationMs: diff,
      duration: formatByUnit(Math.abs(diff), { type: 'duration' }),
    };
  }, [state.time, now]);

  const isPast = durationMs > 0;

  return (
    <div className="flex flex-col gap-1 tabular-nums">
      <Badge
        variant={state.isCompleted ? 'success' : 'outline'}
        className="text-[10px] font-normal pl-1 flex gap-1 items-center w-fit"
      >
        {isPast ? <Check size={14} /> : <Timer size={14} />}
        {isPast
          ? `${state.labelPast}: ${duration} назад`
          : `${state.labelFuture} через: ${duration}`}
      </Badge>
    </div>
  );
}

export default memo(CellTime);
