import React, { Component, useEffect, useState } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import { Option } from 'react-bootstrap-typeahead/types/types'
import 'react-bootstrap-typeahead/css/Typeahead.css';
import Typeahead from 'react-bootstrap-typeahead/types/core/Typeahead';
export interface TypeaheadProps<T> extends Typeahead {
    onChange: (item: T[]) => void,
    initialValue?: string,
    onSearch?: (term: string) => Promise<Array<T | { label: string }>>,
    searchOnClick?: boolean,
    onInputChange?: (term: string) => void,
    options?: Option[],
    loading?: boolean,
    multiple?: boolean,
    selected?: Option[],
    id: string,
    placeholder?: string,
    labelKey?: keyof T,
    valueKey?: keyof T,
    allowNew?: boolean,
    disabled?: boolean,
}

export default <T extends object>(props: TypeaheadProps<T>) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [options, setOptions] = useState<Option[]>([]);

    const search = async (query: string) => {
        setLoading(true)
        const result = await props?.onSearch?.(query)
        if (Array.isArray(result)) {
            setOptions(result)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (props.searchOnClick) {
            search('')
        }
    }, [])

    const onChange = (selectedOptions: T[]) => {
        props.onChange(selectedOptions)
    }

    const onInputChange = (text: string) => {
        if (!props.onInputChange) return
        props.onInputChange(text)
    }

    return (
        <AsyncTypeahead
            {...props}
            isLoading={props.loading || loading}
            options={props.options || options}
            onChange={onChange}
            promptText="Type to search..."
            minLength={0}
            defaultInputValue={props.initialValue}
            onSearch={search}
        />
    )
}
