import { useQueryPackStats } from "../hooks/useQueryPackStats";
import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Skeleton } from "@shared/components/ui/skeleton";
import { EntityList } from "@shared/components/EntityList";
import { packsColumns } from "../models/packsColumns";
import { endpoints, http } from "@shared/api/endpoints";
import type { EnumsUnits } from "@shared/api/hooks/enums/types.ts";
import { useQuery } from '@tanstack/react-query';
import type { PackDto } from "../types";
import { apiClientInn } from '@shared/api/httpInn.ts';
import type { TaskDto } from "@features/Tasks/types";

interface PackStatsProps {
  jobId: string | number;
}

function PackStats({ jobId }: PackStatsProps) {
  const { data: stats, isLoading: isLoadingStats } = useQueryPackStats(String(jobId));

  // Запрос для получения данных пакетов по их ID
  const { data: packsData, isLoading: isLoadingPacks } = useQuery({
    queryKey: ['packs-by-stats', jobId, stats?.packIds],
    queryFn: async () => {
      if (!stats?.packIds || stats.packIds.length === 0) {
        return [];
      }

      const [packs, tasks, levels, statuses] = await Promise.all([
        endpoints.packs.list.call<PackDto[]>(apiClientInn),
        endpoints.tasks.list.call<TaskDto[]>(apiClientInn),
        endpoints.enums.get.call<EnumsUnits>(http, {
          params: { name: "package-levels" },
        }),
        endpoints.enums.get.call<EnumsUnits>(http, {
          params: { name: "pack-status" },
        }),
      ]);

      const mapTasks = new Map(tasks.data.map((task) => [task.id, task]));
      
      // Фильтруем только те пакеты, которые есть в packIds
      const filteredPacks = packs.data.filter((pack) => 
        stats.packIds.includes(pack.id)
      );

      return filteredPacks.map((pack) => ({
        ...pack,
        level: levels.data[pack.packageLevel],
        status: statuses.data[pack.status],
        task: pack.reservedForJobId != null
          ? mapTasks.get(pack.reservedForJobId)
          : undefined,
      }));
    },
    enabled: !!stats?.packIds && stats.packIds.length > 0,
  });

  const isLoading = isLoadingStats || isLoadingPacks;

  if (isLoadingStats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!stats) {
    return <div>Данные статистики не найдены</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Общая статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Job ID</p>
              <p className="text-lg font-semibold">{stats.jobId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Всего</p>
              <p className="text-lg font-semibold">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>По уровням</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.byLevel.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{item.level}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>По статусам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.byStatus.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{item.status}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>По статусам производства</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.byProductionStatus.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{item.status}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Флаги</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Зарезервировано</p>
              <p className="text-lg font-semibold">{stats.flags.reserved}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Отправлено на печать</p>
              <p className="text-lg font-semibold">{stats.flags.sentToPrint}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Прочитано</p>
              <p className="text-lg font-semibold">{stats.flags.read}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Заполнено</p>
              <p className="text-lg font-semibold">{stats.flags.fill}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Подтверждено</p>
              <p className="text-lg font-semibold">{stats.flags.confirmed}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Агрегировано</p>
              <p className="text-lg font-semibold">{stats.flags.aggregated}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Упаковано</p>
              <p className="text-lg font-semibold">{stats.flags.packaged}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Недействительно</p>
              <p className="text-lg font-semibold">{stats.flags.invalid}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">С ошибками</p>
              <p className="text-lg font-semibold">{stats.flags.withErrors}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Произведено и отчитано</p>
              <p className="text-lg font-semibold">{stats.flags.producedReported}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Производство отправлено на линию</p>
              <p className="text-lg font-semibold">{stats.flags.productionJobSendToLine}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Предпечать отправлена на линию</p>
              <p className="text-lg font-semibold">{stats.flags.preprintJobSendToLine}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список пакетов */}
      {isLoadingPacks ? (
        <Card>
          <CardHeader>
            <CardTitle>Пакеты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : packsData && packsData.length > 0 ? (
        <EntityList
          search={{
            placeholder: "Поиск по пакетам...",
          }}
          title={`Пакеты (${stats.packIds.length})`}
          columns={packsColumns}
          data={packsData}
          isLoading={false}
          hiddenColumns={{
            id: true,
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Пакеты</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-4">
              Нет пакетов для отображения
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { PackStats };