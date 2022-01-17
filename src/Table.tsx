import * as React from 'react'
import { useEffect, useState, useLayoutEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { tokenizePath, resolveValue } from 'path-value'
import { useMeasure } from 'react-use'

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import { Alert, Row } from 'react-bootstrap'
import ContentLoader from 'react-content-loader'
import { Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { ItemEditSchema, ItemOptions, Options, Option } from './global'

export interface ItemSchema<T> {
    label: string | JSX.Element;
    labelClassName?: string;
    labelStyle?: any;
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
    props?: TableProps<any>;
    dependency?: Array<keyof T>;
}

export interface TableProps<T> {
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
    rowClassName?: string;
    cellClassName?: string;
    tableClassName?: string;
}

export type TableCellProps = {
    children?: any;
    snapshot: DraggableStateSnapshot;
    Wrapper?: React.ElementType;
    row?: boolean;
    style?: any;
    id?: string;
    cellClassName?: string;
};

const TableCell = ({ snapshot, children, Wrapper, row, id, cellClassName, ...props }: TableCellProps) => {
    const [ref, { width, height }] = useMeasure<any>()

    const [dimentionSnapshot, setDimentionSnapshot] = useState<{ width: number, height: number } | null>(null)

    useEffect(() => {
        if (!snapshot.isDragging) {
            setDimentionSnapshot({ width: width + 24, height: height + 24 })
        }
    }, [width])

    return <td ref={ref} className={`${cellClassName || 'bg-dark'}`} style={snapshot?.isDragging ? dimentionSnapshot || {} : {}}>{children}</td>
}

const TableLoader = <T extends object>(props: TableProps<T>) => {

    const [showModal, setShowModal] = useState<boolean>(false)
    const [editing, setEditing] = useState<Array<ItemEditSchema<T>> | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [saveError, setSaveError] = useState<string | null>(null)

    const [optionsMap, setOptionsMap] = useState<Map<keyof T, any[] | undefined | null> | null>(null)

    const [validated, setValidated] = useState<boolean>(false)
    const [saving, setSaving] = useState<boolean>(false)
    const [draggedRowColumnWidths, setDraggedRowColumnWidths] = useState<number[]>([])
    const [loadingOptions, setLoadingOptions] = useState<boolean>(false)

    const items = (typeof props.items === 'function' ? props.items(editing) : props.items || [])

    useEffect(() => {
        const item = items.find(i => i['id'] === editingId)
        if (item)
            setEditing(props.schema.map((itemSchema: ItemSchema<T>) => {
                let value = editing?.find(e => e.property === itemSchema?.property)?.value || getOrignalVlaue(item, itemSchema)
                if (itemSchema.type === 'table') {
                    value = getOrignalVlaue(item, itemSchema)
                }
                return { ...itemSchema, value }
            }))
    }, [items])

    const handleCloseModal = () => {
        setSaveError(null)
        setSaving(false)
        setShowModal(false)
    }

    const handleSave = async (event: any) => {
        if (!editing) return
        const form = event.currentTarget;
        setSaveError(null)
        event.preventDefault()
        event.stopPropagation()
        setValidated(true)
        if (form.checkValidity()) {
            setSaving(true)
            try {
                const result = editingId ?
                    props.onUpdate && await props.onUpdate(editingId, editing) :
                    props.onCreate && await props.onCreate(props.parentId, editing)
                if (result) {
                    clearEditFields()
                    handleCloseModal()
                }
            } catch (ex) {
                setSaveError(ex.message || 'There was an error saving your changes. Please reload and try again.')
            }
        }
        setSaving(false)
    }

    const handleShowModal = async () => {
        handleEdit(null)
    }

    const getOrignalVlaue = (parentItem: T | null, itemSchema: ItemSchema<T>) => {
        let value: any = ''
        if (parentItem && itemSchema.type === 'text' && itemSchema.extractor) value = itemSchema.extractor(resolveValue(parentItem, `${itemSchema.property}`)).value
        else if (parentItem && itemSchema.type === 'number') value = resolveValue(parentItem, `${itemSchema.property}`) || 0
        else if (parentItem) value = resolveValue(parentItem, `${itemSchema.property}`)
        return value
    }

    const handleEdit = async (item: T | null) => {
        await loadOptions()
        clearEditFields()
        setEditingId(item ? item['id'] : null)
        setEditing(props.schema.map((itemSchema: ItemSchema<T>) => ({ ...itemSchema, value: getOrignalVlaue(item, itemSchema) })))
        setShowModal(true)
    }

    const handleRemove = async (item: T) => {
        if (!props.onRemove) return
        if (window.confirm(`Are you sure you want to remove ${item[props.schema[0].property]}?`)) {
            props.onRemove(item)
        }
    }

    const loadOption: (x: ItemSchema<T>) => Promise<Options<T>> = async (x: ItemSchema<T>) => {
        if (typeof x.options === 'function') {
            const o = await x.options()
            return [x.property, o]
        }
        return [x.property, x.options]
    }

    const loadOptions = async () => {
        setLoadingOptions(true)
        if (!optionsMap) {
            const x: ItemOptions<T> = new Map(await Promise.all(props.schema.map(loadOption)))
            setOptionsMap(x)
        }
        setLoadingOptions(false)
    }

    const clearEditFields = () => {
        setValidated(false)
        setSaving(false)
        setEditing(null)
    }

    const renderOptions = (property: any) => {
        if (loadingOptions) return <option>Loading...</option>
        if (!optionsMap) return <option>No Options Found</option>
        const options = optionsMap.get(property)
        const currentItem = (editing || []).find(y => y.property === property)
        if (!currentItem) return <option>Failed to load value</option>
        if (!Array.isArray(options)) return <option>No Options Found</option>
        return (
            options.map((option) => {
                const kvPair = props.schema.find(s => s.property === property)?.extractor?.(option)
                return (<option key={`${property}-${kvPair?.key}-${kvPair?.value}`} value={`${kvPair?.key}`}>
                    {kvPair?.value}
                </option>)
            })
        )
    }

    const getEditingPropertyIndex = (property: any) => {
        return (editing || []).findIndex(x => x.key ? x.key === property : x.property === property)
    }

    const onEditValueChange = (property: any, value: any) => {
        const copy = ([...(editing || [])])
        const editingIndex = getEditingPropertyIndex(property)
        if (editingIndex === -1) return
        copy[editingIndex].value = value
        props.schema.map(depSchemaItem => {
            const parts = `${depSchemaItem.property}`.split('.')
            if (parts?.length > 1 && parts[0] === property) {
                const index = getEditingPropertyIndex(depSchemaItem.property)
                copy[index].value = resolveValue(value, parts.slice(1).join('.'))
            }
        })
        setEditing(copy)
    }

    const handleView = (item: T) => {
        if (props?.onClick) props?.onClick(item)
        return false
    }

    const handleDragEnd = (event: any) => {
        if (props.onDragEnd)
            props.onDragEnd(props.parentId, parseInt(event.draggableId), event.destination.index)
    }

    const chunkArray = (myArray: any, chunk_size: number) => {
        const arrayCopy = [...myArray]
        let results = [];
        while (arrayCopy.length) {
            results.push(arrayCopy.splice(0, chunk_size))
        }
        return results;
    }

    const renderLoader = (value: any, width: number = 275, height: number = 15) => (
        <ContentLoader
            viewBox={`0 0 ${width} ${height}`}
            foregroundColor={'#333'}
            backgroundColor={'#999'}
        >
            <rect x="0" y="0" rx="5" ry="5" width={width} height={height} />
        </ContentLoader>
    )

    const renderLoadingTable = () => (
        <>
            {[...new Array(10)].map(x => Math.max(Math.floor(Math.random() * 250), 125)).map((x, i) => (
                <tr className="bg-gradient-dark text-white" key={`row-data-loading-${JSON.stringify(i)}`}>
                    {props.schema.map(i => (
                        <td key={`row-data-td-loading-${JSON.stringify(i)}`}><div style={{ width: 75, height: 10 }} className="mb-2">{renderLoader('', 50, 5)}</div></td>
                    ))}
                </tr>
            ))}
        </>
    )

    const renderField = (item: ItemSchema<T>, i: number) => {
        const editingField = editing?.find(x => x.key ? x.key === item.key : x.property === item.property)
        if (!editingField) return null
        if (item.CustomComponent && typeof item.CustomComponent === 'function')
            return (
                <Form.Group as={Col} controlId="editLabel" key={`${item.label}-label`}>
                    <Form.Label className="text-white">
                        {item.label}
                    </Form.Label>
                    {item.CustomComponent((e: any) => onEditValueChange(item.key || item.property, e), editingField.value)}
                </Form.Group>
            )
        switch (item.type) {
            case 'select':
                return (
                    <Form.Group as={Col} controlId={`${item.property}`} key={`form-infor-${String(item.key || item.property)}`}>
                        <Form.Label className="text-white">{item.label}</Form.Label>
                        <Form.Control
                            as="select"
                            required={item.required}
                            value={`${item?.extractor?.(editingField.value)?.key}`}
                            onChange={(e: any) => {
                                const options = optionsMap?.get(item.property)
                                const option = options?.find(o => `${item?.extractor?.(o)?.key}` === e.target.value)
                                onEditValueChange(item.key || item.property, option)
                            }}
                        >
                            <option />
                            {renderOptions(item.property)}
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                            This feild is required.
                        </Form.Control.Feedback>
                    </Form.Group>
                )
            case 'text':
            case 'number':
                return (
                    <Form.Group as={Col} controlId={`${item.property}`} key={`form-infor-${String(item.key || item.property)}`}>
                        <Form.Label className="text-white">{item.label}</Form.Label>
                        <Form.Control
                            required={item.required}
                            type={item.type}
                            value={editingField.value !== null ? item.type === 'number' ? editingField.value
                                : `${editingField.value}` : ''}
                            onChange={(e: any) => onEditValueChange(item.key || item.property, e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            This feild is required.
                        </Form.Control.Feedback>
                    </Form.Group >
                )

            case 'switch':
            case 'checkbox':
                return (
                    <Form.Group as={Col} controlId={`${item.property}`} key={`form-infor-${String(item.key || item.property)}`}>
                        <Form.Label />
                        <Form.Check
                            className="form-control-lg text-white"
                            required={item.required}
                            type={item.type}
                            label={item.label}
                            checked={editingField.value}
                            onChange={(e: any) => onEditValueChange(item.key || item.property, e.target.checked)}
                        />
                        <Form.Control.Feedback type="invalid">
                            This feild is required.
                        </Form.Control.Feedback>
                    </Form.Group >
                )
            case 'table':
                return (
                    <Form.Group as={Col} controlId={`${item.property}`} key={`form-infor-${String(item.key || item.property)}`}>
                        <Form.Label className="text-white">{item.label}</Form.Label>
                        {item.props && <TableLoader
                            {...item.props}
                            items={editingField?.value}
                            onCreate={async (id: number, object: Array<ItemEditSchema<any>>) => {
                                if (editing) {
                                    const currentValue = editingField?.value
                                    const addedValue = { id: Math.random() }
                                    object.forEach(o => {
                                        addedValue[o.property] = o.value
                                    })
                                    onEditValueChange(item.key || item.property, currentValue?.length ? [...currentValue, addedValue] : [addedValue])
                                }
                                return true
                            }}
                            onUpdate={async (id: number, object: Array<ItemEditSchema<any>>) => {
                                if (editing) {
                                    const subItemList = editingField?.value
                                    const updatedValue: any = { ...subItemList?.find?.((x: any) => x.id === id) }
                                    object.forEach(o => {
                                        updatedValue[o.property] = o.value
                                    })
                                    onEditValueChange(item.key || item.property, subItemList?.length ? [...subItemList?.filter?.((x: any) => x.id !== id), updatedValue] : [updatedValue])
                                }
                                return true
                            }}
                        />}
                    </Form.Group >
                )
        }
        return null
    }

    const renderCreateModal = () => {
        return (
            <Modal
                size="lg"
                show={showModal}
                onHide={handleCloseModal}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Form noValidate validated={validated} onSubmit={handleSave}>
                    <Modal.Header closeButton className={'bg-dark text-white'}>
                        <Modal.Title>{editingId ? 'Edit' : 'Add'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className={'bg-dark'}>
                        {saveError && <Alert variant="danger">{saveError}</Alert>}
                        {chunkArray(props.schema, 2).map((x, i) => {
                            return (
                                <Form.Row key={`formRow-${i}`}>
                                    {x.map(renderField)}
                                </Form.Row>
                            )
                        })}
                    </Modal.Body>
                    <Modal.Footer className={'bg-dark'}>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Close
                        </Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        )
    }

    const booleanParser = (value: any) => {
        if (value === true) return 'Yes'
        if (value === false) return 'No'
        return value
    }

    const renderItemProp = (i: ItemSchema<T>, item: T) => {
        return typeof i.value === 'function' ? i.value(item) : i?.extractor ? i.extractor?.(resolveValue(item, `${i.property}`))?.value : booleanParser(resolveValue(item, `${i.property}`))
    }

    const renderRowContents = (item: T, snapshot: DraggableStateSnapshot) => {
        const rows = []
        if (props?.onClick && props.clickType === 'link') {
            rows.push(props.schema.map(i => <td key={`row-prop-data-${String(i.key || i.property)}-link`}>
                <Link className="text-white" target="_blank" to={props?.onClick && props?.onClick(item)}>{renderItemProp(i, item)}</Link>
            </td>))
        } else if (props?.onClick) {
            rows.push(props.schema.map(i => <td key={`row-prop-data-${String(i.key || i.property)}-click`}>
                <Button variant="link" className="text-white" onClick={() => handleView(item)}>{renderItemProp(i, item)}</Button>
            </td>))
        } else {
            rows.push(props.schema.map(i => <TableCell cellClassName={props.cellClassName} snapshot={snapshot} id={String(i.key || i.property)} key={`row-prop-data-${String(i.key || i.property)}`}>{renderItemProp(i, item)}</TableCell>))
        }
        if (props.onUpdate) {
            rows.push(<TableCell snapshot={snapshot} key={`row-prop-data-update-${JSON.stringify(item)}`}>
                <Button variant="light" className="float-right" onClick={() => handleEdit(item)}>
                    <FontAwesomeIcon icon="edit" />
                </Button>
            </TableCell>)
        }
        return (
            <>
                {...rows}
                {props.onRemove && <TableCell snapshot={snapshot}>
                    <Button variant="light" className="float-right" onClick={() => handleRemove(item)}>
                        <FontAwesomeIcon icon="trash" />
                    </Button>
                </TableCell>}
            </>
        )
    }

    const renderRow = (item: any, index: number) => (
        <Draggable key={item.id} draggableId={`${item.id}`} index={index} isDragDisabled={!props.onDragEnd}>
            {(provided: any, snapshot) => (
                <>
                    <tr
                        className={`bg-gradient-dark text-white ${props.rowClassName || ''}`}
                        key={`row-data-${index}-${item.id}-${props.key}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={provided.draggableProps.style}
                    >
                        {renderRowContents(item, snapshot)}
                    </tr>
                    {provided.placeholder}
                </>
            )}
        </Draggable>
    )

    const renderHeader = () => (
        <tr className="bg-dark text-white">
            {props.schema.map(i => <th style={i.labelStyle || {}} className={`${i.labelClassName || ''}`} key={`row-header-${i.property || i.label}-${props.key}`}>{i.label}</th>)}
            {props.onRemove && <th />}
            {props.onCreate && <th scope="col">
                <Button variant="light" className="float-right" onClick={handleShowModal}>
                    <FontAwesomeIcon icon="plus" className="small" />
                </Button>
            </th>}
        </tr>
    )

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="droppable" isDropDisabled={!props.onDragEnd}>
                {(provided, snapshot) => (
                    <table
                        ref={provided.innerRef}
                        className={`table table-hover table-dark ${props.tableClassName}`}
                    >
                        <thead>
                            {renderHeader()}
                        </thead>
                        <tbody>
                            {props.loading ? renderLoadingTable() : items.map(renderRow)}
                            {provided.placeholder}
                        </tbody>
                    </table>)}
            </Droppable>
            {props.loading || items?.length ? null : props.ListEmptyComponent}
            {renderCreateModal()}
        </DragDropContext>
    )
}

export default TableLoader