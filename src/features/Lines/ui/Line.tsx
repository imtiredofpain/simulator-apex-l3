import { FormGenerator } from '@mrdn/app-common';
import { SimplePage } from '@shared/components/SimplePage';
import { Button } from '@shared/components/ui/button';
import { SquarePen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { PATHS } from '@shared/config/pathRoute';
import useQueryLine from '../hooks/useQueryLine';

const definition = {
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
    },
    {
      id: 'lineNumber',
      name: 'lineNumber',
      component: 'input',
      label: 'Номер',
    },
    {
      id: 'name',
      name: 'name',
      component: 'input',
      label: 'Наименование',
    },
    {
      id: 'controlModuleName',
      name: 'controlModuleName',
      component: 'input',
      label: 'Модуль управления',
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
          field: 'lineNumber',
        },
        {
          label: 'Наименование',
          field: 'name',
        },
        {
          label: 'Модуль управления',
          field: 'controlModuleName',
        },
      ],
    },
  ],
} as const;

function LinePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: { data: line, timestamp } = {}, isLoading } = useQueryLine(id);
  console.log(id);
  const data = useMemo(() => {
    if (!line) return {};
    return {
      id: line.id,
      lineNumber: line.lineNumber,
      name: line.name,
      controlModuleName:
        line.controlModule.name +
        ' | ' +
        line.controlModule.ipAddress +
        ':' +
        line.controlModule.port,
    };
  }, [line]);

  if (isLoading || !line || !data || !id) return null;

  return (
    <SimplePage
      title={line.name}
      actionComponent={
        <div className="flex flex-row items-center justify-left gap-3">
          <Button
            variant="submit"
            onClick={() => {
              navigate(PATHS.lines.edit(id));
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
          initialValues={data}
          key={timestamp + line.id}
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

export { LinePage };
