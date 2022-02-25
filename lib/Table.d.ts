import * as React from 'react';
import { DraggableStateSnapshot } from 'react-beautiful-dnd';
import { Option } from './global';
export interface ItemSchema<T> {
    label: string | JSX.Element;
    labelClassName?: string;
    labelStyle?: any;
    property: keyof T;
    options?: (term?: string) => Promise<any[] | null> | any[] | null;
    required?: boolean;
    type: "text" | "select" | "switch" | "number" | "checkbox" | "custom" | "table";
    extractor?: (x: any) => Option;
    value?: (item: T) => string | JSX.Element;
    key?: string;
    CustomComponent?: (onChange: (val: any) => void, item: T) => JSX.Element | undefined | null;
    props?: TableProps<any>;
    dependency?: Array<keyof T>;
}
export interface ItemEditSchema<T> {
    property: keyof T;
    value: any;
    key?: string;
}
export interface TableProps<T> {
    items: T[] | ((l: any) => T[]);
    rootKey?: string;
    onUpdate?: (id: number, object: Array<ItemEditSchema<T>>) => Promise<boolean>;
    onCreate?: (id: number, object: Array<ItemEditSchema<T>>) => Promise<boolean>;
    onRemove?: (item: T) => Promise<boolean>;
    onClick?: (item: T) => any;
    onDragEnd?: (parentId: number, id: number, position: number) => any;
    clickType?: string;
    parentId: number;
    schema: Array<ItemSchema<T>>;
    nestedSchema?: Array<ItemSchema<any>>;
    loading?: boolean;
    ListEmptyComponent?: JSX.Element;
    onSort?: (id: number, position: number) => void;
    rowClassName?: string;
    cellClassName?: string;
    tableClassName?: string;
    nestedTableClassName?: string;
}
export declare type TableCellProps = {
    children?: any;
    snapshot: DraggableStateSnapshot;
    Wrapper?: React.ElementType;
    row?: boolean;
    style?: any;
    id?: string;
    cellClassName?: string;
};
declare const TableLoader: <T extends object>(props: TableProps<T>) => JSX.Element;
export default TableLoader;
