declare module "lodash" {
  declare function find<T>(list: T[], predicate: (val: T)=>boolean): ?T;
  declare function findWhere<T>(list: Array<T>, properties: {[key:string]: any}): ?T;
  declare function clone<T>(obj: T): T;

  declare function isEqual(a: any, b: any): boolean;
  declare function range(a: number, b: number): Array<number>;
  declare function extend<S, T>(o1: S, o2: T): S & T;

  declare function zip<S, T>(a1: S[], a2: T[]): Array<[S, T]>;
  declare function zipWith<S, T, R>(a1: S[], a2: T[], fn: (a1: S, a2: T) => R): Array<R>;
  declare function zipWith<S, T, U, R>(a1: S[], a2: T[], a3: U[], fn: (a1: S, a2: T, a3: U) => R): Array<R>;

  declare function flatten<S>(a: S[][]): S[];

  declare function any<T>(list: Array<T>, pred: (el: T)=>boolean): boolean;

  declare function each<T>(o: {[key:string]: T}, iteratee: (val: T, key: string)=>void): void;
  declare function each<T>(a: T[], iteratee: (val: T, key: string)=>void): void;

  declare function map<T, U>(a: T[], iteratee: (val: T, n?: number)=>U): U[];
  declare function map<K, T, U>(a: {[key:K]: T}, iteratee: (val: T, k?: K)=>U): U[];

  declare function object<T>(a: Array<[string, T]>): {[key:string]: T};
  declare function fromPairs<T>(a: Array<[string, T]>): {[key:string]: T};

  declare function every<T>(a: Array<T>, pred: (val: T)=>boolean): boolean;

  declare function initial<T>(a: Array<T>, n?: number): Array<T>;
  declare function rest<T>(a: Array<T>, index?: number): Array<T>;
  declare function last<T>(a: Array<T>): T;

  declare function sortBy<T>(a: T[], iteratee: (val: T)=>any): T[];

  declare function filter<T>(o: {[key:string]: T}, pred: (val: T, k: string)=>boolean): T[];

  declare function isNil<S>(obj: S): boolean;
  declare function isEmpty(o: any): boolean;

  declare function groupBy<T>(a: Array<T>, iteratee: (val: T, index: number)=>any): {[key:string]: T[]};
  declare function uniqBy<T, U>(a: Array<T>, f: (val: T)=>U): Array<T>;
  declare function uniqBy<T, U>(a: Array<{[key: string]: T}>, k: string): Array<{[key: string]: T}>;

  declare function min<T>(a: Array<T>|{[key:any]: T}): T;
  declare function max<T>(a: Array<T>|{[key:any]: T}): T;

  declare function values<T>(o: {[key: any]: T}): T[];

  // TODO: improve this
  declare function chain<S>(obj: S): any;

  declare function omit<T>(obj: {[key:string]: T}, vs: T | Array<T>) : {[key:string]: T};
  declare function omitBy<T>(obj: {[key:string]: T}, f: (x: string) => boolean): {[key:string]: T};
  declare function pick<T>(obj: {[key:string]: T}, vs: T | Array<T>) : {[key:string]: T};
  declare function pickBy<T>(obj: {[key:string]: T}, f: (x: string) => boolean): {[key:string]: T};
}
