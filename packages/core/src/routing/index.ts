// import { createContext, useContext } from "../context";
// import { ConcertComponent, ConcertPropsWithChildren } from "../types";
//
// type ConcertRouterReturn = {
//   navigate: (href: string) => void;
// };
//
// export type ConcertRoute<P = any> = {
//   path: string;
//   component: ConcertComponent<P>;
//   name: string;
//   props?: ((instance: any) => P) | ((instance: any) => Promise<P>);
//   guards?: ((instance: any) => boolean) | ((instance: any) => Promise<boolean>);
//   children?: ConcertRoute[];
// };
//
// export interface ConcertRouterProviderProps extends ConcertPropsWithChildren {
//   routes: ConcertRoute[];
// }
//
// export class ConcertRouter {
//   routes: ConcertRoute[] = [];
//
//   constructor(routes: ConcertRoute[]) {
//     this.routes = routes;
//   }
//
//   public replace(href: string) {
//     window.location.pathname = href;
//   }
// }
//
// export const ConcertRouterContext = createContext<ConcertRouterReturn>({
//   navigate: () => {}
// });
//
// export function useRouter(): ConcertRouterReturn {
//   return useContext<ConcertRouterReturn>(ConcertRouterContext)!;
// }
//
// export function ConcertRouterProvider(props: ConcertRouterProviderProps) {
//   const router = new ConcertRouter(props.routes);
//
//   function navigate(href: string): void {
//     router.replace(href);
//   }
//
//   return (
//     <ConcertRouterContext.Provider
//       value={{
//         navigate
//       }}
//     >
//       {props.children}
//     </ConcertRouterContext.Provider>
//   );
// }

export function Route(_path: string) {
  return function (constructor: Function): void {
    console.log("Route CONSTRUCTOR: ", constructor);
  };
}

export function ConcertRouteSlot(props: Record<string, any>): JSX.Element {
  return props.children;
}
