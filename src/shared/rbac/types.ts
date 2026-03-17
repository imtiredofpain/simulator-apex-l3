export type Permission = string;
export type Group = string;

export type AccessRule = {
  /** Права, любые из которых дают доступ; пусто => доступ всем */
  permissions?: Permission[];
  /** Группы, любые из которых дают доступ; пусто => доступ всем */
  groups?: Group[];
};
