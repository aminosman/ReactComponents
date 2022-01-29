import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Col, Nav, Row, Tab } from 'react-bootstrap';
import ContentLoader from 'react-content-loader';

export interface NavItem {
    label: string, id: string, tab?: JSX.Element, permission?: () => boolean | undefined, content: any
}

export interface Props {
    defaultActiveKey: string,
    nav: NavItem[],
    defaultPinnedTabs?: string[],
    title?: string
    loading?: boolean,
    navLinkContainerProps?: any
    navContentContainerProps?: any
}

export default function TableLayout({ defaultActiveKey, nav, defaultPinnedTabs, title, loading, navLinkContainerProps, navContentContainerProps }: Props) {
    const [pinnedTabs, setPinnedTabs] = useState<boolean[]>(defaultPinnedTabs ? nav.map(x => defaultPinnedTabs?.includes(x.id)) : []);
    const [showAll, setShowAll] = useState<boolean>();
    const [currentTab, setCurrentTab] = useState<string>(defaultActiveKey);

    const handlePinToggle = (index: number) => {
        const copy = [...pinnedTabs]
        copy[index] = !copy[index]
        setPinnedTabs(copy)
    }

    const handlePinToggleAll = () => {
        if (pinnedTabs.length === Object.keys(nav).length && pinnedTabs.reduce((p, c) => p && c, true)) {
            setPinnedTabs([])
        } else setPinnedTabs(Object.keys(nav).map(x => true))
    }

    const renderPin = (tabIndex: number) => (
        <FontAwesomeIcon
            icon="thumbtack"
            onClick={() => handlePinToggle(tabIndex)}
            className={pinnedTabs[tabIndex] ? 'text-warning' : 'text-light'}
            style={!pinnedTabs[tabIndex] ? { transform: 'rotate(45deg)' } : {}}
        />
    )

    const renderTabLinks = (anchors: NavItem[]) => (<>
        <Nav.Item>
            <Nav.Link eventKey={'all'} onSelect={() => setShowAll(true)} className="text-white">
                <FontAwesomeIcon
                    icon="thumbtack"
                    onClick={handlePinToggleAll}
                    className={pinnedTabs.length === Object.keys(nav).length && pinnedTabs.reduce((p, c) => p && c, true) ? 'text-warning' : 'text-light'}
                    style={pinnedTabs.length === Object.keys(nav).length && pinnedTabs.reduce((p, c) => p && c, true) ? {} : { transform: 'rotate(45deg)' }}
                />
                <span className="ml-4">All</span>
            </Nav.Link>
        </Nav.Item>
        {anchors.map((x, i) => !x.permission || x.permission() ?
            <Nav.Item key={`v-pills-${x.id.toLowerCase()}-tab`}>
                <Nav.Link
                    eventKey={x.id.toLowerCase()}
                    onSelect={async () => {
                        await new Promise(r => {
                            setTimeout(r, 100)
                        })
                        const element = document.getElementById(`recipe-section-${x.id}`)
                        if (element?.scrollIntoView) element?.scrollIntoView()
                        window.scrollBy(0, -50)
                        setCurrentTab(x.id)
                        setShowAll(false)
                    }}
                    className={`text-white my-1 ${currentTab === x.id ? 'active' : ' bg-dark '}`}
                >
                    {renderPin(i)}
                    <span className="ml-4">{x.tab || x.label}</span>
                </Nav.Link>
            </Nav.Item> : null)
        }
    </>)

    const renderTabContent = () => (
        <Tab.Content>
            {
                nav.map((n, i) => (
                    <Tab.Pane
                        key={`tab-nav-${n.id}`}
                        eventKey={n.id} title={n.label} active={showAll || pinnedTabs[i] || undefined}
                        style={{ marginBottom: 50 }}
                    >
                        <>{renderPin(i)} <span id={`recipe-section-${n.id}`} className={'h3'}>{n.label}</span></>
                        {n.content}
                    </Tab.Pane>
                ))
            }
        </Tab.Content>
    )

    const renderTabs = () => (
        <Col>
            {renderTabContent()}
        </Col>
    )

    const loader = (value: number | string | null, width: number = 275, height: number = 15) => !loading ? value : (
        <ContentLoader
            height={height}
            speed={3}
            foregroundColor={'#333'}
            backgroundColor={'#999'}
        >
            <rect x="25" y="0" rx="5" ry="5" width={width} height={height} />
        </ContentLoader>
    )

    const defaultProps = {
        xs: 12,
        md: 4,
        lg: 3,
    }

    return (
        <Tab.Container defaultActiveKey={defaultActiveKey}>
            <Row>
                <Col {...{ ...defaultProps, ...(navLinkContainerProps || {}) }}>
                    <h3 className="text-center">{typeof title !== 'undefined' && loader(title, 225, 25)}</h3>
                    <Nav variant="pills" className="flex-column sticky-top sticky-top-pad">
                        {renderTabLinks(nav)}
                    </Nav>
                </Col>
                <Col>
                    <Row  {...(navContentContainerProps || {})}>
                        {renderTabs()}
                    </Row>
                </Col>
            </Row>
        </Tab.Container>
    )
}