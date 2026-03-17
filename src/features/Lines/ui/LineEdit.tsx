import { useNavigate, useParams } from 'react-router-dom';
import useQueryLine from '../hooks/useQueryLine';
import { SimplePage } from '@shared/components/SimplePage';
import { FormGenerator, Spin, type FormGeneratorRef } from '@mrdn/app-common';
import { Button } from '@shared/components/ui/button';
import { CircleX, Save } from 'lucide-react';
import { PATHS } from '@shared/config/pathRoute';
import { schemeFormLine } from '../utils/schemeFormLine';
import { useMemo, useRef } from 'react';
import { useQueryModuleList } from '@features/ControlModules';
import { endpoints, http } from '@shared/api/endpoints';
import type { LineDto } from '../types';
import { toast } from 'sonner';

function LineEdit() {
  const { id = '' } = useParams();
  const refLine = useRef<FormGeneratorRef>(null);
  const navigate = useNavigate();
  const { data: { data: line } = {}, isLoading: isLoadingLine } =
    useQueryLine(id);
  const { data: { data = [] } = {}, isLoading: isLoadingModule } =
    useQueryModuleList();
  const scheme = useMemo(
    () => schemeFormLine(data.map((x) => ({ value: x.id, label: x.name }))),
    [data]
  );

  const handleSave = async (id: string) => {
    if (!refLine.current) return;
    const submit = await refLine.current.submit();
    if (!submit?.success) return;
    const values = refLine.current.getValues();
    if (!values) return;
    const res = await endpoints.lines.update.call<LineDto>(http, {
      body: {
        name: values.name,
        controlModuleId: Number(values.controlModuleId),
        lineNumber: values.lineNumber,
      },
      params: { id },
    });
    if (res.isSuccess) toast.success('Линия успешно обновлена');
    if (!res.isSuccess) toast.error('Произошла ошибка');
    navigate(-1);
  };

  const isLoaded = !isLoadingLine && !isLoadingModule && !!line && !!scheme;

  return (
    <SimplePage
      title={'*' + line?.name}
      actionComponent={
        <div className="flex flex-row items-center justify-left gap-3">
          <Button onClick={() => handleSave(id)} variant="submit">
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(PATHS.lines.byId(id))}
          >
            <CircleX className="w-4 h-4 mr-2" />
            Отмена
          </Button>
        </div>
      }
      contentComponent={
        !isLoaded ? (
          <div className="flex items-center justify-center h-40">
            <Spin />
          </div>
        ) : (
          <FormGenerator
            ref={refLine}
            definition={scheme}
            initialValues={{
              name: line?.name,
              controlModuleId: line?.controlModule.id,
              lineNumber: line?.lineNumber,
            }}
            key={1}
            engineConfig={{
              clearOnHideDefault: true,
              visibleSubmitButton: true,
              visibleCancelButton: false,
              visibleErrors: true,
            }}
          />
        )
      }
    />
  );
}

export { LineEdit };
