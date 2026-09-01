import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  FileJson,
  FileText,
  Hash,
  Info,
  Link2,
  Package,
  Settings2,
  X,
} from 'lucide-react';
import useEnum from '@shared/api/hooks/enums/useEnum';
import type { EnumsUnits, EnumUnit } from '@shared/api/hooks/enums/types';
import { PATHS } from '@shared/config/pathRoute';
import { Alert, AlertDescription, AlertTitle } from '@shared/components/ui/alert';
import { Badge } from '@shared/components/ui/badge';
import { Progress } from '@shared/components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/components/ui/tabs';
import { cn } from '@shared/lib/utils';
import type {
  AdminJobActionInfo,
  AdminJobDocument,
  AdminJobDto,
  AdminJobPackageMetadata,
  AdminJobRelatedEntity,
  AdminJobStatusDetails,
} from '../admin/types';

type UnknownRecord = Record<string, unknown>;

interface TaskDetailsProps {
  job: AdminJobDto;
  statusDetails: AdminJobStatusDetails;
  actionAvailability: Record<string, AdminJobActionInfo>;
  statusLabel?: string;
  statusColor?: string;
}

const counterLabels: Record<string, string> = {
  reported: 'Передано в отчётах',
  total_received_weight: 'Общий полученный вес',
  total_errors: 'Ошибки',
  total_demand_qty: 'Требуется',
  reserved_qty: 'Зарезервировано',
  sent_to_line: 'Отправлено на линию',
  received_from_line: 'Получено с линии',
  produced_reported: 'Передано в ЦРПТ',
  confirmed: 'Подтверждено',
  read: 'Считано',
  fill: 'Заполнено',
  dropout: 'Выбраковано',
  aggregated: 'Агрегировано',
  packaged: 'Упаковано',
  reserved: 'В резерве',
};

const fieldLabels: Record<string, string> = {
  calculationMethod: 'Расчёт даты производства',
  fixedProductionDate: 'Фиксированная дата производства',
  timeShift: 'Сдвиг времени',
  timeShiftUnit: 'Единица сдвига',
  shiftAmount: 'Сдвиг времени',
  shiftUnit: 'Единица сдвига',
  use: 'Формировать частичные отчёты',
  allowManual: 'Разрешить ручное формирование',
  needPartialReportManual: 'Требуется ручной частичный отчёт',
  packageLevelRule: 'Уровни упаковки',
  startTime: 'Время начала',
  interval: 'Интервал формирования',
  inclusionRule: 'Правило включения',
  productionTimeOffset: 'Сдвиг времени производства',
  productionDateOffset: 'Сдвиг даты производства',
  lastTimeAuto: 'Последний автоматический отчёт',
  lastTimeManual: 'Последний ручной отчёт',
  isActive: 'Активен',
  packageLevel: 'Уровень упаковки',
  emissionMethod: 'Способ эмиссии',
  materialPackageId: 'ID упаковки материала',
  totalDemandQty: 'Требуется кодов',
  reservedQty: 'Зарезервировано кодов',
  capacity: 'Вместимость',
  preprinted: 'Предварительно напечатано',
  reservationPercentage: 'Процент резервирования',
  lineCreationMethod: 'Способ создания на линии',
};

