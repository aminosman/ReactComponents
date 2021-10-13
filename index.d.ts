import { DraggableStateSnapshot } from "react-beautiful-dnd";

export interface ItemSchema<T> {
  label: string;
  property: keyof T;
  options?: (term?: string) => Promise<any[] | null> | any[] | null;
  required?: boolean;
  type:
    | "text"
    | "select"
    | "switch"
    | "number"
    | "checkbox"
    | "custom"
    | "table";
  extractor?: (x: any) => Option;
  value?: (item: T) => string | JSX.Element;
  key?: string;
  CustomComponent?: (
    onChange: (val: any) => void,
    item: T
  ) => JSX.Element | undefined | null;
  props?: Props<any>;
  dependency?: Array<keyof T>;
}

export interface ItemEditSchema<T> {
  property: keyof T;
  value: any;
  key?: string;
}

export interface Props<T> {
  items: T[] | ((l: any) => T[]);
  key?: string;
  onUpdate?: (id: number, object: Array<ItemEditSchema<T>>) => Promise<boolean>;
  onCreate?: (id: number, object: Array<ItemEditSchema<T>>) => Promise<boolean>;
  onRemove?: (item: T) => Promise<boolean>;
  onClick?: (item: T) => any;
  onDragEnd?: (parentId: number, id: number, position: number) => any;
  clickType?: string;
  parentId: number;
  schema: Array<ItemSchema<T>>;
  loading?: boolean;
  ListEmptyComponent?: JSX.Element;
  onSort?: (id: number, position: number) => void;
}

export type TableCellProps = {
  children?: any;
  snapshot: DraggableStateSnapshot;
  Wrapper?: React.ElementType;
  row?: boolean;
  style?: any;
  id?: string;
};

export type Option = { key: number | string; value: string };

export type Options<T> = [keyof T, Option[] | undefined | null];

export type ItemOptions<T> = Map<keyof T, Option[] | undefined | null>;