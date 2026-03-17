import { FormGenerator, type FormDefinition } from '@mrdn/app-common';
import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { PATHS } from '@shared/config/pathRoute';
import { SquarePen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryModule } from '../hooks/useQueryModule';

const definition: FormDefinition = {
  version: '1.0',
  formId: 'lines-create',
  layout: {
    type: 'tabs',
    tabs: [
      {
        id: 'main',
        label: 'Основное',
        fields: ['sum'],
      },
    ],
  },
  zodSchema: '',
  fields: [
    {
      id: 'id',
      name: 'id',
      component: 'input',
      label: 'id',
      required: true,
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
    {
      id: 'sum',
      name: 'sum',
      component: 'summary',
      template: [
        {
          label: 'id',
          field: 'id',
        },
        {
          label: 'Номер',
          field: 'controlModuleNumber',
        },
        {
          label: 'Наименование',
          field: 'name',
        },
        {
          label: 'IP адрес / Хост',
          field: 'ipAddress',
        },
        {
          label: 'Порт',
          field: 'port',
        },
      ],
    },
  ],
} as const;

function ControlModulePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: { data: module, timestamp } = {}, isLoading } =
    useQueryModule(id);

  if (isLoading || !module || !id) return null;
  return (
    <SimplePage
      title={module.name}
      actionComponent={
        <div className="flex flex-row items-center justify-left gap-3">
          <Button
            variant="submit"
            onClick={() => {
              navigate(PATHS.controlModules.edit(id));
            }}
          >
            <SquarePen className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
        </div>
      }
      contentComponent={
        <FormGenerator
          definition={definition}
          initialValues={{ ...module }}
          key={timestamp}
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

export { ControlModulePage };
