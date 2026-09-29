import { endpoints, http } from '@shared/api/endpoints';
import { useQuery } from '@tanstack/react-query';
import {
  createTasksColumns,
  TaskSelectionProvider,
} from '../models/TasksColums.tsx';
import { EntityList } from '@shared/components/EntityList';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import { memo, useMemo, useState } from 'react';
import type { LineDto } from '@features/Lines/types.ts';
import type { MaterialDto } from '@features/Materials/types.ts';
import { apiClientInn } from '@shared/api/httpInn.ts';
import type { PackageDto } from '@features/Packages/types.ts';
import type { EnumsUnits } from '@shared/api/hooks/enums/types.ts';
import type { ApiEnvelope, ApiPagedEnvelope } from '@shared/api/contracts';
import {
  AdminJobBulkActions,
  AdminJobListFilters,
  AdminJobsToolbar,
} from '../admin/ui';
import type {
  AdminJobDto,
  AdminJobFilterRequest,
  AdminJobId,
  AdminJobStatus,
} from '../admin/types';
import { Button } from '@shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type AdminJobsListEnvelope = ApiEnvelope<AdminJobDto[]> & {
  pagination?: ApiPagedEnvelope<AdminJobDto[]>['pagination'];
};

const queryReferenceData = () =>
  Promise.all([
    endpoints.lines.list.call<LineDto[]>(apiClientInn),
    endpoints.enums.get.call<EnumsUnits>(http, {
      params: {
        name: 'job-type',
      },
    }),
    endpoints.enums.get.call<EnumsUnits<{ color: string }>>(http, {
      params: {
        name: 'job-status',
      },
    }),
    endpoints.materials.list.call<MaterialDto[]>(apiClientInn),
    endpoints.packages.list.call<PackageDto[]>(apiClientInn),
  ] as const);

const queryJobs = (filter: AdminJobFilterRequest) =>
  endpoints.adminJobs.list.call<AdminJobDto[], AdminJobsListEnvelope>(http, {
    query: filter,
  });

function TasksPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = useState<AdminJobStatus>();
  const [lineIds, setLineIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<AdminJobId>>(
    new Set()
  );

  const filter = useMemo<AdminJobFilterRequest>(
    () => ({
      page,
      size,
      status,
      lineId: lineIds.length > 0 ? lineIds : undefined,
      searchQuery: searchQuery.trim() || undefined,
    }),
    [lineIds, page, searchQuery, size, status]
  );
  const jobsQuery = useQuery({
    queryKey: [...endpoints.adminJobs.list.__tags, filter],
    queryFn: () => queryJobs(filter),
    refetchInterval: 4000,
  });
  const referenceDataQuery = useQuery({
    queryKey: [
      'tasks:list:reference-data',
      ...endpoints.lines.list.__tags,
      ...endpoints.enums.get.__tags,
      ...endpoints.materials.list.__tags,
      ...endpoints.packages.list.__tags,
    ],
    queryFn: queryReferenceData,
    staleTime: 5 * 60 * 1000,
  });

  const lines = referenceDataQuery.data?.[0].data ?? [];
  const statuses = referenceDataQuery.data?.[2].data ?? {};
  const data = useMemo(() => {
    const tasks = jobsQuery.data?.data;
    const referenceData = referenceDataQuery.data;

    if (!tasks || !referenceData) return [];

    const [linesResponse, typesResponse, statusesResponse, materials, packages] =
      referenceData;
    const mapMaterials = new Map(
      materials.data.map((material) => [material.id, material])
    );
    const mapPackages = new Map(packages.data.map((pack) => [pack.id, pack]));
    const mapLines = new Map(
      linesResponse.data.map((line) => [String(line.id), line])
    );

    return tasks.map((task) => {
      const lineId = task.lineId == null ? '' : String(task.lineId);
      const materialId = task.material?.id;
      const packageId = task.package?.id;

      return {
        ...task,
        lineId,
        line: mapLines.get(lineId),
        type: typesResponse.data[task.jobType],
        statusStartTime: undefined,
        status: statusesResponse.data[task.jobStatus],
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
  }, [jobsQuery.data, referenceDataQuery.data]);

  const selectedJobs = useMemo(
    () => (data ?? []).filter((job) => selectedIds.has(job.id)),
    [data, selectedIds]
  );
  const visibleSelectedIds = useMemo(
    () => new Set(selectedJobs.map((job) => job.id)),
    [selectedJobs]
  );
  const visibleIds = useMemo(
    () => (data ?? []).map((job) => job.id),
    [data]
  );
  const columns = useMemo(() => createTasksColumns(), []);
  const pagination = jobsQuery.data?.pagination;
  const effectivePage = pagination?.page ?? page;
  const firstRecord = pagination?.total
    ? (effectivePage - 1) * pagination.size + 1
    : 0;
  const lastRecord = pagination && data.length > 0
    ? Math.min(firstRecord + data.length - 1, pagination.total)
    : 0;
  const totalPages = pagination
    ? Math.max(1, pagination.pages)
    : page + (data.length === size ? 1 : 0);
  const canGoNext = pagination
    ? effectivePage < pagination.pages
    : data.length === size;
  const hasActiveFilters =
    status !== undefined || lineIds.length > 0 || searchQuery.trim().length > 0;

  const clearSelection = () => setSelectedIds(new Set());

  return (
    <TaskSelectionProvider
      selectedIds={visibleSelectedIds}
      visibleIds={visibleIds}
      onSelectedIdsChange={setSelectedIds}
    >
      <EntityList
        search={{
          placeholder: 'Номер задания или партии…',
          value: searchQuery,
          onChange: (value) => {
            setSearchQuery(value);
            setPage(1);
            clearSelection();
          },
          delay: 500,
          local: false,
        }}
        title={'Задания'}
        data={data}
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
        isLoading={jobsQuery.isLoading || referenceDataQuery.isLoading}
        actionComponent={
          <>
            <AdminJobListFilters
              lines={lines}
              statuses={statuses}
              status={status}
              lineIds={lineIds}
              hasActiveFilters={hasActiveFilters}
              isLoadingLines={referenceDataQuery.isLoading}
              onStatusChange={(value) => {
                setStatus(value);
                setPage(1);
                clearSelection();
              }}
              onLineIdsChange={(value) => {
                setLineIds(value);
                setPage(1);
                clearSelection();
              }}
              onReset={() => {
                setStatus(undefined);
                setLineIds([]);
                setSearchQuery('');
                setPage(1);
                clearSelection();
              }}
            />
            <AdminJobsToolbar />
            <AdminJobBulkActions
              selectedJobs={selectedJobs}
              onSelectedIdsChange={setSelectedIds}
              onJobsDeleted={(result) => {
                if (page > 1 && result.succeededCount === data.length) {
                  setPage((current) => Math.max(1, current - 1));
                }
              }}
            />
          </>
        }
        footerToolbar={
          <div className="-m-2 flex flex-wrap items-center justify-between gap-2 bg-muted-foreground/4 px-3 py-2 text-xs text-muted-foreground">
            <div>
              {pagination
                ? `Записей ${firstRecord}-${lastRecord} из ${pagination.total}`
                : `Записей: ${data.length}`}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span>На странице:</span>
              <Select
                value={String(size)}
                onValueChange={(value) => {
                  setSize(Number(value));
                  setPage(1);
                  clearSelection();
                }}
              >
                <SelectTrigger size="sm" className="w-[72px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Предыдущая страница"
                disabled={effectivePage <= 1}
                onClick={() => {
                  setPage((current) => Math.max(1, current - 1));
                  clearSelection();
                }}
              >
                <ChevronLeft />
              </Button>
              <span className="min-w-[110px] text-center">
                Страница {effectivePage} из {totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Следующая страница"
                disabled={!canGoNext}
                onClick={() => {
                  setPage((current) => current + 1);
                  clearSelection();
                }}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        }
        onCreate={() => {
          navigate(PATHS.tasks.create);
        }}
      />
    </TaskSelectionProvider>
  );
}

export default memo(TasksPage);
