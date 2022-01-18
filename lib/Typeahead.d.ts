/// <reference types="react" />
export interface TypeaheadProps<T> {
    onChange: (item: T) => void;
    initialValue?: string;
    onSearch: (term: string) => Promise<Array<{
        label: string;
    }>>;
    searchOnClick?: boolean;
    onInputChange?: (term: string) => void;
}
declare const _default: <T extends object>(props: TypeaheadProps<T>) => JSX.Element;
export default _default;
