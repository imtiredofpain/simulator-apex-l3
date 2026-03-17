import { PATHS } from '@shared/config/pathRoute';
import { toast } from 'sonner';
import { endpoints } from '@shared/api/endpoints';
import { FormGenerator, type FormGeneratorRef } from '@mrdn/app-common';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { CircleX, Save } from 'lucide-react';
import { apiClientInn } from '@shared/api/httpInn';

export const schemeFormModule = {
  version: '1.0',
  formId: 'lines-create',
  layout: {
    type: 'tabs',
    tabs: [
      {
        id: 'main',
        label: 'Основное',
        fields: ['basicgroup'],
      },
    ],
  },
  zodSchema: 'z.object({\\n  name: z.string().min(1)\\n})',
  fields: [
    {
      id: 'basicgroup',
      name: 'basicgroup',
      component: 'group',
      collapsible: false,
      defaultEnabled: false,
      propagateEnable: true,

      children: ['name', 'controlModuleNumber', 'ipAddress', 'port'],
    },
    {
      id: 'name',
      name: 'name',
      component: 'input',
      label: 'Наименование',
      required: true,
    },
    {
      id: 'controlModuleNumber',
      name: 'controlModuleNumber',
      component: 'input',
      label: 'Номер',
      prefix: 'CM-',
      required: true,
    },
    {
      id: 'ipAddress',
      name: 'ipAddress',
      component: 'input',
      label: 'IP адрес / Хост',
      required: true,
    },
    {
      id: 'port',
      name: 'port',
      component: 'input',
      label: 'Порт',
      required: true,
      inputType: 'number',
    },
  ],
} as const;

function ControlModuleCreate() {
  const refLine = useRef<FormGeneratorRef>(null);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!refLine.current) return;
    const submit = await refLine.current.submit();
    if (!submit?.success) return;
    const values = refLine.current.getValues();
    if (!values) return;
    const res = await endpoints.controlModules.create.call(apiClientInn, {
      body: values,
    });
    if (res.isSuccess) toast.success('Модуль управления успешно создан');
    if (!res.isSuccess) toast.error('Произошла ошибка');
    navigate(PATHS.controlModules.main);
  };

  return (
    <SimplePage
      title={'Создание модуля управления'}
      actionComponent={
        <div className="flex flex-row items-center justify-left gap-3">
          <Button onClick={handleSave} variant="submit">
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(PATHS.controlModules.main)}
          >
            <CircleX className="w-4 h-4 mr-2" />
            Отмена
          </Button>
        </div>
      }
      contentComponent={
        <FormGenerator
          ref={refLine}
          definition={schemeFormModule}
          initialValues={{
            name: 'Тестовый модуль управления',
            controlModuleNumber: '',
            ipAddress: '127.0.0.1',
            port: '8080',
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

export { ControlModuleCreate };
