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
  DashboardDto,
  DashboardJobServiceDto,
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
  children,
}: {
  health: DashboardServiceHealthDto;
  children: ReactNode;
}) {
  return (
    <Card
      className={`overflow-hidden border-border/70 bg-card/75 ${
        health.isRunning && !health.isStalled
          ? "border-t-emerald-500/60"
          : "border-t-destructive/70"
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
          <Badge variant={getHealthVariant(health)}>
            {getHealthLabel(health)}
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

function JobServiceCard({ service }: { service: DashboardJobServiceDto }) {
  const activeJobs = Object.entries(service.activeJobs);

  return (
    <ServiceCard health={service.health}>
      <MetricWindow title="Обработано" metric={service.processed} />
      <MetricWindow title="Ошибки" metric={service.failed} />
      <MetricWindow title="Таймауты" metric={service.timeout} />
      <ProcessingTimeCard processingTime={service.processingTime} />
      <div className="rounded-lg border border-border/60 p-3">
        <p className="text-sm font-medium">
          Активные задачи: {formatInteger(service.activeJobsCount)}
        </p>
        {activeJobs.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Сейчас активных задач нет.
          </p>
        ) : (
          <div className="mt-2 flex flex-col gap-2">
            {activeJobs.map(([key, value]) => (
              <div key={key} className="rounded-md bg-muted/40 p-2 text-sm">
                <p className="font-medium">{key}</p>
                <pre className="mt-1 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                  {renderUnknown(value)}
                </pre>
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
  return (
    <ServiceCard health={service.health}>
      <MetricWindow title="Обработано" metric={service.processed} />
      <MetricWindow title="Ошибки" metric={service.failed} />
      <ProcessingTimeCard processingTime={service.processingTime} />
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

function OverviewCards({ dashboard }: { dashboard: DashboardDto }) {
  const services = [
    dashboard.backgroundServices.jobService.health,
    dashboard.backgroundServices.documentService.health,
    dashboard.backgroundServices.bufferService.health,
  ];
  const healthyServices = services.filter(
    (service) => service.isRunning && !service.isStalled,
  ).length;

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
        description={`Активных: ${formatInteger(dashboard.jobs.active)}, терминальных: ${formatInteger(dashboard.jobs.terminal)}`}
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
  const services = [
    dashboard.backgroundServices.jobService.health,
    dashboard.backgroundServices.documentService.health,
    dashboard.backgroundServices.bufferService.health,
  ];
  const healthyServices = services.filter(
    (service) => service.isRunning && !service.isStalled,
  ).length;
  const isSystemHealthy = healthyServices === services.length;

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
            Сервисы в работе: {healthyServices}/{services.length}
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