const packageLevelFallback: Record<string, string> = {
  '0': 'Не определён',
  '10': 'Потребительская упаковка',
  '20': 'Групповая упаковка',
  '25': 'Набор',
  '30': 'Короб',
  '40': 'Паллета',
  UNIT: 'Потребительская упаковка',
  GROUP: 'Групповая упаковка',
  SET: 'Набор',
  BOX: 'Короб',
  PALLET: 'Паллета',
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function hasValue(value: unknown) {
  return value !== null && value !== undefined && value !== '';
}

function formatNumber(value: number) {
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 2 });
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() <= 1) return '—';

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function humanizeKey(key: string) {
  if (counterLabels[key]) return counterLabels[key];
  if (fieldLabels[key]) return fieldLabels[key];

  const value = key
    .replace(/([a-zа-я])([A-ZА-Я])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

  return value ? value.charAt(0).toUpperCase() + value.slice(1) : key;
}

function enumLabel(
  values: EnumsUnits | undefined,
  value: unknown,
  fallback?: Record<string, string>
) {
  if (!hasValue(value)) return '—';
  const key = String(value);
  return values?.[key]?.description || values?.[key]?.name || fallback?.[key] || key;
}

function booleanValue(value: unknown) {
  if (typeof value !== 'boolean') return '—';

  return (
    <Badge variant={value ? 'success' : 'secondary'} className="gap-1">
      {value ? <Check className="size-3" /> : <X className="size-3" />}
      {value ? 'Да' : 'Нет'}
    </Badge>
  );
}

function displayValue(value: unknown): ReactNode {
  if (!hasValue(value)) return '—';
  if (typeof value === 'boolean') return booleanValue(value);
  if (typeof value === 'number') return formatNumber(value);
  if (typeof value === 'string') return value;
  return (
    <code className="break-all text-xs text-muted-foreground">
      {JSON.stringify(value)}
    </code>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
  className,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0 rounded-xl border border-border/60 bg-muted/15 p-3', className)}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          'mt-1.5 min-h-5 break-words text-sm font-medium',
          mono && 'font-mono text-xs'
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5', className)}>
      <div className="mb-4 flex items-start gap-3">
        {icon && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-2 text-muted-foreground">
            {icon}
          </div>
        )}
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 text-center">
      <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">{icon}</div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function RelatedEntityCard({
  title,
  entity,
  href,
}: {
  title: string;
  entity?: AdminJobRelatedEntity | null;
  href?: string;
}) {
  const number = entity?.materialNumber || entity?.packageNumber || entity?.lineNumber;
  const product = isRecord(entity?.product) ? entity.product : undefined;

  return (
    <div className="rounded-xl border border-border/60 bg-muted/15 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{title}</span>
        {entity?.id !== undefined && <Badge variant="outline">ID {entity.id}</Badge>}
      </div>
      {entity ? (
        <div className="mt-3 space-y-1">
          {href ? (
            <Link className="inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline" to={href}>
              {entity.name || number || `ID ${entity.id}`}
              <Link2 className="size-3.5" />
            </Link>
          ) : (
            <div className="font-semibold">{entity.name || number || `ID ${entity.id}`}</div>
          )}
          {number && entity.name && (
            <div className="text-sm text-muted-foreground">{number}</div>
          )}
          {product && hasValue(product.name) && (
            <div className="text-sm text-muted-foreground">Продукт: {String(product.name)}</div>
          )}
          {entity.externalUuid && (
            <div className="break-all font-mono text-xs text-muted-foreground">
              {entity.externalUuid}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 text-sm text-muted-foreground">Не указано</div>
      )}
    </div>
  );
}

function DynamicFields({
  data,
  exclude = [],
}: {
  data: UnknownRecord;
  exclude?: string[];
}) {
  const items = Object.entries(data).filter(([key]) => !exclude.includes(key));
  if (items.length === 0) return null;

  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(([key, value]) => (
        <DetailItem key={key} label={humanizeKey(key)} value={displayValue(value)} />
      ))}
    </div>
  );
}

