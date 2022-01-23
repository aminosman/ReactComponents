import { Option } from 'react-bootstrap-typeahead/types/types';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import Typeahead from 'react-bootstrap-typeahead/types/core/Typeahead';
export interface TypeaheadProps<T> extends Typeahead {
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
    id: string | number;
}
declare const _default: <T extends object>(props: TypeaheadProps<T>) => JSX.Element;
export default _default;
