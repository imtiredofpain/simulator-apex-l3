import { EntityList } from '@shared/components/EntityList';
import { packagesColumns } from '../models/packagesColums';
import { useQueryPackagesSelect } from '../hooks/useQueryPackagesSelect';
import { PATHS } from '@shared/config/pathRoute';
import { useNavigate } from 'react-router-dom';

function PackagesPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQueryPackagesSelect();

  return (
    <EntityList
      search={{
        placeholder: 'Поиск по упаковкам...',
      }}
      title={'Упаковка'}
      columns={packagesColumns}
      data={data || []}
      isLoading={isLoading}
      onCreate={() => navigate(PATHS.packages.create)}
    />
  );
}

export { PackagesPage };
