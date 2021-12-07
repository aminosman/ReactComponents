export interface ItemEditSchema<T> {
    property: keyof T;
    value: any;
    key?: string;
}
export declare type Option = {
    key: number | string;
    value: string;
};
export declare type Options<T> = [keyof T, Option[] | undefined | null];
export declare type ItemOptions<T> = Map<keyof T, Option[] | undefined | null>;
