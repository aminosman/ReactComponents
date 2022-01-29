/// <reference types="react" />
export interface NavItem {
    label: string;
    id: string;
    tab?: JSX.Element;
    permission?: () => boolean | undefined;
    content: any;
}
export interface Props {
    defaultActiveKey: string;
    nav: NavItem[];
    defaultPinnedTabs?: string[];
    title?: string;
    loading?: boolean;
    navLinkContainerProps?: any;
    navContentContainerProps?: any;
}
export default function TableLayout({ defaultActiveKey, nav, defaultPinnedTabs, title, loading, navLinkContainerProps, navContentContainerProps }: Props): JSX.Element;
