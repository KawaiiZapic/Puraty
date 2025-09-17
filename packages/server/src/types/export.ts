type toPromise<T> = T extends Promise<any> ? T : Promise<T>;
type Abstraction<T> = {
  [K in keyof T]?: T[K] extends (...args: any) => any ? (...args: any) => toPromise<ReturnType<T[K]>> : T[K];
} & Record<string, unknown>; 

export type {
  InstalledSourceDetail,
  NetworkSourceDetail,
  SourceModifyBody
} from "@/app/comic-source/comic-source.model";

export type ComicSourceHandler = Abstraction<import("@/app/comic-source/comic-source.controller").ComicSourceHandler>;