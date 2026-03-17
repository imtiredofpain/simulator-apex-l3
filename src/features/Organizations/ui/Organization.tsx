import {
  useSelectedInn,
  useSetSelectedInn,
} from '../store/useOrganizationsStore';
import { useQueryOrganizations } from '../hooks/useQueryOrganizations';

function Organization() {
  const selectedInn = useSelectedInn();
  const setSelectedInn = useSetSelectedInn();
  const { data: { data: organizations } = {}, isLoading } =
    useQueryOrganizations();

  if (isLoading) return <div>Загрузка организаций...</div>;

  return (
    <div>
      <select
        value={selectedInn || ''}
        onChange={(e) => setSelectedInn(e.target.value || null)}
      >
        <option value="">Выберите организацию</option>
        {organizations?.map((org) => (
          <option key={org.inn} value={org.inn}>
            {org.name} (ИНН: {org.inn})
          </option>
        ))}
      </select>

      {selectedInn && (
        <button onClick={() => setSelectedInn(null)}>Сбросить выбор</button>
      )}
    </div>
  );
}

export { Organization };
