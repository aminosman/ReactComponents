"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = (0, tslib_1.__importStar)(require("react"));
var react_bootstrap_typeahead_1 = require("react-bootstrap-typeahead");
require("react-bootstrap-typeahead/css/Typeahead.css");
exports.default = (function (props) {
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)([]), options = _b[0], setOptions = _b[1];
    var search = function (query) { return (0, tslib_1.__awaiter)(void 0, void 0, void 0, function () {
        var result;
        var _a;
        return (0, tslib_1.__generator)(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoading(true);
                    return [4 /*yield*/, ((_a = props === null || props === void 0 ? void 0 : props.onSearch) === null || _a === void 0 ? void 0 : _a.call(props, query))];
                case 1:
                    result = _b.sent();
                    if (Array.isArray(result)) {
                        setOptions(result);
                    }
                    setLoading(false);
                    return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        if (props.searchOnClick) {
            search('');
        }
    }, []);
    var onChange = function (selected) {
        props.onChange(selected);
    };
    var onInputChange = function (text) {
        if (!props.onInputChange)
            return;
        props.onInputChange(text);
    };
    return (react_1.default.createElement(react_bootstrap_typeahead_1.AsyncTypeahead, (0, tslib_1.__assign)({}, props, { isLoading: props.loading || loading, options: props.options || options, onChange: onChange, promptText: "Type to search...", minLength: 0, defaultInputValue: props.initialValue, onSearch: search })));
});
