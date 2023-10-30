import * as React from 'react'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { resolveValue } from 'path-value'
import { useMeasure } from 'react-use'

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import { Alert, InputGroup } from 'react-bootstrap'
import ContentLoader from 'react-content-loader'
import { Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, DraggableStateSnapshot } from 'react-beautiful-dnd'
import { ItemOptions, Options, Option } from './global'

type InputType = 'text' | 'select' | 'switch' | 'number' | 'checkbox' | 'custom' | 'table' | 'textarea'

export interface ItemSchema<T> {
	version?: 1
	label: string | JSX.Element
	labelClassName?: string
	labelStyle?: any
	property: keyof T
	options?: () => Promise<any[] | null> | any[] | null
	required?: boolean
	type: InputType | ((item: T) => InputType)
	itemBasedOptions?: (item: T) => string[]
	extractor?: (x: any, item: T) => Option
	value?: (item: T) => string | JSX.Element
	units?: (item: T | null) => string
	key?: string
	editable?: boolean
	onClick?: (item: T, property: keyof T) => any
	CustomComponent?: (props: {
		onChange: (val: any) => void
		item: any
		onEditValueChange: (property: any, value: any) => void
	}) => JSX.Element | null
	renderComponent?: (onChange: (val: any) => void, item: T) => JSX.Element | undefined | null
	props?: TableProps<any>
}

export interface ItemEditSchema<T> {
	property: keyof T
	value: any
	key?: string
	item: T | null
}

export interface TableProps<T> {
	items: T[] | ((l: any) => T[])
	rootKey?: string
	onUpdate?: (id: number, object: Array<ItemEditSchema<T>>) => Promise<boolean>
	onCreate?: (id: number, object: Array<ItemEditSchema<T>>) => Promise<boolean>
	onRemove?: (item: T) => Promise<boolean>
	onClick?: (item: T) => any
	onDragEnd?: (parentId: number, id: number, position: number) => any
	clickType?: string
	parentId: number
	schema: Array<ItemSchema<T>>
	nestedSchema?: Array<ItemSchema<any>>
	loading?: boolean
	ListEmptyComponent?: JSX.Element
	onSort?: (id: number, position: number) => void
	rowClassName?: string
	cellClassName?: string
	tableClassName?: string
	nestedTableClassName?: string
	nestedCellClassName?: string
	customActions?: Array<(item: T) => JSX.Element>
	title?: string | ((item: T) => string)
}

export type TableCellProps = {
	children?: any
	snapshot: DraggableStateSnapshot
	Wrapper?: React.ElementType
	row?: boolean
	style?: any
	id?: string
	cellClassName?: string
}

const TableCell = ({ snapshot, children, Wrapper, row, id, cellClassName, ...props }: TableCellProps) => {
	const [ref, { width, height }] = useMeasure<any>()

	const [dimensionSnapshot, setDimensionSnapshot] = useState<{
		width: number
		height: number
	} | null>(null)

	useEffect(() => {
		if (!snapshot.isDragging) {
			setDimensionSnapshot({ width: width + 24, height: height + 24 })
		}
	}, [width])

	return (
		<td ref={ref} className={`${cellClassName || ''}`} style={snapshot?.isDragging ? dimensionSnapshot || {} : {}}>
			{children}
		</td>
	)
}

