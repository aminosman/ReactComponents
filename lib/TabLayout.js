"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_fontawesome_1 = require("@fortawesome/react-fontawesome");
var react_1 = (0, tslib_1.__importStar)(require("react"));
var react_bootstrap_1 = require("react-bootstrap");
var react_content_loader_1 = (0, tslib_1.__importDefault)(require("react-content-loader"));
function TabLayout(_a) {
    var _this = this;
    var defaultActiveKey = _a.defaultActiveKey, nav = _a.nav, defaultPinnedTabs = _a.defaultPinnedTabs, title = _a.title, loading = _a.loading, navLinkContainerProps = _a.navLinkContainerProps, navContentContainerProps = _a.navContentContainerProps, onTitleEdit = _a.onTitleEdit;
    var _b = (0, react_1.useState)(defaultPinnedTabs ? nav.map(function (x) { return defaultPinnedTabs === null || defaultPinnedTabs === void 0 ? void 0 : defaultPinnedTabs.includes(x.id); }) : []), pinnedTabs = _b[0], setPinnedTabs = _b[1];
    var _c = (0, react_1.useState)(), showAll = _c[0], setShowAll = _c[1];
    var _d = (0, react_1.useState)(defaultActiveKey), currentTab = _d[0], setCurrentTab = _d[1];
    var handlePinToggle = function (index) {
        var copy = (0, tslib_1.__spreadArray)([], pinnedTabs, true);
        copy[index] = !copy[index];
        setPinnedTabs(copy);
    };
    var handlePinToggleAll = function () {
        if (pinnedTabs.length === Object.keys(nav).length && pinnedTabs.reduce(function (p, c) { return p && c; }, true)) {
            setPinnedTabs([]);
        }
        else
            setPinnedTabs(Object.keys(nav).map(function (x) { return true; }));
    };
    var renderPin = function (tabIndex) { return (react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: "thumbtack", onClick: function () { return handlePinToggle(tabIndex); }, className: pinnedTabs[tabIndex] ? 'text-warning' : 'text-light', style: !pinnedTabs[tabIndex] ? { transform: 'rotate(45deg)' } : {} })); };
    var renderTabLinks = function (anchors) { return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Nav.Item, null,
            react_1.default.createElement(react_bootstrap_1.Nav.Link, { eventKey: 'all', onSelect: function () { return setShowAll(true); }, className: "text-white" },
                react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { icon: "thumbtack", onClick: handlePinToggleAll, className: pinnedTabs.length === Object.keys(nav).length && pinnedTabs.reduce(function (p, c) { return p && c; }, true) ? 'text-warning' : 'text-light', style: pinnedTabs.length === Object.keys(nav).length && pinnedTabs.reduce(function (p, c) { return p && c; }, true) ? {} : { transform: 'rotate(45deg)' } }),
                react_1.default.createElement("span", { className: "ml-4" }, "All"))),
        anchors.map(function (x, i) { return !x.permission || x.permission() ?
            react_1.default.createElement(react_bootstrap_1.Nav.Item, { key: "v-pills-" + x.id.toLowerCase() + "-tab" },
                react_1.default.createElement(react_bootstrap_1.Nav.Link, { eventKey: x.id.toLowerCase(), onSelect: function () { return (0, tslib_1.__awaiter)(_this, void 0, void 0, function () {
                        var element;
                        return (0, tslib_1.__generator)(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, new Promise(function (r) {
                                        setTimeout(r, 100);
                                    })];
                                case 1:
                                    _a.sent();
                                    element = document.getElementById("recipe-section-" + x.id);
                                    if (element === null || element === void 0 ? void 0 : element.scrollIntoView)
                                        element === null || element === void 0 ? void 0 : element.scrollIntoView();
                                    window.scrollBy(0, -50);
                                    setCurrentTab(x.id);
                                    setShowAll(false);
                                    return [2 /*return*/];
                            }
                        });
                    }); }, className: "text-white my-1 " + (currentTab === x.id ? 'active' : ' bg-dark ') },
                    renderPin(i),
                    react_1.default.createElement("span", { className: "ml-4" }, x.tab || x.label))) : null; }))); };
    var renderTabContent = function () { return (react_1.default.createElement(react_bootstrap_1.Tab.Content, null, nav.map(function (n, i) { return (react_1.default.createElement(react_bootstrap_1.Tab.Pane, { key: "tab-nav-" + n.id, eventKey: n.id, title: n.label, active: showAll || pinnedTabs[i] || undefined, style: { marginBottom: 50 } },
        react_1.default.createElement(react_1.default.Fragment, null,
            renderPin(i),
            " ",
            react_1.default.createElement("span", { id: "recipe-section-" + n.id, className: 'h3' }, n.label)),
        n.content)); }))); };
    var renderTabs = function () { return (react_1.default.createElement(react_bootstrap_1.Col, null, renderTabContent())); };
    var loader = function (value, width, height) {
        if (width === void 0) { width = 275; }
        if (height === void 0) { height = 15; }
        return !loading ? value : (react_1.default.createElement(react_content_loader_1.default, { height: height, speed: 3, foregroundColor: '#333', backgroundColor: '#999' },
            react_1.default.createElement("rect", { x: "25", y: "0", rx: "5", ry: "5", width: width, height: height })));
    };
    var defaultProps = {
        xs: 12,
        md: 4,
        lg: 3,
    };
    return (react_1.default.createElement(react_bootstrap_1.Tab.Container, { defaultActiveKey: defaultActiveKey },
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, (0, tslib_1.__assign)({}, (0, tslib_1.__assign)((0, tslib_1.__assign)({}, defaultProps), (navLinkContainerProps || {}))),
                react_1.default.createElement("h3", { className: "text-center" },
                    typeof title !== 'undefined' && loader(title, 225, 25),
                    onTitleEdit && react_1.default.createElement(react_fontawesome_1.FontAwesomeIcon, { className: "text-white", icon: "edit", onClick: onTitleEdit })),
                react_1.default.createElement(react_bootstrap_1.Nav, { variant: "pills", className: "flex-column sticky-top sticky-top-pad" }, renderTabLinks(nav))),
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement(react_bootstrap_1.Row, (0, tslib_1.__assign)({}, (navContentContainerProps || {})), renderTabs())))));
}
exports.default = TabLayout;
