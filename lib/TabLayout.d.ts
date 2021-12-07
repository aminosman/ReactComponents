/// <reference types="react" />
interface NavItem {
    label: string;
    id: string;
    tab?: JSX.Element;
    permission?: () => boolean | undefined;
    content: any;
}
interface Props {
    defaultActiveKey: string;
    nav: NavItem[];
    defaultPinnedTabs?: string[];
    title?: string;
    loading?: boolean;
}
export default function TableLayout({ defaultActiveKey, nav, defaultPinnedTabs, title, loading }: Props): JSX.Element;
export {};
