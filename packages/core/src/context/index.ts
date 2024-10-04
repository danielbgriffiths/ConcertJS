// import { ConcertFunctionalComponent, ConcertSignalGetter } from "../types";
// import { effect, signal } from "@concertjs/reactivity";
//
// type DefaultValue = Record<string, any>;
//
// export type ConcertContextProviderProps<V extends DefaultValue> = {
//   value: V;
//   children: JSX.Element;
// };
//
// export type ConcertContext<V extends DefaultValue> = {
//   uid: string;
//   Provider: ConcertFunctionalComponent<ConcertContextProviderProps<V>>;
// };
//
// const contextMap = new Map<string, ConcertSignalGetter<DefaultValue>>();
//
// export function createContext<V extends DefaultValue>(defaultValue: V): ConcertContext<V> {
//   const [value, setValue] = signal<V>(defaultValue);
//
//   const context: ConcertContext<V> = {
//     uid: String(Math.random()),
//     Provider: function (props: ConcertContextProviderProps<V>): JSX.Element {
//       effect((): void => {
//         setValue(props.value);
//       });
//
//       return <>{props.children}</>;
//     }
//   };
//
//   contextMap.set(context.uid, value);
//
//   return context;
// }
//
// export function useContext<V extends DefaultValue>(context: ConcertContext<V>): V | undefined {
//   return contextMap.get(context.uid)?.() as V | undefined;
// }
