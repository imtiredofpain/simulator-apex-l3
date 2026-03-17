import { FormGenerator, type FormGeneratorRef } from '@mrdn/app-common';
import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { CircleX, RefreshCcw, Save } from 'lucide-react';
import { memo, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { schemeFormTask } from '../models/Definitions/form';
import { endpoints } from '@shared/api/endpoints';
import { type TaskDto } from '../types';
import { toast } from 'sonner';
import { useQueryLines } from '@features/Lines';
import { useQueryMaterials } from '@features/Materials';
import { useQueryProducts } from '@features/Products';
import useEnum from '@shared/api/hooks/enums/useEnum';
import { useQueryPackages } from '@features/Packages';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { apiClientInn } from '@shared/api/httpInn';
import useQueryTask from '../hooks/useQueryTask';
import { normalizeDateTime } from '@shared/lib/formatByUnit';
import { NotFound } from '@features/Errors';

function TaskEdit() {
  const { id = "" } = useParams();
  const refTaskForm = useRef<FormGeneratorRef>(null);
  const navigate = useNavigate();
  const { data: { data: task } = {}, isLoading: isLoadingTask } = useQueryTask(id ? parseInt(id) : undefined);
  const { data: { data: lines } = {}, isLoading: isLoadingLines } = useQueryLines();
  const { data: { data: materials } = {}, isLoading: isLoadingMaterials } = useQueryMaterials();
  const { data: { data: products } = {}, isLoading: isLoadingProducts } = useQueryProducts();
  const { data: { data: packages } = {}, isLoading: isLoadingPackages } = useQueryPackages();
  const { data: { data: types } = {}, isLoading: isLoadingTypes } = useEnum<{
    name: string;
    description: string;
  }>({
    name: 'job-type',
  });
  const {
    data: { data: productionDateTypes } = {},
    isLoading: isLoadingProductionDateTypes,
  } = useEnum<{
    name: string;
    description: string;
  }>({
    name: "production-date-type",
  });
  const { data: { data: timeUnits } = {}, isLoading: isLoadingTimeUnits } =
    useEnum<{
      name: string;
      description: string;
    }>({
      name: "time-units",
    });
  const {
    data: { data: partialReportInclusionRule } = {},
    isLoading: isLoadingPartialReportInclusionRule,
  } = useEnum<{
    name: string;
    description: string;
  }>({
    name: "partial-report-inclusion-rule",
  });

  const {
    data: { data: packageLevelRule } = {},
    isLoading: isLoadingPackageLevelRule,
  } = useEnum<{
    name: string;
    description: string;
  }>({
    name: "package-level-rule",
  });

  const { t } = useTranslation();

  const initialValues = useMemo(() => {
    const d1 = new Date(task?.job.plannedStartTime || 0);
    const d2 = new Date(task?.job.plannedEndTime || 0);
    const d3 = new Date(task?.job.productionTimeSettings.fixedProductionDate || 0);

    const response = {
      ...task?.job,
      ...task?.job.settings,
      ...task?.job.productionTimeSettings,
      ...task?.job.partialReportSettings,
      productionDateType:
        task?.job.productionTimeSettings.calculationMethod.toString(),
      fixedProductionDate: task?.job.productionTimeSettings.fixedProductionDate ? normalizeDateTime(d3.getTime(), "y-m-dTh:i:s") : undefined,
      productionShiftValue:
        task?.job.productionTimeSettings.timeShift?.toString(),
      productionShiftUnit:
        task?.job.productionTimeSettings.timeShiftUnit?.toString(),
      partialReportUse: task?.job.partialReportSettings.use,
      partialReportInclusionRuleTypes:
        task?.job.partialReportSettings.inclusionRule?.toString(),
      partialReportManualUse: task?.job.partialReportSettings.allowManual,
      partialReprtStartTime: task?.job.partialReportSettings.startTime,
      partialReportInterval: task?.job.partialReportSettings.interval,
      partialReportInclusionRule:
        task?.job.partialReportSettings.inclusionRule?.toString(),
      partialReportQuarantineTime:
        task?.job.partialReportSettings.productionTimeOffset,
      partialReportQuarantineDate:
        task?.job.partialReportSettings.productionDateOffset,
      // partialReportInclusionRuleEnabled:
      // task?.job.partialReportSettings.inclusionRuleEnabled,
      plannedStartDate: task?.job.plannedStartTime
        // Формат для input
        ? normalizeDateTime(d1.getTime(), "y-m-dTh:i:s")
        : undefined,
      plannedEndDate: task?.job.plannedEndTime ? normalizeDateTime(d2.getTime(), "y-m-dTh:i:s") : undefined,
      autoSend: task?.job.autoSendToLine,
    };

    return response;
  }, [task]);

  const scheme = useMemo(() => {
    const linesOptions =
      lines?.map((line) => ({
        value: line.id.toString(),
        label: line.name.toString(),
      })) || [];

    const materialsOptions =
      materials?.map((material) => ({
        value: material.id.toString(),
        label: material.name.toString(),
      })) || [];

    const productsOptions =
      products?.map((product) => ({
        value: product.id.toString(),
        label: product.name.toString(),
      })) || [];

    const typesOptions =
      Object.keys(types || {}).map((key) => ({
        value: key,
        label: types?.[key].description || types?.[key].name || "",
      })) || [];

    const productionDateTypesOptions =
      Object.keys(productionDateTypes || {}).map((key) => ({
        value: key,
        label:
          productionDateTypes?.[key].description ||
          productionDateTypes?.[key].name ||
          "",
      })) || [];

    const timeUnitsOptions =
      Object.keys(timeUnits || {}).map((key) => ({
        value: key,
        label: timeUnits?.[key].description || timeUnits?.[key].name || "",
      })) || [];

    const partialReportInclusionRuleOptions =
      Object.keys(partialReportInclusionRule || {}).map((key) => ({
        value: key,
        label:
          partialReportInclusionRule?.[key].description ||
          partialReportInclusionRule?.[key].name ||
          "",
      })) || [];

    const packageLevelRuleOptions =
      Object.keys(packageLevelRule || {}).map((key) => ({
        value: key,
        label:
          packageLevelRule?.[key].description ||
          packageLevelRule?.[key].name ||
          "",
      })) || [];

    const packagesOptions =
      packages?.map((p) => ({
        value: p.id.toString(),
        label: p.packageNumber.toString(),
      })) || [];

    return schemeFormTask({
      config: {
        formId: "task-edit",
      },
      data: {
        lineOptions: linesOptions,
        materialOptions: materialsOptions,
        productOptions: productsOptions,
        jobTypeOptions: typesOptions,
        packageOptions: packagesOptions,
        productionDateTypes: productionDateTypesOptions,
        timeUnitsOptions: timeUnitsOptions,
        partialReportInclusionRuleOptions: partialReportInclusionRuleOptions,
        packageLevelRuleOptions: packageLevelRuleOptions,
      }
    });
  }, [
    lines,
    materials,
    products,
    types,
    packages,
    productionDateTypes,
    timeUnits,
    partialReportInclusionRule,
    packageLevelRule,
  ]);

  const handleSave = async () => {
    if (!refTaskForm.current) return;
    const submit = await refTaskForm.current.submit();
    if (!submit?.success) return;
    const values = refTaskForm.current.getValues();
    if (!values) return;
    try {
      const d1 = new Date(values.plannedStartDate as string);
      const d2 = values.plannedEndDate
        ? new Date(values.plannedEndDate as string)
        : undefined;
      if (d2 && d1 > d2) {
        toast.error('Дата начала не может быть больше даты окончания');
        return;
      }
      let d3 = undefined;
      if (values.fixedProductionDate) {
        d3 = new Date(values.fixedProductionDate as string);
      }
      const body = {
        plannedQuantity: parseInt(values.plannedQuantity as string),
        jobType: parseInt(values.jobType as string),
        plannedStartDate: d1.toISOString(),
        plannedEndDate: d2?.toISOString(),
        materialId: values.materialId
          ? parseInt(values.materialId as string)
          : undefined,
        lineId: parseInt(values.lineId as string),
        productId: values.productId
          ? parseInt(values.productId as string)
          : undefined,
        packageId: values.packageId
          ? parseInt(values.packageId as string)
          : undefined,
        settings: {
          autoRelease: values.autoRelease,
          autoSendToLine: values.autoSend,
        },
        productionTimeSettings: {
          calculationMethod: parseInt(values.productionDateType as string),
          fixedProductionDate: d3?.toISOString(),
          timeShift: values.productionShiftValue,
          timeShiftUnit: values.productionShiftUnit
            ? parseInt(values.productionShiftUnit as string)
            : undefined,
        },
        partialReportSettings: {
          // partialReportInclusionRuleEnabled
          use: values.partialReportUse,
          packageLevelRule: parseInt(
            values.partialReportInclusionRuleTypes as string
          ),
          allowManual: values.partialReportManualUse,
          startTime:
            values.partialReprtStartTime &&
            (values.partialReprtStartTime as string)?.length <= 5
              ? `${values.partialReprtStartTime}:00`
              : values.partialReprtStartTime ? values.partialReprtStartTime : undefined,
          interval:
            values.partialReportInterval &&
            (values.partialReportInterval as string)?.length <= 5
              ? `${values.partialReportInterval}:00`
              : values.partialReportInterval
              ? values.partialReportInterval
              : undefined,
          inclusionRule: parseInt(values.partialReportInclusionRule as string),
          productionTimeOffset:
            values.partialReportQuarantineTime &&
            (values.partialReportQuarantineTime as string)?.length <= 5
              ? `${values.partialReportQuarantineTime}:00`
              : values.partialReportQuarantineTime
              ? values.partialReportQuarantineTime
              : undefined,
          productionDateOffset: values.partialReportQuarantineDate,
        },
      };

      const res = await endpoints.tasks.update.call<TaskDto>(apiClientInn, {
        params: { id },
        body,
      });
      if (res.isSuccess) toast.success('Задание успешно обновлено');
      if (!res.isSuccess) toast.error('Произошла ошибка');
      navigate(-1);
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError) {
        if (error.response?.data.validationErrors) {
          const errors = [];
          for (const key in error.response?.data.validationErrors) {
            errors.push({
              key: t('keys.' + key),
              error: t('errors.' + error.response?.data.validationErrors[key]),
            });
          }
          toast.error('Произошла ошибка', {
            description: (
              <div>
                {errors.map((error, index) => (
                  <div key={index}>
                    <span className="font-bold">{error.key}</span>:{' '}
                    <span>{error.error}</span>
                  </div>
                ))}
              </div>
            ),
          });
          return;
        }
        toast.error('Произошла ошибка', {
          description: t(`errors.${error.response?.data.message}`),
        });
      } else if (error instanceof Error) {
        toast.error('Произошла ошибка', {
          description: t(error.message),
        });
      } else {
        toast.error('Произошла ошибка');
      }
    }
  };

  const isLoading =
    isLoadingTask ||
    isLoadingLines ||
    isLoadingMaterials ||
    isLoadingProducts ||
    isLoadingPackages ||
    isLoadingTypes ||
    isLoadingProductionDateTypes ||
    isLoadingTimeUnits ||
    isLoadingPartialReportInclusionRule ||
    isLoadingPackageLevelRule; 

  if (!task && !isLoading) {
    return <NotFound title="Задание не найдено" />;
  }

  return (
    <SimplePage
      title={task?.job.jobNumber.toString() ? `Редактирование задания: ${task?.job.jobNumber.toString()}` : "Редактирование задания"}
      actionComponent={
        <div className="flex flex-row items-center justify-left gap-3">
          <Button onClick={handleSave} variant="submit" className='dark:text-white'>
            <Save className="w-4 h-4 mr-2" />
            Изменить задание
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              refTaskForm.current?.reset();
            }}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Сбросить поля
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <CircleX className="w-4 h-4 mr-2" />
            Отмена
          </Button>
        </div>
      }
      isLoading={isLoading}
      contentComponent={
        <FormGenerator
          ref={refTaskForm}
          definition={scheme}
          initialValues={initialValues}
          key={1}
          engineConfig={{
            clearOnHideDefault: true,
            visibleSubmitButton: true,
            visibleCancelButton: false,
            visibleErrors: true,
          }}
        />
      }
    />
  );
}

export default memo(TaskEdit);
