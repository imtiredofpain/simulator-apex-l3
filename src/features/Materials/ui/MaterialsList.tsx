import { EntityList } from '@shared/components/EntityList';
import { useQueryMaterials } from '../hooks/useQueryMaterials';
import { PATHS } from '@shared/config/pathRoute';
import { useNavigate } from 'react-router-dom';
import { materialsColumns } from '../models/materialsColums';

function MaterialsList() {
  const navigate = useNavigate();
  const { data, isLoading } = useQueryMaterials();

  return (
    <EntityList
      search={{
        placeholder: "Поиск по материалам..."
      }}
      title={'Материалы'}
      columns={materialsColumns}
      data={data?.data || []}
      isLoading={isLoading}
      onCreate={() => navigate(PATHS.materials.create)}
    />
  );
}

export { MaterialsList };
