import { FormGenerator, type FormGeneratorRef } from '@mrdn/app-common';
import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { PATHS } from '@shared/config/pathRoute';
import { CircleX, Save } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { schemeFormLine } from '../utils/schemeFormLine';
import { endpoints, http } from '@shared/api/endpoints';
import { type LineDto } from '../types';
import { toast } from 'sonner';
import { useQueryModuleList } from '@features/ControlModules/';
import { isAxiosError } from 'axios';

function LineCreate() {
  const refLine = useRef<FormGeneratorRef>(null);
  const navigate = useNavigate();
  const { data: { data = [] } = {} } = useQueryModuleList();
  const scheme = useMemo(
    () => schemeFormLine(data.map((x) => ({ value: x.id, label: x.name }))),
    [data]
  );

  const handleSave = async () => {
    if (!refLine.current) return;
    const submit = await refLine.current.submit();
    if (!submit?.success) return;
    const values = refLine.current.getValues();
    if (!values) return;
    try {
      const res = await endpoints.lines.create.call<LineDto>(http, {
        body: {
          name: values.name,
          controlModuleId: Number(values.controlModuleId),
          lineNumber: values.lineNumber,
        },
      });
      if (res.isSuccess) toast.success('Линия успешно создана');
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 409) {
          toast.error('Линия с таким номером уже существует');
          return;
        }
        toast.error(`Произошла ошибка ${error.code} ${error.message}`);
        return;
      }
      toast.error('Произошла ошибка');
    }

    navigate(-1);
  };

  return (
    <SimplePage
      title={'Создание линии'}
      actionComponent={
        <div className="flex flex-row items-center justify-left gap-3">
          <Button onClick={handleSave} variant="submit">
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(PATHS.lines.main)}
          >
            <CircleX className="w-4 h-4 mr-2" />
            Отмена
          </Button>
        </div>
      }
      contentComponent={
        <FormGenerator
          ref={refLine}
          definition={scheme}
          initialValues={{
            ipAddress: '127.0.0.1',
            port: 8080,
            name: 'Тестовая линия',
          }}
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

export { LineCreate };
