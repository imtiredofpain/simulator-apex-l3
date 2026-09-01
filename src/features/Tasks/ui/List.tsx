import { endpoints, http } from '@shared/api/endpoints';
import { useQuery } from '@tanstack/react-query';
import { createTasksColumns } from '../models/TasksColums.tsx';
import { EntityList } from '@shared/components/EntityList';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import { memo, useMemo, useState } from 'react';
import type { LineDto } from '@features/Lines/types.ts';
import type { MaterialDto } from '@features/Materials/types.ts';
import { apiClientInn } from '@shared/api/httpInn.ts';
import type { PackageDto } from '@features/Packages/types.ts';
import type { EnumsUnits } from "@shared/api/hooks/enums/types.ts";
import type { AdminJobDto } from '../admin/types';
import { AdminJobBulkActions, AdminJobsToolbar } from '../admin/ui';
import type { AdminJobId } from '../admin/types';

const queryFn = () =>
  Promise.all([
    endpoints.adminJobs.list.call<AdminJobDto[]>(http),
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
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<AdminJobId>>(
    new Set()
  );
  const { data, isLoading } = useQuery({
    queryKey: [...endpoints.adminJobs.list.__tags],
    queryFn,
    refetchInterval: 4000,
    select: ([tasks, lines, t, s, materials, packages]) => {
      const mapMaterials = new Map(
        materials.data.map((material) => [material.id, material])
      );
      const mapPackages = new Map(packages.data.map((p) => [p.id, p]));
      const mapLines = new Map(
        lines.data.map((line) => [String(line.id), line])
      );
      const types = t.data;
      const statuses = s.data;
      return tasks.data.map((task) => {
        const lineId = task.lineId == null ? '' : String(task.lineId);
        const materialId = task.material?.id;
        const packageId = task.package?.id;
        return {
          ...task,
          lineId,
          line: mapLines.get(lineId),
          type: types[task.jobType],
          statusStartTime: undefined,
          status: statuses[task.jobStatus],
          materialId,
          material: materialId ? mapMaterials.get(materialId) : undefined,
          packageId,
          packages: packageId ? mapPackages.get(packageId) : undefined,
          plannedStartTime: task.plannedStartTime ?? '',
          plannedEndTime: task.plannedEndTime ?? '',
          actualStartTime: task.actualStartTime ?? undefined,
          actualEndTime: task.actualEndTime ?? undefined,
          retryAt: task.retryAt ?? '',
        };
      });
    },
  });

  const selectedJobs = useMemo(
    () => (data ?? []).filter((job) => selectedIds.has(job.id)),
    [data, selectedIds]
  );
  const visibleSelectedIds = useMemo(
    () => new Set(selectedJobs.map((job) => job.id)),
    [selectedJobs]
  );
  const columns = useMemo(
    () =>
      createTasksColumns({
        selectedIds: visibleSelectedIds,
        visibleIds: (data ?? []).map((job) => job.id),
        onSelectedIdsChange: setSelectedIds,
      }),
    [data, visibleSelectedIds]
  );

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
      columns={columns}
      isLoading={isLoading}
      actionComponent={
        <>
          <AdminJobsToolbar />
          <AdminJobBulkActions
            selectedJobs={selectedJobs}
            onSelectedIdsChange={setSelectedIds}
          />
        </>
      }
      onCreate={() => {
        navigate(PATHS.tasks.create);
      }}
    />
  );
}

export default memo(TasksPage);
