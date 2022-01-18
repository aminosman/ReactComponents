import { Option } from 'react-bootstrap-typeahead/types/types';
export interface TypeaheadProps<T> {
    onChange: (item: T[]) => void;
    initialValue?: string;
    onSearch?: (term: string) => Promise<Array<{
        label: string;
    }>>;
    searchOnClick?: boolean;
    onInputChange?: (term: string) => void;
    options?: Option[];
    loading?: boolean;
    multiple?: boolean;
    selected: Option[];
}
declare const _default: <T extends object>(props: TypeaheadProps<T>) => JSX.Element;
export default _default;
