import { Option } from 'react-bootstrap-typeahead/types/types';
export interface TypeaheadProps<T> {
    onChange: (item: T) => void;
    initialValue?: string;
    onSearch?: (term: string) => Promise<Array<{
        label: string;
    }> | null>;
    searchOnClick?: boolean;
    onInputChange?: (term: string) => void;
    options?: Option[];
}
declare const _default: <T extends object>(props: TypeaheadProps<T>) => JSX.Element;
export default _default;
