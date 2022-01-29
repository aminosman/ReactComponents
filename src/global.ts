export type Option = { key: number | string; value: string };

export type Options<T> = [keyof T, Option[] | undefined | null];

export type ItemOptions<T> = Map<keyof T, Option[] | undefined | null>;
