import { useNavigate, useParams } from 'react-router-dom';
import { SimplePage } from '@shared/components/SimplePage';
import { FormGenerator, Spin, type FormGeneratorRef } from '@mrdn/app-common';
import { Button } from '@shared/components/ui/button';
import { CircleX, Save } from 'lucide-react';
import { PATHS } from '@shared/config/pathRoute';
import { endpoints, http } from '@shared/api/endpoints';
import type { ControlModuleDto } from '../types';
import { toast } from 'sonner';
import { useQueryModule } from '../hooks/useQueryModule';
import { useRef } from 'react';
import { schemeFormModule } from './ControlModuleCreate';

function ControlModuleEdit() {
  const { id = '' } = useParams();
  const refLine = useRef<FormGeneratorRef>(null);
  const navigate = useNavigate();
  const { data: { data: module } = {}, isLoading } = useQueryModule(id);

  const handleSave = async (id: string) => {
    if (!refLine.current) return;
    const submit = await refLine.current.submit();
    if (!submit?.success) return;
    const values = refLine.current.getValues();
    if (!values) return;
    const res = await endpoints.controlModules.update.call<ControlModuleDto>(
      http,
      {
        body: values,
        params: { id },
      }
    );
    if (res.isSuccess) toast.success('Линия успешно обновлена');
    if (!res.isSuccess) toast.error('Произошла ошибка');
    navigate(PATHS.controlModules.byId(id));
  };

  const isLoaded = !isLoading && !!module;

  return (
    <SimplePage
      title={'*' + module?.name}
      actionComponent={
        <div className="flex flex-row items-center justify-left gap-3">
          <Button onClick={() => handleSave(id)} variant="submit">
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(PATHS.controlModules.byId(id))}
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
            definition={schemeFormModule}
            initialValues={{ ...module }}
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

export { ControlModuleEdit };
