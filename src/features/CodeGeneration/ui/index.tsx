import { scriptsColumns } from './ScriptsColumns';
import { EntityList } from '@shared/components/EntityList';
import { useQueryScripts } from '../hooks/useQueryScripts';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@shared/config/pathRoute';
import { useMemo } from 'react';

export function ScriptsPage() {
  const navigate = useNavigate();
  const { data: { data: scripts } = {}, isLoading } = useQueryScripts();

  const rows = useMemo(() => {
    if (!scripts) return [];
    return scripts.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      version: s.version,
      isActive: s.isActive,
    }));
  }, [scripts]);

  return (
    <EntityList
      search={{
        placeholder: 'Поиск по скриптам...',
      }}
      title="Генерация кодов"
      data={rows}
      columns={scriptsColumns}
      isLoading={isLoading}
      onCreate={() => {
        navigate(PATHS.codeGeneration.create);
      }}
    />
  );
}
