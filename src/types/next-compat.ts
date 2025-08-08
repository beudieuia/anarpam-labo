// src/types/next-compat.ts
export type MaybePromise<T> = T | Promise<T>;

export type CompatProps<P = any, Q = any> = {
  params?: MaybePromise<P>;
  searchParams?: MaybePromise<Q>;
};

export async function unwrap<T>(x: MaybePromise<T> | undefined): Promise<T | undefined> {
  if (x === undefined) return undefined;
  return await Promise.resolve(x);
}
