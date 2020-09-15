"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateResolver = void 0;
const moment_1 = __importDefault(require("moment"));
const Resolver_1 = require("./Resolver");
class DateResolver extends Resolver_1.Resolver {
    async resolve(value, { t }) {
        if (typeof value === typeof undefined || value.length === 0) {
            return;
        }
        return moment_1.default(value);
    }
}
exports.DateResolver = DateResolver;
//# sourceMappingURL=DateResolver.js.map