import React, { Component, useEffect, useState } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import { Option } from 'react-bootstrap-typeahead/types/types'
import 'react-bootstrap-typeahead/css/Typeahead.css';
export interface TypeaheadProps<T> {
    onChange: (item: T[]) => void,
    initialValue?: string,
    onSearch?: (term: string) => Promise<Array<{ label: string }>>
    searchOnClick?: boolean,
    onInputChange?: (term: string) => void,
    options?: Option[],
    loading?: boolean,
    multiple?: boolean,
    selected: Option[],
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

    const onChange = (selected: T[]) => {
        props.onChange(selected)
    }

    const onInputChange = (text: string) => {
        if (!props.onInputChange) return
        props.onInputChange(text)
    }

    return (
        <AsyncTypeahead
            multiple={props.multiple}
            isLoading={props.loading || loading}
            options={props.options || options}
            onChange={onChange}
            promptText="Type to search..."
            minLength={0}
            defaultInputValue={props.initialValue}
            onSearch={search}
            onInputChange={onInputChange}
            selected={props.selected}
        />
    )
}
