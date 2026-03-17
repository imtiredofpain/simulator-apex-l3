import { linesColumns } from './LinesColums';
import { EntityList } from '@shared/components/EntityList';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import { useQueryLinesSelect } from '../hooks/useQueryLinesSelect';

export function LinesPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQueryLinesSelect();

  return (
    <EntityList
      search={{
        placeholder: 'Поиск по линиям...',
      }}
      title={'Линии'}
      data={data || []}
      columns={linesColumns}
      isLoading={isLoading}
      onCreate={() => {
        navigate(PATHS.lines.create);
      }}
    />
  );
}
