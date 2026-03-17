import { EntityList } from '@shared/components/EntityList';
import { organizationsColumns } from './OrganizationsColums';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import { useQueryOrganizations } from '../hooks/useQueryOrganizations';

function OrganizationsPage() {
  const navigate = useNavigate();
  const { data: { data = [] } = {}, isLoading } = useQueryOrganizations();

  return (
    <EntityList
      search={{
        placeholder: "Поиск по организациям...",
      }}
      title={"Организации"}
      columns={organizationsColumns}
      data={data}
      isLoading={isLoading}
      onCreate={() => navigate(PATHS.lines.create)}
    />
  );
}

export { OrganizationsPage };
