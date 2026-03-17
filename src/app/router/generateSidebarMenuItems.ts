// import type {
//   RouteConfig,
//   SidebarGroupItem,
//   SidebarSimpleItem,
// } from '@shared/navigation/types';
// import type { routesConfig } from '.';

// export function generateSidebarMenuItems(
//   routes: typeof routesConfig
// ): [SidebarSimpleItem[], SidebarGroupItem[]] {
//   const simpleItems: SidebarSimpleItem[] = [];
//   const groupItems: SidebarGroupItem[] = [];
//   function processRoute(route: RouteConfig) {
//     // Флаг «нужен в меню» — наличие meta.icon (ты его уже используешь как индикатор)
//     // Если захочешь отдельный флаг — просто замени на !!route.meta?.inMenu или !!route.meta?.menu
//     //@ts-ignore
//     if (!route.meta?.inMenu) return;

//     if (!route.meta?.title) return;

//     const routePath = route.path;

//     const order = route.meta?.order ?? 999;

//     const baseItem = {
//       title: route.meta.title,
//       icon: route.meta.icon,
//       order,
//     };

//     // Если нет детей вообще — всегда простой пункт
//     if (!route.children || route.children.length === 0) {
//       simpleItems.push({
//         ...baseItem,
//         to: routePath,
//       });
//       return;
//     }

//     // Собираем только те дети, у которых тоже есть icon (т.е. нужны в меню)
//     const menuChildren = route.children
//       .filter((child: RouteConfig) => child.meta?.inMenu && child.meta?.title)
//       .map((child) => {
//         return {
//           title: child.meta?.title as string,
//           icon: child.meta?.icon,
//           to: child.path,
//           order: child.meta?.order ?? 999,
//         };
//       });

//     if (!!menuChildren && menuChildren.length === 0) {
//       simpleItems.push({
//         ...baseItem,
//         to: routePath,
//       });
//     } else {
//       // Есть дети для меню → делаем группу (dropdown/collapsible)
//       groupItems.push({
//         ...baseItem,
//         children: menuChildren, //.sort((a, b) => a.order - b.order)
//       });
//     }
//   }

//   for (const route of routes) {
//     processRoute(route);
//   }

//   // Сортируем по order
//   // simpleItems.sort((a, b) => a.order - b.order);
//   // groupItems.sort((a, b) => a.order - b.order);

//   return [simpleItems, groupItems];
// }
