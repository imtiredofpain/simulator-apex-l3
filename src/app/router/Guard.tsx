/**
 * Guard – компонент-сторож для маршрутов.
 *
 * Используется для ограничения доступа к маршруту на основе прав (`permissions`) и групп (`needGroups`).
 * Пустые массивы означают, что раздел доступен всем.
 *
 * Пример подключения в сборке роутов:
 * ```tsx
 * <Guard needPermissions={["task:read"]} needGroups={["operators"]}>
 *   <TaskPage />
 * </Guard>
 * ```
 *
 * Поведение:
 * - Если хотя бы одно требуемое право присутствует у пользователя И хотя бы одна требуемая группа совпала – доступ разрешён.
 * - Если списки пустые – доступ разрешён всем.
 * - Иначе выполняется редирект на `/forbidden` (можно заменить при необходимости).
 */
import { useMemo } from 'react';
import { Forbidden } from '@features/Errors';
import { useSelectedInn } from '@features/Organizations';
import RequiredInn from '@features/Errors/ui/RequiredInn';

/**
 * Временная заглушка для получения текущего пользователя.
 * Замените на реальный хук/селектор состояния авторизации.
 *
 * Ожидается, что будут возвращены множества `permissions` и `groups` –
 * это ускоряет проверку принадлежности (операция O(1)).
 */
function useCurrentUser() {
  return {
    permissions: new Set<string>([]), // пример: task:read
    groups: new Set<string>([]), // пример: operators
  };
}

/**
 * Свойства компонента Guard.
 *
 * @property needPermissions Массив прав, любое из которых даёт доступ. Пусто → доступ всем.
 * @property needGroups     Массив групп, любая из которых даёт доступ. Пусто → доступ всем.
 * @property children       Содержимое защищаемого раздела.
 */
type GuardProps = {
  needPermissions?: string[];
  needGroups?: string[];
  innRequired?: boolean;
  children: React.ReactNode;
};

/**
 * Компонент-сторож маршрута/блока интерфейса.
 *
 * Алгоритм допуска:
 * 1) Если `needPermissions` пуст – условие по правам считается выполненным;
 *    иначе – требуется совпадение по крайней мере одного права.
 * 2) Если `needGroups` пуст – условие по группам считается выполненным;
 *    иначе – требуется совпадение по крайней мере одной группы.
 * 3) Разрешение = условие(права) И условие(группы).
 *
 * При отказе выполняется редирект на `/forbidden` с сохранением `location` в `state.from`.
 *
 * @example Защита целой страницы
 * ```tsx
 * <Route
 *   path="/tasks/:id"
 *   element={
 *     <Guard needPermissions={["task:read"]} needGroups={["operators","admins"]}>
 *       <TaskPage />
 *     </Guard>
 *   }
 * />
 * ```
 *
 * @example Скрытие куска интерфейса (без маршрута)
 * ```tsx
 * {allowed ? <DangerZone /> : null}
 * // где allowed рассчитан тем же алгоритмом
 * ```
 */

export function Guard({
  needPermissions = [],
  needGroups = [],
  innRequired = false,
  children,
}: GuardProps) {
  const { permissions, groups } = useCurrentUser();
  const selectedInn = useSelectedInn();

  const allowed = useMemo(() => {
    const permOK =
      needPermissions.length === 0 ||
      needPermissions.some((p) => permissions.has(p));
    const groupOK =
      needGroups.length === 0 || needGroups.some((g) => groups.has(g));
    return permOK && groupOK;
  }, [needPermissions, needGroups, permissions, groups]);

  if (!allowed) {
    return <Forbidden />;
  }

  if (innRequired && !selectedInn) {
    return <RequiredInn />;
  }

  return <>{children}</>;
}
