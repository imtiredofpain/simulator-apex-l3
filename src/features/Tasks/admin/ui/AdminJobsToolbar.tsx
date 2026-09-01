import { useState } from 'react';
import {
  Archive,
  CalendarClock,
  Check,
  ChevronsUpDown,
  CopyPlus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@shared/components/ui/popover';
import { PATHS } from '@shared/config/pathRoute';
import extractApiError from '@shared/api/extractApiError';
import { useSelectedInn } from '@features/Organizations';
import {
  useAdminJobMaterials,
  useAdminJobOrganizations,
  useAdminJobStatuses,
  useAdminJobTemplates,
  useAutoJobSchedules,
  useBulkRetryAdminJobs,
  useCreateAdminJobFromTemplate,
  useCreateAutoJobSchedule,
  useDeletedAdminJobs,
  useDeleteAutoJobSchedule,
} from '../hooks';
import type {
  AdminJobMaterialOption,
  AdminJobOrganizationOption,
} from '../types';

const DEFAULT_OPTION = '__default__';
const AUTO_ORGANIZATION = '__current__';

function optionalNumber(value: string) {
  const normalized = value.trim();
  return normalized === '' ? undefined : Number(normalized);
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString('ru-RU') : '—';
}

function isProductionTemplate(jobType?: string) {
  return jobType?.toLowerCase() === 'production';
}

function resolveOrganizationId(selection: string, currentId?: number) {
  if (selection === AUTO_ORGANIZATION) return currentId;
  if (selection === DEFAULT_OPTION) return undefined;
  return optionalNumber(selection);
}

function materialLabel(material: AdminJobMaterialOption) {
  return `${material.materialNumber} — ${material.name}`;
}

function OrganizationSelect({
  value,
  onValueChange,
  organizations,
  currentOrganizationId,
  isLoading,
}: {
  value: string;
  onValueChange: (value: string) => void;
  organizations: AdminJobOrganizationOption[];
  currentOrganizationId?: number;
  isLoading: boolean;
}) {
  const effectiveValue =
    value === AUTO_ORGANIZATION
      ? currentOrganizationId
        ? String(currentOrganizationId)
        : DEFAULT_OPTION
      : value;

  return (
    <Select value={effectiveValue} onValueChange={onValueChange}>
      <SelectTrigger disabled={isLoading}>
        <SelectValue
          placeholder={isLoading ? 'Загрузка…' : 'Выберите организацию'}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={DEFAULT_OPTION}>
          По умолчанию из backend
        </SelectItem>
        {organizations.map((organization) => (
          <SelectItem key={organization.id} value={String(organization.id)}>
            <div>
              <div className="font-medium">{organization.name}</div>
              <div className="text-xs text-muted-foreground">
                ИНН: {organization.inn}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MaterialMultiSelect({
  value,
  onValueChange,
  materials,
  isLoading,
}: {
  value: number[];
  onValueChange: (value: number[]) => void;
  materials: AdminJobMaterialOption[];
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedMaterials = materials.filter((material) =>
    value.includes(material.id)
  );
  const summary =
    selectedMaterials.length === 0
      ? 'Использовать материал из шаблона'
      : selectedMaterials.length === 1
        ? materialLabel(selectedMaterials[0])
        : `Выбрано материалов: ${selectedMaterials.length}`;

  const toggle = (materialId: number) => {
    onValueChange(
      value.includes(materialId)
        ? value.filter((id) => id !== materialId)
        : [...value, materialId]
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={isLoading}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {isLoading ? 'Загрузка материалов…' : summary}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder="Номер или название материала…" />
          <CommandList>
            <CommandEmpty>Материалы не найдены.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="Использовать материал из шаблона"
                onSelect={() => onValueChange([])}
              >
                <Check className={value.length === 0 ? 'opacity-100' : 'opacity-0'} />
                Использовать материал из шаблона
              </CommandItem>
              {materials.map((material) => {
                const selected = value.includes(material.id);
                return (
                  <CommandItem
                    key={material.id}
                    value={`${material.materialNumber} ${material.name} ${material.id}`}
                    onSelect={() => toggle(material.id)}
                  >
                    <Check
                      className={selected ? 'opacity-100' : 'opacity-0'}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {material.materialNumber}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {material.name}
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function AdminJobsToolbar() {
  const selectedInn = useSelectedInn();
  const [bulkRetryOpen, setBulkRetryOpen] = useState(false);
  const [deletedOpen, setDeletedOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [schedulesOpen, setSchedulesOpen] = useState(false);
  const [retryStatus, setRetryStatus] = useState('all');

  const [templateName, setTemplateName] = useState('');
  const [organizationId, setOrganizationId] = useState(AUTO_ORGANIZATION);
  const [materialId, setMaterialId] = useState('');

  const [scheduleTemplate, setScheduleTemplate] = useState('');
  const [scheduleOrganizationId, setScheduleOrganizationId] =
    useState(AUTO_ORGANIZATION);
  const [scheduleMaterialIds, setScheduleMaterialIds] = useState<number[]>([]);
  const [scheduleInterval, setScheduleInterval] = useState('00:30:00');
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleMaxRuns, setScheduleMaxRuns] = useState('');

  const statuses = useAdminJobStatuses();
  const deletedJobs = useDeletedAdminJobs(deletedOpen);
  const templates = useAdminJobTemplates(templateOpen || schedulesOpen);
  const organizations = useAdminJobOrganizations(templateOpen || schedulesOpen);
  const materials = useAdminJobMaterials(templateOpen || schedulesOpen);
  const schedules = useAutoJobSchedules(schedulesOpen);
  const bulkRetry = useBulkRetryAdminJobs();
  const createFromTemplate = useCreateAdminJobFromTemplate();
  const createSchedule = useCreateAutoJobSchedule();
  const deleteSchedule = useDeleteAutoJobSchedule();

  const showError = (error: unknown) => {
    const apiError = extractApiError(error);
    toast.error('Операция не выполнена', { description: apiError.message });
  };

  const runBulkRetry = async () => {
    try {
      const response = await bulkRetry.mutateAsync(
        retryStatus === 'all' ? undefined : Number(retryStatus)
      );
      toast.success(`В очередь поставлено заданий: ${response.data}`);
      setBulkRetryOpen(false);
    } catch (error) {
      showError(error);
    }
  };

  const createJob = async () => {
    if (!templateName) return;

    try {
      const response = await createFromTemplate.mutateAsync({
        templateName,
        organizationId: resolveOrganizationId(
          organizationId,
          currentOrganization?.id
        ),
        materialId: optionalNumber(materialId),
      });
      toast.success(`Создано задание ${response.data.jobNumber}`);
      setTemplateOpen(false);
      setTemplateName('');
      setOrganizationId(AUTO_ORGANIZATION);
      setMaterialId('');
    } catch (error) {
      showError(error);
    }
  };

  const createAutoSchedule = async () => {
    if (!scheduleTemplate || !scheduleInterval.trim()) return;

    try {
      await createSchedule.mutateAsync({
        templateName: scheduleTemplate,
        organizationId: resolveOrganizationId(
          scheduleOrganizationId,
          currentOrganization?.id
        ),
        materialIds:
          scheduleMaterialIds.length > 0 ? scheduleMaterialIds : undefined,
        interval: scheduleInterval.trim(),
        startAtUtc: scheduleStart
          ? new Date(scheduleStart).toISOString()
          : undefined,
        maxRuns: optionalNumber(scheduleMaxRuns),
      });
      toast.success('Расписание автоматического создания добавлено');
      setScheduleMaterialIds([]);
      setScheduleStart('');
      setScheduleMaxRuns('');
    } catch (error) {
      showError(error);
    }
  };

  const removeSchedule = async (id: string, name: string) => {
    if (!window.confirm(`Удалить расписание «${name}»?`)) return;

    try {
      await deleteSchedule.mutateAsync(id);
      toast.success('Расписание удалено');
    } catch (error) {
      showError(error);
    }
  };

  const statusItems = statuses.data?.data ?? [];
  const templateItems = templates.data?.data ?? [];
  const organizationItems = organizations.data?.data ?? [];
  const materialItems = materials.data?.data ?? [];
  const deletedItems = deletedJobs.data?.data ?? [];
  const scheduleItems = schedules.data?.data ?? [];
  const currentOrganization = organizationItems.find(
    (organization) => organization.inn === selectedInn
  );
  const selectedTemplate = templateItems.find(
    (template) => template.name === templateName
  );
  const selectedScheduleTemplate = templateItems.find(
    (template) => template.name === scheduleTemplate
  );

  return (
    <>
      <Button variant="outline" onClick={() => setBulkRetryOpen(true)}>
        <RotateCcw />
        Повторить ошибочные
      </Button>
      <Button variant="outline" onClick={() => setTemplateOpen(true)}>
        <CopyPlus />
        Создать из шаблона
      </Button>
      <Button variant="outline" onClick={() => setSchedulesOpen(true)}>
        <CalendarClock />
        Автосоздание
      </Button>
      <Button variant="outline" onClick={() => setDeletedOpen(true)}>
        <Archive />
        Удалённые
      </Button>

      <Dialog open={bulkRetryOpen} onOpenChange={setBulkRetryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Повторить обработку заданий</DialogTitle>
            <DialogDescription>
              Можно повторить все задания с ошибками либо ограничить операцию
              конкретным статусом.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label>Статус</Label>
            <Select value={retryStatus} onValueChange={setRetryStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все доступные для повтора</SelectItem>
                {statusItems.map((status) => (
                  <SelectItem key={status.value} value={String(status.value)}>
                    {status.description} ({status.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRetryOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => void runBulkRetry()}
              disabled={bulkRetry.isPending}
            >
              {bulkRetry.isPending ? 'Выполнение…' : 'Повторить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать задание из шаблона</DialogTitle>
            <DialogDescription>
              Параметры линии, количества и типа задания будут взяты из
              backend-конфигурации шаблона.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Шаблон</Label>
              <Select
                value={templateName}
                onValueChange={(value) => {
                  setTemplateName(value);
                  setMaterialId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите шаблон" />
                </SelectTrigger>
                <SelectContent>
                  {templateItems.map((template) => (
                    <SelectItem key={template.name} value={template.name}>
                      {template.name} — {template.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Организация</Label>
                <OrganizationSelect
                  value={organizationId}
                  onValueChange={setOrganizationId}
                  organizations={organizationItems}
                  currentOrganizationId={currentOrganization?.id}
                  isLoading={organizations.isLoading}
                />
              </div>
              {isProductionTemplate(selectedTemplate?.jobType) && (
              <div className="grid gap-2">
                <Label>Материал</Label>
                <Select
                  value={materialId || DEFAULT_OPTION}
                  onValueChange={(value) =>
                    setMaterialId(value === DEFAULT_OPTION ? '' : value)
                  }
                >
                  <SelectTrigger disabled={materials.isLoading}>
                    <SelectValue
                      placeholder={
                        materials.isLoading
                          ? 'Загрузка…'
                          : 'Выберите материал'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DEFAULT_OPTION}>
                      Использовать материал из шаблона
                    </SelectItem>
                    {materialItems.map((material) => (
                      <SelectItem
                        key={material.id}
                        value={String(material.id)}
                      >
                        {materialLabel(material)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => void createJob()}
              disabled={!templateName || createFromTemplate.isPending}
            >
              {createFromTemplate.isPending ? 'Создание…' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deletedOpen} onOpenChange={setDeletedOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Удалённые задания</DialogTitle>
            <DialogDescription>
              Задания, отмеченные как удалённые на backend.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-auto">
            {deletedJobs.isLoading && (
              <div className="text-sm text-muted-foreground">Загрузка…</div>
            )}
            {!deletedJobs.isLoading && deletedItems.length === 0 && (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                Удалённых заданий нет.
              </div>
            )}
            {deletedItems.map((job) => (
              <Link
                key={job.id}
                to={PATHS.tasks.byId(job.id)}
                onClick={() => setDeletedOpen(false)}
                className="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
              >
                <div>
                  <div className="font-medium">{job.jobNumber}</div>
                  <div className="text-xs text-muted-foreground">
                    ID {job.id} · создано {formatDate(job.createdAt)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Статус {job.jobStatus}
                </div>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={schedulesOpen} onOpenChange={setSchedulesOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Автоматическое создание заданий</DialogTitle>
            <DialogDescription>
              Расписания хранятся на backend и создают задания из выбранного
              шаблона.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <div className="grid content-start gap-3 rounded-md border p-4">
              <div className="font-medium">Новое расписание</div>
              <div className="grid gap-2">
                <Label>Шаблон</Label>
                <Select
                  value={scheduleTemplate}
                  onValueChange={(value) => {
                    setScheduleTemplate(value);
                    setScheduleMaterialIds([]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите шаблон" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateItems.map((template) => (
                      <SelectItem key={template.name} value={template.name}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule-interval">Интервал</Label>
                <Input
                  id="schedule-interval"
                  value={scheduleInterval}
                  onChange={(event) => setScheduleInterval(event.target.value)}
                  placeholder="00:30:00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Организация</Label>
                <OrganizationSelect
                  value={scheduleOrganizationId}
                  onValueChange={setScheduleOrganizationId}
                  organizations={organizationItems}
                  currentOrganizationId={currentOrganization?.id}
                  isLoading={organizations.isLoading}
                />
              </div>
              {isProductionTemplate(selectedScheduleTemplate?.jobType) && (
                <div className="grid gap-2">
                  <Label>Материалы</Label>
                  <MaterialMultiSelect
                  value={scheduleMaterialIds}
                    onValueChange={setScheduleMaterialIds}
                    materials={materialItems}
                    isLoading={materials.isLoading}
                  />
                  <div className="text-xs text-muted-foreground">
                    Несколько материалов будут использоваться по очереди.
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="schedule-start">Начало</Label>
                  <Input
                    id="schedule-start"
                    type="datetime-local"
                    value={scheduleStart}
                    onChange={(event) => setScheduleStart(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schedule-max-runs">Макс. запусков</Label>
                  <Input
                    id="schedule-max-runs"
                    type="number"
                    min={1}
                    value={scheduleMaxRuns}
                    onChange={(event) => setScheduleMaxRuns(event.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={() => void createAutoSchedule()}
                disabled={
                  !scheduleTemplate ||
                  !scheduleInterval.trim() ||
                  createSchedule.isPending
                }
              >
                {createSchedule.isPending
                  ? 'Добавление…'
                  : 'Добавить расписание'}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="font-medium">Активные расписания</div>
              {schedules.isLoading && (
                <div className="text-sm text-muted-foreground">Загрузка…</div>
              )}
              {!schedules.isLoading && scheduleItems.length === 0 && (
                <div className="rounded-md border p-4 text-sm text-muted-foreground">
                  Расписаний нет.
                </div>
              )}
              {scheduleItems.map((schedule) => (
                <div key={schedule.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{schedule.templateName}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Интервал {schedule.interval} · следующий запуск{' '}
                        {formatDate(schedule.nextRunAtUtc)}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      disabled={deleteSchedule.isPending}
                      onClick={() =>
                        void removeSchedule(schedule.id, schedule.templateName)
                      }
                      title="Удалить расписание"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>Создано заданий: {schedule.createdJobsCount}</div>
                    <div>
                      Организация:{' '}
                      {schedule.organizationId
                        ? organizationItems.find(
                            (organization) =>
                              organization.id === schedule.organizationId
                          )?.name ?? `ID ${schedule.organizationId}`
                        : 'по умолчанию'}
                    </div>
                    <div className="col-span-2">
                      Материалы:{' '}
                      {schedule.materialIds.length > 0
                        ? schedule.materialIds
                            .map((id) => {
                              const material = materialItems.find(
                                (item) => item.id === id
                              );
                              return material ? materialLabel(material) : `ID ${id}`;
                            })
                            .join(', ')
                        : 'из шаблона'}
                    </div>
                    <div>Активно: {schedule.isActive ? 'да' : 'нет'}</div>
                    <div>Выполняется: {schedule.isRunning ? 'да' : 'нет'}</div>
                  </div>
                  {schedule.lastError && (
                    <div className="mt-3 rounded bg-destructive/10 p-2 text-xs text-destructive">
                      {schedule.lastError}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