function OverviewTab({
  job,
  statusDetails,
  statusLabel,
  statusColor,
  jobTypes,
}: TaskDetailsProps & { jobTypes?: EnumsUnits }) {
  const statusText = statusLabel || statusDetails.description || String(job.jobStatus);
  const statusStyle = statusColor
    ? {
        backgroundColor: `#${statusColor.replace('#', '')}24`,
        color: `#${statusColor.replace('#', '')}`,
      }
    : undefined;

  return (
    <div className="space-y-4">
      {job.errorMessage && (
        <Alert variant="destructive" className="bg-destructive/5">
          <CircleAlert className="size-4" />
          <AlertTitle>Ошибка обработки задания</AlertTitle>
          <AlertDescription className="break-words">{job.errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Тип задания" value={enumLabel(jobTypes, job.jobType)} />
        <DetailItem label="Плановое количество" value={formatNumber(job.plannedQuantity)} />
        <DetailItem
          label="Текущий статус"
          value={<Badge style={statusStyle}>{statusText}</Badge>}
        />
        <DetailItem label="Повторная попытка" value={formatDateTime(job.retryAt)} />
      </div>

      {statusDetails.description && statusDetails.description !== statusLabel && (
        <Alert>
          <Info className="size-4" />
          <AlertTitle>Состояние задания</AlertTitle>
          <AlertDescription>{statusDetails.description}</AlertDescription>
        </Alert>
      )}

      <Section
        title="Сроки выполнения"
        description="Плановые и фактические даты задания"
        icon={<CalendarDays className="size-5" />}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem label="Плановое начало" value={formatDateTime(job.plannedStartTime)} />
          <DetailItem label="Плановое завершение" value={formatDateTime(job.plannedEndTime)} />
          <DetailItem label="Фактическое начало" value={formatDateTime(job.actualStartTime)} />
          <DetailItem label="Фактическое завершение" value={formatDateTime(job.actualEndTime)} />
        </div>
      </Section>

      <Section
        title="Связанные объекты"
        description="Сущности, используемые при выполнении задания"
        icon={<Link2 className="size-5" />}
      >
        <div className="grid gap-3 lg:grid-cols-3">
          <RelatedEntityCard
            title="Материал"
            entity={job.material}
            href={job.material?.id !== undefined ? PATHS.materials.byId(job.material.id) : undefined}
          />
          <RelatedEntityCard
            title="Упаковка"
            entity={job.package}
            href={job.package?.id !== undefined ? PATHS.packages.byId(job.package.id) : undefined}
          />
          <RelatedEntityCard
            title="Линия"
            entity={job.line}
            href={job.line?.id !== undefined ? PATHS.lines.byId(job.line.id) : undefined}
          />
        </div>
      </Section>

      <Section
        title="Служебная информация"
        description="Идентификаторы и даты изменения записи"
        icon={<Hash className="size-5" />}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="ID задания" value={job.id} mono />
          <DetailItem label="Код задания" value={job.jobCode || '—'} mono />
          <DetailItem label="Внешний UUID" value={job.externalUuid || '—'} mono />
          <DetailItem label="Номер партии" value={job.consignmentNumber || '—'} />
          <DetailItem label="Создано" value={formatDateTime(job.createdAt)} />
          <DetailItem label="Обновлено" value={formatDateTime(job.updatedAt)} />
        </div>
      </Section>
    </div>
  );
}

function SettingsTab({
  job,
  productionDateTypes,
  timeUnits,
  inclusionRules,
  packageLevelRules,
}: {
  job: AdminJobDto;
  productionDateTypes?: EnumsUnits;
  timeUnits?: EnumsUnits;
  inclusionRules?: EnumsUnits;
  packageLevelRules?: EnumsUnits;
}) {
  const production = asRecord(job.productionTimeSettings);
  const partial = asRecord(job.partialReportSettings);
  const productionKeys = [
    'calculationMethod',
    'fixedProductionDate',
    'timeShift',
    'timeShiftUnit',
    'shiftAmount',
    'shiftUnit',
  ];
  const shiftAmount = production.shiftAmount ?? production.timeShift;
  const shiftUnit = production.shiftUnit ?? production.timeShiftUnit;
  const partialKeys = [
    'use',
    'allowManual',
    'needPartialReportManual',
    'packageLevelRule',
    'startTime',
    'interval',
    'inclusionRule',
    'productionTimeOffset',
    'productionDateOffset',
    'lastTimeAuto',
    'lastTimeManual',
  ];

  return (
    <div className="space-y-4">
      <Section
        title="Автоматизация"
        description="Флаги автоматического выполнения этапов задания"
        icon={<Settings2 className="size-5" />}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Автоматический выпуск" value={booleanValue(job.autoRelease)} />
          <DetailItem
            label="Частичное освобождение резерва"
            value={booleanValue(job.partialReserveRelease)}
          />
          <DetailItem label="Автоматическая отправка на линию" value={booleanValue(job.autoSendToLine)} />
        </div>
      </Section>

      <Section
        title="Дата производства"
        description="Правила вычисления производственной даты для кодов"
        icon={<Clock3 className="size-5" />}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem
            label="Расчёт даты производства"
            value={enumLabel(productionDateTypes, production.calculationMethod)}
          />
          <DetailItem
            label="Фиксированная дата"
            value={formatDateTime(
              typeof production.fixedProductionDate === 'string'
                ? production.fixedProductionDate
                : null
            )}
          />
          <DetailItem label="Величина сдвига" value={displayValue(shiftAmount)} />
          <DetailItem
            label="Единица сдвига"
            value={enumLabel(timeUnits, shiftUnit)}
          />
        </div>
        <DynamicFields data={production} exclude={productionKeys} />
      </Section>

      <Section
        title="Частичные отчёты"
        description="Условия и расписание промежуточной отчётности"
        icon={<FileText className="size-5" />}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DetailItem label="Формировать частичные отчёты" value={booleanValue(partial.use)} />
          <DetailItem label="Ручное формирование" value={booleanValue(partial.allowManual)} />
          <DetailItem
            label="Требуется ручной отчёт"
            value={booleanValue(partial.needPartialReportManual)}
          />
          <DetailItem
            label="Уровни упаковки"
            value={enumLabel(packageLevelRules, partial.packageLevelRule)}
          />
          <DetailItem label="Время начала" value={displayValue(partial.startTime)} />
          <DetailItem label="Интервал" value={displayValue(partial.interval)} />
          <DetailItem
            label="Правило включения"
            value={enumLabel(inclusionRules, partial.inclusionRule)}
          />
          <DetailItem label="Сдвиг времени производства" value={displayValue(partial.productionTimeOffset)} />
          <DetailItem label="Сдвиг даты производства" value={displayValue(partial.productionDateOffset)} />
          <DetailItem
            label="Последний автоматический отчёт"
            value={
              typeof partial.lastTimeAuto === 'string'
                ? formatDateTime(partial.lastTimeAuto)
                : '—'
            }
          />
          <DetailItem
            label="Последний ручной отчёт"
            value={
              typeof partial.lastTimeManual === 'string'
                ? formatDateTime(partial.lastTimeManual)
                : '—'
            }
          />
        </div>
        <DynamicFields data={partial} exclude={partialKeys} />
      </Section>
    </div>
  );
}

function CounterGrid({ values }: { values: UnknownRecord }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Object.entries(values).map(([key, value]) => (
        <DetailItem key={key} label={humanizeKey(key)} value={displayValue(value)} />
      ))}
    </div>
  );
}

function PackageMetadataCard({
  levelKey,
  metadata,
  packageLevels,
  emissionMethods,
}: {
  levelKey: string;
  metadata: AdminJobPackageMetadata;
  packageLevels?: EnumsUnits;
  emissionMethods?: EnumsUnits;
}) {
  const level = metadata.packageLevel ?? levelKey;
  const total = Number(metadata.totalDemandQty ?? 0);
  const reserved = Number(metadata.reservedQty ?? 0);
  const percentage = total > 0 ? Math.min(100, Math.max(0, (reserved / total) * 100)) : 0;
  const components = Array.isArray(metadata.components) ? metadata.components : [];
  const knownKeys = [
    'isActive',
    'packageLevel',
    'emissionMethod',
    'materialPackageId',
    'totalDemandQty',
    'reservedQty',
    'capacity',
    'preprinted',
    'reservationPercentage',
    'components',
  ];

  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-semibold">{enumLabel(packageLevels, level, packageLevelFallback)}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">Уровень {String(level)}</div>
        </div>
        {booleanValue(metadata.isActive)}
      </div>

      <div className="mt-4 rounded-xl border border-border/60 bg-muted/15 p-3">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Резервирование</span>
          <span className="font-semibold">
            {formatNumber(reserved)} / {formatNumber(total)}
          </span>
        </div>
        <Progress value={percentage} interpolated="yes" />
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {formatNumber(percentage)}%
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <DetailItem
          label="Способ эмиссии"
          value={enumLabel(emissionMethods, metadata.emissionMethod)}
        />
        <DetailItem label="Вместимость" value={displayValue(metadata.capacity)} />
        <DetailItem label="ID упаковки материала" value={displayValue(metadata.materialPackageId)} mono />
        <DetailItem label="Предварительно напечатано" value={booleanValue(metadata.preprinted)} />
      </div>

      <DynamicFields data={metadata} exclude={knownKeys} />

      {components.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium">Компоненты набора</div>
          <div className="space-y-2">
            {components.map((component, index) => {
              const item = asRecord(component);
              return (
                <div
                  key={`${String(item.productId ?? 'component')}-${index}`}
                  className="grid gap-2 rounded-xl border border-border/60 bg-muted/15 p-3 sm:grid-cols-2 xl:grid-cols-5"
                >
                  <DetailItem label="ID продукта" value={displayValue(item.productId)} mono />
                  <DetailItem label="GTIN" value={displayValue(item.gtin ?? item.GTIN)} mono />
                  <DetailItem label="В одном наборе" value={displayValue(item.quantityPerSet)} />
                  <DetailItem label="Требуется" value={displayValue(item.totalDemandQty)} />
                  <DetailItem label="Зарезервировано" value={displayValue(item.reservedQty)} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PackagingTab({
  job,
  packageLevels,
  emissionMethods,
}: {
  job: AdminJobDto;
  packageLevels?: EnumsUnits;
  emissionMethods?: EnumsUnits;
}) {
  const globalCounters = asRecord(job.counters?.global);
  const levelCounters = Object.entries(job.counters?.byLevel ?? {});
  const metadata = Object.entries(job.packageMetadata ?? {});
  const hasData =
    Object.keys(globalCounters).length > 0 || levelCounters.length > 0 || metadata.length > 0;

  if (!hasData) {
    return (
      <EmptyState
        icon={<Package className="size-6" />}
        title="Данных об упаковках пока нет"
        description="Backend не вернул метаданные упаковок или счётчики для этого задания."
      />
    );
  }

  return (
    <div className="space-y-4">
      {Object.keys(globalCounters).length > 0 && (
        <Section
          title="Общие счётчики"
          description="Показатели задания без привязки к уровню упаковки"
          icon={<Hash className="size-5" />}
        >
          <CounterGrid values={globalCounters} />
        </Section>
      )}

      {levelCounters.length > 0 && (
        <Section
          title="Счётчики по уровням"
          description="Движение и обработка кодов для каждого уровня упаковки"
          icon={<Package className="size-5" />}
        >
          <div className="space-y-3">
            {levelCounters.map(([level, values]) => {
              const counters = asRecord(values);
              const total = Number(counters.total_demand_qty ?? 0);
              const reserved = Number(counters.reserved_qty ?? 0);
              const percentage = total > 0 ? Math.min(100, Math.max(0, (reserved / total) * 100)) : 0;

              return (
                <div key={level} className="rounded-2xl border border-border/70 bg-muted/10 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">
                        {enumLabel(packageLevels, level, packageLevelFallback)}
                      </div>
                      <div className="text-xs text-muted-foreground">Уровень {level}</div>
                    </div>
                    {total > 0 && (
                      <div className="w-full max-w-56">
                        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                          <span>Резерв</span>
                          <span>{formatNumber(percentage)}%</span>
                        </div>
                        <Progress value={percentage} interpolated="yes" />
                      </div>
                    )}
                  </div>
                  <CounterGrid values={counters} />
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {metadata.length > 0 && (
        <div>
          <div className="mb-3">
            <h2 className="font-semibold">Метаданные упаковок</h2>
            <p className="text-sm text-muted-foreground">
              Потребность, резервирование и параметры упаковочных уровней
            </p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {metadata.map(([level, value]) => (
              <PackageMetadataCard
                key={level}
                levelKey={level}
                metadata={value}
                packageLevels={packageLevels}
                emissionMethods={emissionMethods}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function documentResult(document: AdminJobDocument) {
  if (!document.isCompleted) return <Badge variant="secondary">В обработке</Badge>;
  if (document.isSuccess) return <Badge variant="success">Успешно</Badge>;
  return <Badge variant="destructive">Ошибка</Badge>;
}

function DocumentsTab({ documents = [] }: { documents?: AdminJobDocument[] | null }) {
  const items = documents ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="size-6" />}
        title="Связанных документов нет"
        description="Для этого задания backend ещё не сформировал ни одного документа."
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {items.map((document) => (
        <article key={document.id} className="rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                className="inline-flex max-w-full items-center gap-1 break-all font-semibold underline-offset-4 hover:underline"
                to={PATHS.reports.byId(document.documentType, document.id)}
              >
                {document.documentNumber}
                <Link2 className="size-3.5 shrink-0" />
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {document.documentDescription || document.documentType}
              </p>
            </div>
            {documentResult(document)}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline">{document.statusDescription || document.status}</Badge>
            <Badge variant="secondary">{document.documentType}</Badge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailItem label="Создан" value={formatDateTime(document.createdAt)} />
            <DetailItem label="Изменён" value={formatDateTime(document.modifiedAt)} />
            <DetailItem label="Повторная попытка" value={formatDateTime(document.retryAt)} />
            <DetailItem label="ID документа" value={document.id} mono />
          </div>

          {document.errorMessage && (
            <Alert variant="destructive" className="mt-4 bg-destructive/5">
              <CircleAlert className="size-4" />
              <AlertTitle>Ошибка документа</AlertTitle>
              <AlertDescription className="break-words">{document.errorMessage}</AlertDescription>
            </Alert>
          )}
        </article>
      ))}
    </div>
  );
}

function TaskDetails({
  job,
  statusDetails,
  actionAvailability,
  statusLabel,
  statusColor,
}: TaskDetailsProps) {
  const { data: { data: jobTypes } = {} } = useEnum<EnumUnit>({ name: 'job-type' });
  const { data: { data: productionDateTypes } = {} } = useEnum<EnumUnit>({
    name: 'production-date-type',
  });
  const { data: { data: timeUnits } = {} } = useEnum<EnumUnit>({ name: 'time-units' });
  const { data: { data: inclusionRules } = {} } = useEnum<EnumUnit>({
    name: 'partial-report-inclusion-rule',
  });
  const { data: { data: packageLevelRules } = {} } = useEnum<EnumUnit>({
    name: 'package-level-rule',
  });
  const { data: { data: packageLevels } = {} } = useEnum<EnumUnit>({
    name: 'package-levels',
  });
  const { data: { data: emissionMethods } = {} } = useEnum<EnumUnit>({
    name: 'emission-method',
  });
  const documentCount = job.documents?.length ?? 0;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
        <TabsTrigger value="overview" className="flex-none px-3">
          <Info />
          Обзор
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex-none px-3">
          <Settings2 />
          Настройки
        </TabsTrigger>
        <TabsTrigger value="packaging" className="flex-none px-3">
          <Package />
          Упаковка и счётчики
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex-none px-3">
          <FileText />
          Документы
          <Badge variant="outline" className="ml-1 px-1.5 py-0 text-[10px]">
            {documentCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="raw" className="flex-none px-3">
          <FileJson />
          Исходные данные
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-2">
        <OverviewTab
          job={job}
          statusDetails={statusDetails}
          actionAvailability={actionAvailability}
          statusLabel={statusLabel}
          statusColor={statusColor}
          jobTypes={jobTypes}
        />
      </TabsContent>
      <TabsContent value="settings" className="mt-2">
        <SettingsTab
          job={job}
          productionDateTypes={productionDateTypes}
          timeUnits={timeUnits}
          inclusionRules={inclusionRules}
          packageLevelRules={packageLevelRules}
        />
      </TabsContent>
      <TabsContent value="packaging" className="mt-2">
        <PackagingTab
          job={job}
          packageLevels={packageLevels}
          emissionMethods={emissionMethods}
        />
      </TabsContent>
      <TabsContent value="documents" className="mt-2">
        <DocumentsTab documents={job.documents} />
      </TabsContent>
      <TabsContent value="raw" className="mt-2">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/15">
          <div className="border-b border-border/70 px-4 py-3">
            <div className="font-medium">Полный ответ API</div>
            <div className="text-sm text-muted-foreground">
              Задание, доступность действий и детальное состояние статуса
            </div>
          </div>
          <pre className="max-h-[70vh] overflow-auto p-4 text-xs leading-relaxed">
            {JSON.stringify(
              {
                job,
                actions: actionAvailability,
                jobStatusDetails: statusDetails,
              },
              null,
              2
            )}
          </pre>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default TaskDetails;
