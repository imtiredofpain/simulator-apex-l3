import type { ComponentType, ReactNode } from 'react';
import { type AccessRule } from '../rbac/types';

export type LayoutKind = 'app' | 'blank' | 'auth' | 'fullscreen';

export type NavigationParams = Record<string, string | number | boolean>;
export type NavigationQuery = Record<
  string,
  string | number | boolean | (string | number | boolean)[] | undefined
>;

export type AnyRoute = {
  readonly name: string;
  readonly path: string;
  readonly children?: readonly AnyRoute[];
  readonly meta?: RouteMeta;
};

export type NodeRuntime = {
  __name: string;
  __path: string;
  __url: (
    NavigationParams?: NavigationParams,
    query?: NavigationQuery
  ) => string;
  __meta?: RouteMeta;
};

type BuildChildren<T extends readonly AnyRoute[]> = {
  [K in T[number] as K['name']]: BuildNode<K>;
};

export type BuildNode<T extends AnyRoute> = NodeRuntime &
  (T['children'] extends readonly AnyRoute[]
    ? BuildChildren<T['children']>
    : object);

export type LinksTree<T extends readonly AnyRoute[]> = BuildChildren<T>;

export type IconType =
  | ComponentType<{ className?: string }>
  | (() => ReactNode);

export interface ButtonHeaderClickable {
  label: string;
  onClick: () => void;
  icon?: IconType;
  id: string | number;
}

export interface ButtonHeaderComponent {
  label: string;
  component: ComponentType<{ className?: string }>; // Любой компонент
  icon?: IconType;
  id: string | number;
}

export type ButtonHeader = ButtonHeaderClickable | ButtonHeaderComponent;

export interface SeparatorHeader {
  separator: true;
  id: string | number;
}

export interface GroupHeader {
  icon?: IconType;
  label: string;
  children: (ButtonHeader | SeparatorHeader | GroupHeader)[];
  id: string | number;
}

export type HeaderDropdown = ButtonHeader | SeparatorHeader | GroupHeader;

export type RouteMeta<TMeta = Record<string, unknown>> = {
  title?: string;
  description?: string;
  icon?: IconType;
  innRequired?: boolean;
  order?: number;
  extra?: TMeta;
  buttons?: ButtonHeader[];
  dropdown?: HeaderDropdown[];
};

export type RouteConfig<TMeta = unknown> = AccessRule & {
  name: string;
  path: string;
  layout?: LayoutKind;
  element?: React.LazyExoticComponent<React.ComponentType> | ReactNode;
  index?: boolean;
  children?: RouteConfig<RouteMeta<TMeta>>[];

  handle?: {
    crumb?: () => string | React.ReactNode;
    icon?: RouteMeta['icon'];
  };

  meta?: RouteMeta<TMeta>;
};

export type SidebarSimpleItem = {
  title: string;
  icon?: IconType;
  to: string;
  order?: number;
};

export type SidebarGroupItem = {
  title: string;
  icon?: IconType;
  order?: number;
  children: SidebarSimpleItem[];
};

export type SidebarGroupComponentItem = {
  title: string;
  icon?: IconType;
  order?: number;
  to: string;
  component: ComponentType<{ isOpen?: boolean }>;
};
