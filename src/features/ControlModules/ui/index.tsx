import { EntityList } from '@shared/components/EntityList';
import { modulesColumns } from './ModulesColums';
import { useQueryModuleList } from '../hooks/useQueryModuleList';
import { PATHS } from '@shared/config/pathRoute';
import { useNavigate } from 'react-router-dom';

export function ControlModulesPage() {
  const navigate = useNavigate();
  const { data: { data = [] } = {}, isLoading } = useQueryModuleList();

  return (
    <EntityList
      search={{
        placeholder: "Поиск по модулям управления...",
      }}
      title={"Модули управления"}
      data={data}
      columns={modulesColumns}
      isLoading={isLoading}
      onCreate={() => {
        navigate(PATHS.controlModules.create);
      }}
    />
  );
}
