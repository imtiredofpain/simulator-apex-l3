import type { ReactNode } from "react";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Progress } from "@shared/components/ui/progress";
import { Separator } from "@shared/components/ui/separator";
import { Skeleton } from "@shared/components/ui/skeleton";
import {
  Activity,
  Boxes,
  CircleAlert,
  FileText,
  Gauge,
  PackageSearch,
  Radio,
  RefreshCw,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useQueryDashboard } from "../hooks/useQueryDashboard";
import type {
  DashboardBufferServiceDto,
  DashboardDocumentServiceDto,
  DashboardDocumentsDto,
  DashboardDto,
  DashboardJobServiceDto,
  DashboardJobsDto,
  DashboardMetricWindowDto,
  DashboardProcessingTimeDto,
  DashboardServiceHealthDto,
} from "../types";

const integerFormatter = new Intl.NumberFormat("ru-RU");
const decimalFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 1,
});

const documentTypeLabels: Record<string, string> = {
  GISMT_INTRODUCTION: "Ввод в оборот",
  GISMT_CIS_INFORMATION_CHANGE: "Изменение сведений КИЗ",
  SUZ_APPLICATION_REPORT: "Отчет СУЗ",
  SUZ_ORDER: "Заказ СУЗ",
  CRPT_PRODUCTION_REPORT: "Отчет о производстве",
  GISMT_AGGREGATION: "Агрегация ГИС МТ",
};

function formatInteger(value: number) {
  return integerFormatter.format(value);
}

function formatDecimal(value: number) {
  return decimalFormatter.format(value);
}

function formatPercentage(value: number, total: number) {
  if (total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(1));
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU");
}