const TableLoader = <T extends object>(props: TableProps<T>) => {
	const propKey = props.rootKey || ''

	const [showModal, setShowModal] = useState<boolean>(false)
	const [editing, setEditing] = useState<Array<ItemEditSchema<T>> | null>(null)
	const [editingId, setEditingId] = useState<number | null>(null)
	const [saveError, setSaveError] = useState<string | null>(null)

	const [optionsMap, setOptionsMap] = useState<Map<keyof T, any[] | undefined | null> | null>(null)

	const [validated, setValidated] = useState<boolean>(false)
	const [saving, setSaving] = useState<boolean>(false)
	const [loadingOptions, setLoadingOptions] = useState<boolean>(false)

	const items = typeof props.items === 'function' ? props.items(editing) : props.items || []

	useEffect(() => {
		const item = items.find((i) => i['id'] === editingId)
		if (item)
			setEditing(
				props.schema.map((itemSchema: ItemSchema<T>) => {
					let value =
						editing?.find((e) => e.property === itemSchema?.property)?.value ||
						getOriginalValue(item, itemSchema)
					if (itemSchema.type === 'table') {
						value = getOriginalValue(item, itemSchema)
					}
					return { ...itemSchema, value, item }
				})
			)
	}, [items])

	const handleCloseModal = () => {
		setSaveError(null)
		setSaving(false)
		setShowModal(false)
	}

	const handleSave = async (event: any) => {
		if (!editing) return
		const form = event.currentTarget
		setSaveError(null)
		event.preventDefault()
		event.stopPropagation()
		setValidated(true)
		if (form.checkValidity()) {
			setSaving(true)
			try {
				const result = editingId
					? props.onUpdate && (await props.onUpdate(editingId, editing))
					: props.onCreate && (await props.onCreate(props.parentId, editing))
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

	const getOriginalValue = (parentItem: T | null, itemSchema: ItemSchema<T>) => {
		let value: any = ''
		if (parentItem && itemSchema.type === 'text' && itemSchema.extractor)
			value = itemSchema.extractor(resolveValue(parentItem, `${itemSchema.property as string}`)).value
		else if (parentItem && itemSchema.type === 'number')
			value = resolveValue(parentItem, `${itemSchema.property as string}`) || 0
		else if (parentItem) value = resolveValue(parentItem, `${itemSchema.property as string}`)
		return value
	}

	const handleEdit = async (item: T | null) => {
		await loadOptions()
		clearEditFields()
		setEditingId(item ? item['id'] : null)
		setEditing(
			props.schema.map((itemSchema: ItemSchema<T>) => ({
				...itemSchema,
				value: getOriginalValue(item, itemSchema),
				item,
			}))
		)
		setShowModal(true)
	}

	const handleRemove = async (item: T) => {
		if (!props.onRemove) return
		if (
			window.confirm(
				`Are you sure you want to remove ${
					(item as any).name || props.schema[0]?.value?.(item) || item[props.schema[0].property] || ''
				}?`
			)
		) {
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

	const renderOptions = (property: any, options?: string[]) => {
		if (loadingOptions) return <option>Loading...</option>
		if (!optionsMap) return <option>No Options Found</option>
		const _options = Array.isArray(options) ? options : optionsMap.get(property)
		const currentItem = (editing || []).find((y) => y.property === property)
		if (!currentItem) return <option>Failed to load value</option>
		if (!Array.isArray(_options)) return <option>No Options Found</option>
		return _options.map((option) => {
			const kvPair = props.schema.find((s) => s.property === property)?.extractor?.(option)
			return (
				<option key={`${property}-${kvPair?.key}-${kvPair?.value}`} value={`${kvPair?.key}`}>
					{kvPair?.value}
				</option>
			)
		})
	}

	const getEditingPropertyIndex = (property: any) => {
		return (editing || []).findIndex((x) => (x.key ? x.key === property : x.property === property))
	}

	const onEditValueChange = (property: any, value: any) => {
		const copy = [...(editing || [])]
		const editingIndex = getEditingPropertyIndex(property)
		if (editingIndex === -1) return
		copy[editingIndex].value = value
		props.schema.map((depSchemaItem) => {
			const parts = `${depSchemaItem.property as string}`.split('.')
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
		if (props.onDragEnd) props.onDragEnd(props.parentId, parseInt(event.draggableId), event.destination.index)
	}

	const chunkArray = (myArray: any, chunk_size: number) => {
		const arrayCopy = [...myArray]
		let results = []
		while (arrayCopy.length) {
			results.push(arrayCopy.splice(0, chunk_size))
		}
		return results
	}

	const renderLoader = (value: any, width: number = 275, height: number = 15) => (
		<ContentLoader viewBox={`0 0 ${width} ${height}`} foregroundColor={'#333'} backgroundColor={'#999'}>
			<rect x="0" y="0" rx="5" ry="5" width={width} height={height} />
		</ContentLoader>
	)

	const renderLoadingTable = () => (
		<>
			{[...new Array(10)]
				.map((x) => Math.max(Math.floor(Math.random() * 250), 125))
				.map((x, i) => (
					<tr
						className="bg-gradient-dark text-white"
						key={`row-data-loading-${JSON.stringify(i)}-${propKey}`}
					>
						{props.schema.map((i) => (
							<td key={`row-data-td-loading-${i.label}-${i.property as string}-${i.key}`}>
								<div style={{ width: 75, height: 10 }} className="mb-2">
									{renderLoader('', 50, 5)}
								</div>
							</td>
						))}
					</tr>
				))}
		</>
	)

	const renderUnits = (units: string) => {
		if (!units) return null
		return (
			<InputGroup.Append>
				<InputGroup.Text>{units}</InputGroup.Text>
			</InputGroup.Append>
		)
	}

	const renderField = (item: ItemSchema<T>) => {
		const editingField = editing?.find((x) => (x.key ? x.key === item.key : x.property === item.property))
		const currentField = editing?.reduce((p, c) => ({ ...p, [c.key || c.property]: c.value }), {}) as T
		if (!editingField) return null
		if (item.renderComponent && typeof item.renderComponent === 'function')
			return (
				<Form.Group as={Col} controlId="editLabel" key={`${item.label}-label`}>
					<Form.Label className="text-white">{item.label}</Form.Label>
					{item.renderComponent(
						(e: any) => onEditValueChange(item.key || item.property, e),
						editingField.value
					)}
				</Form.Group>
			)
		if (item.CustomComponent && typeof item.CustomComponent === 'function')
			return (
				<Form.Group as={Col} controlId="editLabel" key={`${item.label}-label`}>
					<Form.Label className="text-white">{item.label}</Form.Label>
					<item.CustomComponent
						onChange={(e: any) => onEditValueChange(item.key || item.property, e)}
						onEditValueChange={onEditValueChange}
						item={editingField.item}
					/>
				</Form.Group>
			)
		const type = typeof item.type === 'function' ? item.type?.(currentField) : item.type || 'text'
		switch (type) {
			case 'select':
				return (
					<Form.Group
						as={Col}
						controlId={`${item.property as string}`}
						key={`form-info-${String(item.key || item.property)}-${type}`}
					>
						<Form.Label className="text-white">{item.label}</Form.Label>
						<InputGroup>
							<Form.Control
								disabled={item.editable === false}
								as="select"
								required={item.required}
								value={`${item?.extractor?.(editingField.value)?.key}`}
								onChange={(e: any) => {
									const _options =
										(item.itemBasedOptions && item.itemBasedOptions?.(currentField)) ||
										optionsMap?.get(item.property)
									const option = _options?.find(
										(o) => `${item?.extractor?.(o)?.key}` === e.target.value
									)
									onEditValueChange(item.key || item.property, option)
								}}
							>
								<option />
								{renderOptions(
									item.property,
									item.itemBasedOptions ? item.itemBasedOptions?.(currentField) : undefined
								)}
							</Form.Control>
							{renderUnits(item?.units?.(editingField.item) || '')}
						</InputGroup>
						<Form.Control.Feedback type="invalid">This field is required.</Form.Control.Feedback>
					</Form.Group>
				)
			case 'text':
			case 'number':
			case 'textarea':
				return (
					<Form.Group
						as={Col}
						controlId={`${item.property as string}`}
						key={`form-info-${String(item.key || item.property)}-${type}`}
					>
						<Form.Label className="text-white">{item.label}</Form.Label>
						<InputGroup>
							<Form.Control
								required={item.required}
								as={type === 'textarea' ? 'textarea' : undefined}
								type={type === 'textarea' ? 'text' : type}
								rows={type === 'textarea' ? 3 : undefined}
								value={
									editingField.value !== null
										? item.type === 'number'
											? editingField.value
											: `${editingField.value}`
										: ''
								}
								onChange={(e: any) => onEditValueChange(item.key || item.property, e.target.value)}
								disabled={item.editable === false}
							/>
							{renderUnits(item?.units?.(editingField.item) || '')}
						</InputGroup>
						<Form.Control.Feedback type="invalid">This field is required.</Form.Control.Feedback>
					</Form.Group>
				)

			case 'switch':
			case 'checkbox':
				return (
					<Form.Group
						as={Col}
						controlId={`${item.property as string}`}
						key={`form-info-${String(item.key || item.property)}-${type}`}
					>
						<Form.Label />
						<Form.Check
							className="form-control-lg text-white"
							required={item.required}
							type={type}
							label={item.label}
							checked={editingField.value}
							onChange={(e: any) => onEditValueChange(item.key || item.property, e.target.checked)}
							disabled={item.editable === false}
						/>
						<Form.Control.Feedback type="invalid">This field is required.</Form.Control.Feedback>
					</Form.Group>
				)
			case 'table':
				return (
					<Form.Group
						as={Col}
						controlId={`${item.property as string}`}
						key={`form-info-${String(item.key || item.property)}-${type}`}
					>
						<Form.Label className="text-white">{item.label}</Form.Label>
						{item.props && (
							<TableLoader
								{...item.props}
								title={
									typeof item.props.title === 'function'
										? items.find((i: any) => i.id === editingId) &&
										  item.props.title(items.find((i: any) => i.id === editingId) as T)
										: item.props.title
								}
								items={editingField?.value}
								onCreate={async (id: number, object: Array<ItemEditSchema<any>>) => {
									if (editing) {
										const currentValue = editingField?.value
										const addedValue = { id: Math.random() }
										object.forEach((o) => {
											addedValue[o.property] = o.value
										})
										onEditValueChange(
											item.key || item.property,
											currentValue?.length ? [...currentValue, addedValue] : [addedValue]
										)
									}
									return true
								}}
								onUpdate={async (id: number, object: Array<ItemEditSchema<any>>) => {
									if (editing) {
										const subItemList = editingField?.value
										const updatedValue: any = {
											...subItemList?.find?.((x: any) => x.id === id),
										}
										object.forEach((o) => {
											updatedValue[o.property] = o.value
										})
										onEditValueChange(
											item.key || item.property,
											subItemList?.length
												? [...subItemList?.filter?.((x: any) => x.id !== id), updatedValue]
												: [updatedValue]
										)
									}
									return true
								}}
							/>
						)}
					</Form.Group>
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
						<Modal.Title>
							{editingId ? 'Edit' : 'Add'}{' '}
							{typeof props.title === 'function'
								? items.find((i: any) => i.id === editingId) &&
								  props.title(items.find((i: any) => i.id === editingId) as T)
								: props.title}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body className={'bg-dark'}>
						{saveError && <Alert variant="danger">{saveError}</Alert>}
						{chunkArray(
							props.schema.filter((s) => s.type !== 'table'),
							2
						).map((x, i) => {
							return <Form.Row key={`formRow-${i}`}>{x.map(renderField)}</Form.Row>
						})}
						{props.schema
							.filter((s) => s.type === 'table')
							.map((t, i) => (
								<Form.Row key={`formRow-table-${i}`}>{renderField(t)}</Form.Row>
							))}
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

	const renderItemPropContents = (i: ItemSchema<T>, item: T) => {
		return (
			<>
				{typeof i.value === 'function'
					? i.value(item)
					: i?.extractor
					? i.extractor?.(resolveValue(item, `${i.property as string}`), item)?.value
					: booleanParser(resolveValue(item, `${i.property as string}`))}{' '}
				{i.units ? ' ' + i.units(item) : ''}
			</>
		)
	}

	const renderItemProp = (i: ItemSchema<T>, item: T) => {
		if (i.onClick) {
			return (
				<Button variant="link" className="text-link" onClick={() => i?.onClick?.(item, i.property)}>
					{renderItemPropContents(i, item)}
				</Button>
			)
		}
		return renderItemPropContents(i, item)
	}

	const renderRowContents = (
		item: T,
		snapshot: DraggableStateSnapshot,
		schema: Array<ItemSchema<T>>,
		cellClassName?: string
	) => {
		const rows = []
		if (props?.onClick && props.clickType === 'link') {
			rows.push(
				schema.map((i) => (
					<td key={`row-prop-data-${propKey}-${String(i.key || i.property)}-link`}>
						<Link className="text-white" target="_blank" to={props?.onClick && props?.onClick(item)}>
							{renderItemProp(i, item)}
						</Link>
					</td>
				))
			)
		} else if (props?.onClick) {
			rows.push(
				schema.map((i) => (
					<td key={`row-prop-data-${propKey}-${String(i.key || i.property)}-click`}>
						<Button variant="link" className="text-link" onClick={() => handleView(item)}>
							{renderItemProp(i, item)}
						</Button>
					</td>
				))
			)
		} else
			rows.push(
				schema.map((i) => (
					<TableCell
						cellClassName={cellClassName}
						snapshot={snapshot}
						id={String(i.key || i.property)}
						key={`row-prop-data-${propKey}-${String(i.key || i.property)}`}
					>
						{renderItemProp(i, item)}
					</TableCell>
				))
			)
		if (Array.isArray(props.customActions))
			rows.push(
				...props.customActions.map((cA) => (
					<TableCell snapshot={snapshot} key={`row-custom-actions-${propKey}-update-${JSON.stringify(item)}`}>
						{cA(item)}
					</TableCell>
				))
			)
		if (props.onUpdate) {
			rows.push(
				<TableCell snapshot={snapshot} key={`row-prop-data-${propKey}-update-${JSON.stringify(item)}`}>
					<Button variant="light" className="float-right" onClick={() => handleEdit(item)}>
						<FontAwesomeIcon icon="edit" />
					</Button>
				</TableCell>
			)
		}
		return (
			<>
				{...rows}
				{props.onRemove && (
					<TableCell snapshot={snapshot}>
						<Button variant="light" className="float-right" onClick={() => handleRemove(item)}>
							<FontAwesomeIcon icon="trash" />
						</Button>
					</TableCell>
				)}
			</>
		)
	}

	const renderRow = (item: any, index: number, schema: Array<ItemSchema<T>>, cellClassName?: string) => (
		<Draggable
			key={`draggable-row-${item.id || item.title || item.dateCreated || JSON.stringify(item)}-${propKey}`}
			draggableId={`${item.id}`}
			index={index}
			isDragDisabled={!props.onDragEnd}
		>
			{(provided: any, snapshot) => (
				<React.Fragment key={`row-data-${index}-${item.id}-${propKey}`}>
					<tr
						className={`bg-gradient-dark text-white ${props.rowClassName || ''}`}
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
						style={provided.draggableProps.style}
					>
						{renderRowContents(item, snapshot, schema, cellClassName)}
					</tr>
					{Array.isArray((item as any).children) &&
						!!(item as any).children?.length &&
						Array.isArray(props.nestedSchema) && (
							<tr className="bg-mars-dark">
								<td className="p-0" colSpan={props.schema?.length}>
									{renderTable(
										(item as any).children,
										props.nestedSchema as Array<ItemSchema<T>>,
										props.nestedTableClassName,
										props.nestedCellClassName
									)}
								</td>
							</tr>
						)}
					{provided.placeholder}
				</React.Fragment>
			)}
		</Draggable>
	)

	const renderHeader = (schema: Array<ItemSchema<T>>) => (
		<tr className="bg-dark text-white">
			{schema.map((i) => (
				<th
					style={i.labelStyle || {}}
					className={`${i.labelClassName || ''}`}
					key={`row-header-${(i.property || i.label) as string}-${propKey}`}
				>
					{i.label}
				</th>
			))}
			{props.customActions?.map((_, i) => (
				<th key={`action-header-${i}`} />
			))}
			{props.onRemove && (!props.onCreate || !!props.onUpdate) && <th />}
			{props.onCreate && (
				<th scope="col">
					<Button variant="light" className="float-right" onClick={handleShowModal}>
						<FontAwesomeIcon icon="plus" className="small" />
					</Button>
				</th>
			)}
		</tr>
	)

	const renderTable = (
		itemsToRender: T[],
		schema: Array<ItemSchema<T>>,
		tableClassName?: string,
		cellClassName?: string
	) => (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Droppable droppableId="droppable" isDropDisabled={!props.onDragEnd}>
				{(provided, snapshot) => (
					<table
						ref={provided.innerRef}
						className={`table table-hover table-dark ${tableClassName}`}
						key={`${schema?.[0]?.label}-table`}
					>
						<thead>{renderHeader(schema)}</thead>
						<tbody>
							{props.loading
								? renderLoadingTable()
								: itemsToRender.map((item, index) => renderRow(item, index, schema, cellClassName))}
							{provided.placeholder}
						</tbody>
					</table>
				)}
			</Droppable>
		</DragDropContext>
	)

	return (
		<>
			{renderTable(items, props.schema, props.tableClassName, props.cellClassName)}
			{props.loading || items?.length ? null : props.ListEmptyComponent}
			{renderCreateModal()}
		</>
	)
}

export default TableLoader
