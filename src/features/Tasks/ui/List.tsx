import { endpoints, http } from '@shared/api/endpoints';
import { useQuery } from '@tanstack/react-query';
import type { TaskDto } from '../types.ts';
import { tasksColumns } from '../models/TasksColums.tsx';
import { EntityList } from '@shared/components/EntityList';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import { memo } from 'react';
import type { LineDto } from '@features/Lines/types.ts';
import type { MaterialDto } from '@features/Materials/types.ts';
import { apiClientInn } from '@shared/api/httpInn.ts';
import type { PackageDto } from '@features/Packages/types.ts';
import type { EnumsUnits } from "@shared/api/hooks/enums/types.ts";

const queryFn = () =>
  Promise.all([
    endpoints.tasks.list.call<TaskDto[]>(apiClientInn),
    endpoints.lines.list.call<LineDto[]>(apiClientInn),
    endpoints.enums.get.call<EnumsUnits>(http, {
      params: {
        name: "job-type",
      },
    }),
    endpoints.enums.get.call<EnumsUnits<{ color: string }>>(http, {
      params: {
        name: "job-status",
      },
    }),
    endpoints.materials.list.call<MaterialDto[]>(apiClientInn),
    endpoints.packages.list.call<PackageDto[]>(apiClientInn),
  ]);

function TasksPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: [...endpoints.tasks.list.__tags],
    queryFn,
    refetchInterval: 4000,
    select: ([tasks, lines, t, s, materials, packages]) => {
      const mapMaterials = new Map(
        materials.data.map((material) => [material.id, material])
      );
      const mapPackages = new Map(packages.data.map((p) => [p.id, p]));
      const mapLines = new Map(lines.data.map((line) => [line.id, line]));
      const types = t.data;
      const statuses = s.data;
      return tasks.data.map((task) => {
        return {
          ...task,
          line: mapLines.get(task.lineId),
          type: types[task.jobType],
          statusStartTime: undefined,
          status: statuses[task.jobStatus],
          material: task.materialId
            ? mapMaterials.get(task.materialId)
            : undefined,
          packages: task.packageId
            ? mapPackages.get(task.packageId)
            : undefined,
        };
      });
    },
  });

  // if (!data) return null;

  return (
    <EntityList
      search={{
        placeholder: "Поиск по заданиям...",
      }}
      title={"Задания"}
      data={data || []}
      hiddenColumns={{
        id: false,
        lineId: false,
        actualStartTime: false,
        actualEndTime: false,
        materialId: false,
        packageId: false,
        packages: false,
        status: false,
      }}
      columns={tasksColumns}
      isLoading={isLoading}
      onCreate={() => {
        navigate(PATHS.tasks.create);
      }}
    />
  );
}

export default memo(TasksPage);