function formatDuration(value: number | null) {
  if (value === null) return "—";

  const totalSeconds = Math.max(0, Math.round(value));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days} д ${hours} ч`;
  if (hours > 0) return `${hours} ч ${minutes} мин`;
  if (minutes > 0) return `${minutes} мин ${seconds} сек`;
  return `${seconds} сек`;
}

function formatLabel(value: string) {
  return documentTypeLabels[value] ?? value.replaceAll("_", " ");
}

function getHealthVariant(health: DashboardServiceHealthDto) {
  if (!health.isRunning || health.isStalled) return "destructive" as const;
  return "success" as const;
}

function getHealthLabel(health: DashboardServiceHealthDto) {
  if (!health.isRunning) return "Остановлен";
  if (health.isStalled) return "Завис";
  return "В работе";
}

function mapEntries(values: Record<string, number>) {
  return Object.entries(values).sort((a, b) => b[1] - a[1]);
}

function renderUnknown(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Не удалось отобразить значение";
  }
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5 py-1">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-80 w-full" />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Activity;
  tone: "violet" | "blue" | "cyan" | "green";
}) {
  const tones = {
    violet:
      "from-violet-500/18 to-violet-500/0 text-violet-500 dark:text-violet-300",
    blue: "from-blue-500/18 to-blue-500/0 text-blue-600 dark:text-blue-300",
    cyan: "from-cyan-500/18 to-cyan-500/0 text-cyan-600 dark:text-cyan-300",
    green:
      "from-emerald-500/18 to-emerald-500/0 text-emerald-600 dark:text-emerald-300",
  } as const;

  return (
    <Card className="metric-glow group relative overflow-hidden border-border/70 bg-card/78 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
      <div
        className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${tones[tone]}`}
      />
      <CardHeader className="relative flex flex-row items-start justify-between space-y-0 p-5 pb-4">
        <div className="space-y-2">
          <CardDescription className="technical-label text-foreground/45">
            {title}
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tracking-[-0.04em] xl:text-4xl">
            {value}
          </CardTitle>
        </div>
        <div
          className={`flex size-11 items-center justify-center rounded-xl border border-current/15 bg-background/55 ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="relative border-t border-border/50 px-5 py-3.5">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function DistributionList({
  items,
  total,
  emptyText,
}: {
  items: Array<[string, number]>;
  total: number;
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map(([label, value]) => {
        const percentage = formatPercentage(value, total);

        return (
          <div key={label} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-muted-foreground">
                {formatLabel(label)}
              </span>
              <span className="shrink-0 font-semibold tabular-nums">
                {formatInteger(value)} ({formatDecimal(percentage)}%)
              </span>
            </div>
            <Progress value={percentage} />
          </div>
        );
      })}
    </div>
  );
}

function MetricWindow({
  title,
  metric,
}: {
  title: string;
  metric: DashboardMetricWindowDto;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
      <p className="technical-label text-foreground/55">{title}</p>
      <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">С запуска</p>
          <p className="font-semibold">
            {formatInteger(metric.totalSinceStart)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">5 минут</p>
          <p className="font-semibold">{formatInteger(metric.last5Minutes)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">В минуту</p>
          <p className="font-semibold">{formatDecimal(metric.perMinute)}</p>
        </div>
      </div>
    </div>
  );
}

function ProcessingTimeCard({
  processingTime,
}: {
  processingTime: DashboardProcessingTimeDto;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
      <p className="technical-label text-foreground/55">Время обработки</p>
      <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Среднее</p>
          <p className="font-semibold">
            {formatDecimal(processingTime.avgMs)} мс
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">P95</p>
          <p className="font-semibold">
            {formatDecimal(processingTime.p95Ms)} мс
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Минимум</p>
          <p className="font-semibold">
            {formatDecimal(processingTime.minMs)} мс
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Максимум</p>
          <p className="font-semibold">
            {formatDecimal(processingTime.maxMs)} мс
          </p>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Выборка: {formatInteger(processingTime.sampleCount)}
      </p>
    </div>
  );
}

function ServiceCard({
  health,
  operationalIssue = false,
  operationalIssueLabel,
  children,
}: {
  health: DashboardServiceHealthDto;
  operationalIssue?: boolean;
  operationalIssueLabel?: string;
  children: ReactNode;
}) {
  const hasIssue =
    !health.isRunning || health.isStalled || operationalIssue;

  return (
    <Card
      className={`overflow-hidden border-border/70 bg-card/75 ${
        hasIssue ? "border-t-destructive/70" : "border-t-emerald-500/60"
      } border-t-2`}
    >
      <CardHeader className="gap-4 border-b border-border/50 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Radio className="size-4 text-primary" />
              <span className="technical-label text-muted-foreground">
                Service node
              </span>
            </div>
            <CardTitle className="text-lg">{health.serviceName}</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Heartbeat: {formatDateTime(health.lastHeartbeat)}
            </CardDescription>
          </div>
          <Badge
            variant={hasIssue ? "destructive" : getHealthVariant(health)}
          >
            {operationalIssue && health.isRunning && !health.isStalled
              ? operationalIssueLabel
              : getHealthLabel(health)}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/25 p-3 text-sm">
          <div className="border-r border-border/60">
            <p className="technical-label text-[9px] text-muted-foreground">
              Uptime
            </p>
            <p className="font-semibold">{health.uptime}</p>
          </div>
          <div>
            <p className="technical-label text-[9px] text-muted-foreground">
              Heartbeat lag
            </p>
            <p className="font-semibold">
              {formatDecimal(health.secondsSinceLastHeartbeat)} сек
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-5">{children}</CardContent>
    </Card>
  );
}

function ServiceProgressCard({
  lastProgressAt,
  secondsSinceLastProgress,
  isProgressStalled,
}: {
  lastProgressAt: string | null;
  secondsSinceLastProgress: number | null;
  isProgressStalled: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 ${
        isProgressStalled
          ? "border-destructive/35 bg-destructive/5"
          : "border-emerald-500/20 bg-emerald-500/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="technical-label text-foreground/55">
            Последний прогресс
          </p>
          <p className="mt-1 text-sm font-semibold">
            {lastProgressAt
              ? formatDateTime(lastProgressAt)
              : "Ещё не зафиксирован"}
          </p>
        </div>
        <Badge variant={isProgressStalled ? "destructive" : "success"}>
          {isProgressStalled ? "Нет прогресса" : "Штатно"}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Без изменения состояния: {formatDuration(secondsSinceLastProgress)}
      </p>
    </div>
  );
}

function JobServiceCard({ service }: { service: DashboardJobServiceDto }) {
  const activeJobs = Object.entries(service.activeJobs);

  return (
    <ServiceCard
      health={service.health}
      operationalIssue={service.isProgressStalled}
      operationalIssueLabel="Нет прогресса"
    >
      <ServiceProgressCard
        lastProgressAt={service.lastProgressAt}
        secondsSinceLastProgress={service.secondsSinceLastProgress}
        isProgressStalled={service.isProgressStalled}
      />
      <MetricWindow title="Обработано" metric={service.processed} />
      <MetricWindow title="Ошибки" metric={service.failed} />
      <MetricWindow title="Таймауты" metric={service.timeout} />
      <MetricWindow title="С продвижением" metric={service.progressed} />
      <MetricWindow title="Без продвижения" metric={service.withoutProgress} />
      <ProcessingTimeCard processingTime={service.processingTime} />
      <div className="rounded-lg border border-border/60 p-3">
        <p className="text-sm font-medium">
          Задания в обработке: {formatInteger(service.activeJobsCount)}
        </p>
        {activeJobs.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Сейчас активных заданий нет.
          </p>
        ) : (
          <div className="mt-2 flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
            {activeJobs.map(([jobId, startedAt]) => (
              <div key={jobId} className="rounded-md bg-muted/40 p-2 text-sm">
                <p className="font-medium">Задание #{jobId}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Обрабатывается с {formatDateTime(startedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ServiceCard>
  );
}

function DocumentServiceCard({
  service,
}: {
  service: DashboardDocumentServiceDto;
}) {
  const activeDocuments = Object.entries(service.activeDocuments);

  return (
    <ServiceCard
      health={service.health}
      operationalIssue={service.isProgressStalled}
      operationalIssueLabel="Нет прогресса"
    >
      <ServiceProgressCard
        lastProgressAt={service.lastProgressAt}
        secondsSinceLastProgress={service.secondsSinceLastProgress}
        isProgressStalled={service.isProgressStalled}
      />
      <MetricWindow title="Обработано" metric={service.processed} />
      <MetricWindow title="Ошибки" metric={service.failed} />
      <MetricWindow title="С продвижением" metric={service.progressed} />
      <MetricWindow title="Без продвижения" metric={service.withoutProgress} />
      <ProcessingTimeCard processingTime={service.processingTime} />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border/60 p-3">
          <p className="text-sm text-muted-foreground">Активные документы</p>
          <p className="text-xl font-semibold">
            {formatInteger(service.activeDocumentsCount)}
          </p>
        </div>
        <div
          className={`rounded-lg border p-3 ${
            service.unknownDocumentTypeCount > 0
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-border/60"
          }`}
        >
          <p className="text-sm text-muted-foreground">Неизвестный тип</p>
          <p className="text-xl font-semibold">
            {formatInteger(service.unknownDocumentTypeCount)}
          </p>
        </div>
      </div>
      <div className="rounded-lg border border-border/60 p-3">
        <p className="text-sm font-medium">Документы в обработке</p>
        {activeDocuments.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Сейчас активных документов нет.
          </p>
        ) : (
          <div className="mt-2 flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
            {activeDocuments.map(([id, startedAt]) => (
              <div key={id} className="rounded-md bg-muted/40 p-2 text-xs">
                <p className="break-all font-medium">{id}</p>
                <p className="mt-1 text-muted-foreground">
                  С {formatDateTime(startedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ServiceCard>
  );
}

function BufferServiceCard({
  service,
}: {
  service: DashboardBufferServiceDto;
}) {
  return (
    <ServiceCard health={service.health}>
      <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
        <div>
          <p className="text-sm font-medium">Буферизация</p>
          <p className="text-sm text-muted-foreground">
            Управляет пополнением и созданием заказов
          </p>
        </div>
        <Badge variant={service.enabled ? "success" : "secondary"}>
          {service.enabled ? "Включена" : "Выключена"}
        </Badge>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border/60 p-3">
          <p className="text-sm text-muted-foreground">Пакетов проверено</p>
          <p className="text-xl font-semibold">
            {formatInteger(service.totalPackagesChecked)}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 p-3">
          <p className="text-sm text-muted-foreground">Заказов создано</p>
          <p className="text-xl font-semibold">
            {formatInteger(service.totalOrdersCreated)}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 p-3">
          <p className="text-sm text-muted-foreground">Нужно пополнение</p>
          <p className="text-xl font-semibold">
            {formatInteger(service.totalPackagesNeedingReplenishment)}
          </p>
        </div>
      </div>
      <MetricWindow title="Создание заказов" metric={service.ordersCreated} />
    </ServiceCard>
  );
}

function JobQueueCard({ jobs }: { jobs: DashboardJobsDto }) {
  const queueGroups = [...jobs.queueGroups].sort(
    (left, right) => right.count - left.count,
  );
  const queuedTotal = queueGroups.reduce(
    (total, group) => total + group.count,
    0,
  );

  return (
    <Card className="overflow-hidden border-border/70 bg-card/75">
      <CardHeader className="border-b border-border/50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-blue-500">
              <Workflow className="size-4" />
              <span className="technical-label">Job queue</span>
            </div>
            <CardTitle className="text-lg">Состояние очереди заданий</CardTitle>
            <CardDescription className="mt-1">
              Задания, доступные обработчику сейчас, и отложенные повторы.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit bg-background/45">
            Групп в очереди: {formatInteger(queueGroups.length)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 p-4">
            <p className="text-sm text-muted-foreground">Готовы к обработке</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatInteger(jobs.eligibleNow)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Могут быть взяты JobService сейчас
            </p>
          </div>
          <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4">
            <p className="text-sm text-muted-foreground">Запланированы</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatInteger(jobs.scheduled)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ожидают наступления времени повтора
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/15 p-4">
            <p className="text-sm text-muted-foreground">Всего в группах</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatInteger(queuedTotal)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Активные статусы по организациям
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="technical-label text-foreground/55">
              Дольше всех ожидает обработки
            </p>
            <p className="mt-1 text-sm font-semibold">
              {jobs.oldestEligibleAt
                ? formatDateTime(jobs.oldestEligibleAt)
                : "Нет заданий, готовых к обработке"}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-muted-foreground">
              Ожидает обработки
            </p>
            <p className="text-lg font-semibold">
              {formatDuration(jobs.oldestEligibleAgeSeconds)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Группы активных заданий</p>
            <span className="text-xs text-muted-foreground">
              Организация · статус
            </span>
          </div>
          {queueGroups.length === 0 ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-600 dark:text-emerald-300">
              Очередь активных заданий пуста.
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-border/60">
              <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] gap-4 border-b border-border/60 bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground sm:grid">
                <span>Организация</span>
                <span>Статус</span>
                <span>Количество</span>
              </div>
              {queueGroups.map((group) => (
                <div
                  key={`${group.organizationId}-${group.status}`}
                  className="grid gap-2 border-b border-border/50 px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-center sm:gap-4"
                >
                  <span className="font-medium">
                    <span className="mr-1 text-muted-foreground sm:hidden">
                      Организация:
                    </span>
                    {group.organizationId}
                  </span>
                  <span className="break-words text-muted-foreground">
                    {formatLabel(group.status)}
                  </span>
                  <Badge variant="secondary" className="w-fit tabular-nums">
                    {formatInteger(group.count)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentQueueCard({
  documents,
}: {
  documents: DashboardDocumentsDto;
}) {
  const queueGroups = [...documents.queueGroups].sort(
    (left, right) => right.count - left.count,
  );

  return (
    <Card className="overflow-hidden border-border/70 bg-card/75">
      <CardHeader className="border-b border-border/50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-violet-500">
              <Workflow className="size-4" />
              <span className="technical-label">Document queue</span>
            </div>
            <CardTitle className="text-lg">Состояние очереди документов</CardTitle>
            <CardDescription className="mt-1">
              Готовность к обработке, отложенные повторы и ожидающие документы.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit bg-background/45">
            Групп в очереди: {formatInteger(queueGroups.length)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-violet-500/25 bg-violet-500/5 p-4">
            <p className="text-sm text-muted-foreground">Готовы сейчас</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatInteger(documents.eligibleNow)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Могут быть взяты сервисом
            </p>
          </div>
          <div className="rounded-xl border border-blue-500/25 bg-blue-500/5 p-4">
            <p className="text-sm text-muted-foreground">Запланированы</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatInteger(documents.scheduled)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ожидают времени повтора
            </p>
          </div>
          <div
            className={`rounded-xl border p-4 ${
              documents.blocked > 0
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-border/60 bg-muted/15"
            }`}
          >
            <p className="text-sm text-muted-foreground">Заблокированы</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatInteger(documents.blocked)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ожидают внешнего действия
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="technical-label text-foreground/55">
              Дольше всех ожидает обработки
            </p>
            <p className="mt-1 text-sm font-semibold">
              {documents.oldestEligibleAt
                ? formatDateTime(documents.oldestEligibleAt)
                : "Нет документов, ожидающих обработки"}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-muted-foreground">
              Время ожидания обработки
            </p>
            <p className="text-lg font-semibold">
              {formatDuration(documents.oldestEligibleAgeSeconds)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Незавершённые группы</p>
            <span className="text-xs text-muted-foreground">
              Организация · тип · статус
            </span>
          </div>
          {queueGroups.length === 0 ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-600 dark:text-emerald-300">
              Очередь незавершённых документов пуста.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto rounded-xl border border-border/60">
              <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1.2fr)_auto] gap-4 border-b border-border/60 bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground sm:grid">
                <span>Организация</span>
                <span>Тип документа</span>
                <span>Статус</span>
                <span>Количество</span>
              </div>
              {queueGroups.map((group) => (
                <div
                  key={`${group.organizationId}-${group.documentType}-${group.status}`}
                  className="grid gap-2 border-b border-border/50 px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1.2fr)_auto] sm:items-center sm:gap-4"
                >
                  <span className="font-medium">
                    <span className="mr-1 text-muted-foreground sm:hidden">
                      Организация:
                    </span>
                    {group.organizationId}
                  </span>
                  <span className="break-words text-muted-foreground">
                    {formatLabel(group.documentType)}
                  </span>
                  <span className="break-words">{formatLabel(group.status)}</span>
                  <Badge variant="secondary" className="w-fit tabular-nums">
                    {formatInteger(group.count)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewCards({ dashboard }: { dashboard: DashboardDto }) {
  const serviceStates = [
    dashboard.backgroundServices.jobService.health.isRunning &&
      !dashboard.backgroundServices.jobService.health.isStalled &&
      !dashboard.backgroundServices.jobService.isProgressStalled,
    dashboard.backgroundServices.documentService.health.isRunning &&
      !dashboard.backgroundServices.documentService.health.isStalled &&
      !dashboard.backgroundServices.documentService.isProgressStalled,
    dashboard.backgroundServices.bufferService.health.isRunning &&
      !dashboard.backgroundServices.bufferService.health.isStalled,
  ];
  const healthyServices = serviceStates.filter(Boolean).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Документы"
        value={formatInteger(dashboard.documents.total)}
        description={`Готово: ${formatInteger(dashboard.documents.completed)}, ошибок: ${formatInteger(dashboard.documents.failed)}`}
        icon={FileText}
        tone="violet"
      />
      <StatCard
        title="Задачи"
        value={formatInteger(dashboard.jobs.total)}
        description={`Готовы сейчас: ${formatInteger(dashboard.jobs.eligibleNow)}, отложены: ${formatInteger(dashboard.jobs.scheduled)}`}
        icon={Workflow}
        tone="blue"
      />
      <StatCard
        title="Паки"
        value={formatInteger(dashboard.packs.total)}
        description={`Статусов отслеживается: ${formatInteger(Object.keys(dashboard.packs.byStatus).length)}`}
        icon={Boxes}
        tone="cyan"
      />
      <StatCard
        title="Сервисы"
        value={`${healthyServices}/3`}
        description={`Ошибок в ленте: ${formatInteger(dashboard.backgroundServices.recentErrors.length)}`}
        icon={Activity}
        tone="green"
      />
    </div>
  );
}

export function SystemDashboard() {
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQueryDashboard();

  if (isLoading && !response) {
    return <DashboardSkeleton />;
  }

  if (isError || !response?.data) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Системный дашборд недоступен</CardTitle>
          <CardDescription>
            Не удалось получить данные мониторинга. Попробуйте обновить запрос.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => void refetch()}>
            <RefreshCw className="h-4 w-4" />
            Обновить
          </Button>
        </CardContent>
      </Card>
    );
  }

  const dashboard = response.data;
  const documentTypes = mapEntries(dashboard.documents.byType);
  const documentStatuses = mapEntries(dashboard.documents.byStatus);
  const jobStatuses = mapEntries(dashboard.jobs.byStatus);
  const packStatuses = mapEntries(dashboard.packs.byStatus);
  const serviceStates = [
    dashboard.backgroundServices.jobService.health.isRunning &&
      !dashboard.backgroundServices.jobService.health.isStalled &&
      !dashboard.backgroundServices.jobService.isProgressStalled,
    dashboard.backgroundServices.documentService.health.isRunning &&
      !dashboard.backgroundServices.documentService.health.isStalled &&
      !dashboard.backgroundServices.documentService.isProgressStalled,
    dashboard.backgroundServices.bufferService.health.isRunning &&
      !dashboard.backgroundServices.bufferService.health.isStalled,
  ];
  const healthyServices = serviceStates.filter(Boolean).length;
  const isSystemHealthy = healthyServices === serviceStates.length;

  return (
    <section className="flex flex-col gap-5 py-1">
      <div className="control-panel relative overflow-hidden rounded-2xl border-primary/20 p-5 md:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,color-mix(in_oklch,var(--primary)_5%,transparent)_1px,transparent_1px),linear-gradient(color-mix(in_oklch,var(--primary)_5%,transparent)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_right,black,transparent_78%)]" />
        <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Gauge className="size-4" />
              <span className="technical-label">Apex L3 / System control</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-[-0.035em] md:text-4xl">
              Центр управления
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Оперативная картина по документам, заданиям, пакам и фоновым
              сервисам в едином контуре.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                isSystemHealthy
                  ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-600 dark:text-emerald-300"
                  : "border-destructive/30 bg-destructive/8 text-destructive"
              }`}
            >
              <span className="relative flex size-9 items-center justify-center rounded-lg bg-current/10">
                <ShieldCheck className="size-5" />
              </span>
              <span>
                <span className="technical-label block text-[9px] opacity-65">
                  Общий статус
                </span>
                <span className="block text-sm font-bold">
                  {isSystemHealthy
                    ? "Система работает штатно"
                    : "Требуется внимание"}
                </span>
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Последняя синхронизация · {formatDateTime(response.timestamp)}
            </span>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
          <Badge
            variant={
              dashboard.backgroundServices.recentErrors.length > 0
                ? "destructive"
                : "success"
            }
          >
            <CircleAlert className="mr-1 h-3.5 w-3.5" />
            <span className="font-semibold">
              Ошибки ·{" "}
              {formatInteger(dashboard.backgroundServices.recentErrors.length)}
            </span>
          </Badge>
          <Badge variant="outline" className="bg-background/45">
            Сервисы в работе: {healthyServices}/{serviceStates.length}
          </Badge>
          <Badge
            variant={
              dashboard.backgroundServices.documentService.isProgressStalled
                ? "destructive"
                : "outline"
            }
            className={
              dashboard.backgroundServices.documentService.isProgressStalled
                ? undefined
                : "bg-background/45"
            }
          >
            Документы готовы: {formatInteger(dashboard.documents.eligibleNow)}
          </Badge>
          <Badge
            variant={
              dashboard.backgroundServices.jobService.isProgressStalled
                ? "destructive"
                : "outline"
            }
            className={
              dashboard.backgroundServices.jobService.isProgressStalled
                ? undefined
                : "bg-background/45"
            }
          >
            Задания готовы: {formatInteger(dashboard.jobs.eligibleNow)}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="ml-auto bg-background/55"
          >
            <RefreshCw
              className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            Обновить
          </Button>
        </div>
      </div>

      <OverviewCards dashboard={dashboard} />

      <JobQueueCard jobs={dashboard.jobs} />

      <DocumentQueueCard documents={dashboard.documents} />

      <div className="flex items-end justify-between pt-2">
        <div>
          <p className="technical-label text-primary">Операционная сводка</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Потоки данных
          </h2>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:block">
          Актуальные значения по выбранной организации
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="overflow-hidden border-border/70 bg-card/75">
          <CardHeader className="border-b border-border/50 p-5">
            <div className="mb-1 flex items-center gap-2 text-violet-500">
              <FileText className="size-4" />
              <span className="technical-label">Data flow</span>
            </div>
            <CardTitle className="text-lg">Документы</CardTitle>
            <CardDescription>
              Всего: {formatInteger(dashboard.documents.total)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm text-muted-foreground">В ожидании</p>
                <p className="text-xl font-semibold">
                  {formatInteger(dashboard.documents.pending)}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm text-muted-foreground">Завершено</p>
                <p className="text-xl font-semibold">
                  {formatInteger(dashboard.documents.completed)}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm text-muted-foreground">Ошибки</p>
                <p className="text-xl font-semibold">
                  {formatInteger(dashboard.documents.failed)}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm text-muted-foreground">С ошибками</p>
                <p className="text-xl font-semibold">
                  {formatInteger(dashboard.documents.withErrors)}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium">По типам</p>
              <DistributionList
                items={documentTypes}
                total={dashboard.documents.total}
                emptyText="Типы документов пока не появлялись."
              />
            </div>
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium">По статусам</p>
              <DistributionList
                items={documentStatuses}
                total={dashboard.documents.total}
                emptyText="Распределение по статусам пока пустое."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 bg-card/75">
          <CardHeader className="border-b border-border/50 p-5">
            <div className="mb-1 flex items-center gap-2 text-blue-500">
              <Workflow className="size-4" />
              <span className="technical-label">Job queue</span>
            </div>
            <CardTitle className="text-lg">Задания</CardTitle>
            <CardDescription>
              Активных: {formatInteger(dashboard.jobs.active)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm text-muted-foreground">Всего</p>
                <p className="text-xl font-semibold">
                  {formatInteger(dashboard.jobs.total)}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm text-muted-foreground">Терминальные</p>
                <p className="text-xl font-semibold">
                  {formatInteger(dashboard.jobs.terminal)}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm text-muted-foreground">С ошибками</p>
                <p className="text-xl font-semibold">
                  {formatInteger(dashboard.jobs.withErrors)}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-sm text-muted-foreground">Активные</p>
                <p className="text-xl font-semibold">
                  {formatInteger(dashboard.jobs.active)}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium">По статусам</p>
              <DistributionList
                items={jobStatuses}
                total={dashboard.jobs.total}
                emptyText="Статусы задач пока отсутствуют."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 bg-card/75">
          <CardHeader className="border-b border-border/50 p-5">
            <div className="mb-1 flex items-center gap-2 text-cyan-500">
              <PackageSearch className="size-4" />
              <span className="technical-label">Package pool</span>
            </div>
            <CardTitle className="text-lg">Паки</CardTitle>
            <CardDescription>
              Под мониторингом: {formatInteger(dashboard.packs.total)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="rounded-lg border border-border/60 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Всего паков</p>
                  <p className="text-3xl font-semibold">
                    {formatInteger(dashboard.packs.total)}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <PackageSearch className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">По статусам</p>
              <DistributionList
                items={packStatuses}
                total={dashboard.packs.total}
                emptyText="Статусы паков пока отсутствуют."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-2">
        <p className="technical-label text-primary">Инфраструктура</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          Состояние сервисов
        </h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <JobServiceCard service={dashboard.backgroundServices.jobService} />
        <DocumentServiceCard
          service={dashboard.backgroundServices.documentService}
        />
        <BufferServiceCard
          service={dashboard.backgroundServices.bufferService}
        />
      </div>

      <Card className="overflow-hidden border-border/70 bg-card/75">
        <CardHeader className="border-b border-border/50 p-5">
          <div className="mb-1 flex items-center gap-2 text-amber-500">
            <CircleAlert className="size-4" />
            <span className="technical-label">Event stream</span>
          </div>
          <CardTitle className="text-lg">Последние ошибки</CardTitle>
          <CardDescription>
            Лента ошибок фоновых сервисов и мониторинга.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          {dashboard.backgroundServices.recentErrors.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/6 p-4 text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="size-5" />
              <div>
                <p className="text-sm font-semibold">Новых ошибок нет</p>
                <p className="text-xs opacity-70">
                  Контур мониторинга работает штатно.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {dashboard.backgroundServices.recentErrors.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                >
                  <pre className="overflow-auto whitespace-pre-wrap break-words text-sm">
                    {renderUnknown(item)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
