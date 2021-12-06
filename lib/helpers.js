"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var safeNumber = function (n, d, p) {
    if (d === void 0) { d = 0; }
    if (p === void 0) { p = 2; }
    return typeof n === "number" ? n.toFixed(p) : d;
};
exports.default = {
    safeNumber: safeNumber,
};
