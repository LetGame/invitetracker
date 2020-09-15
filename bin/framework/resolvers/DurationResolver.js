"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DurationResolver = void 0;
const moment_1 = __importDefault(require("moment"));
const Resolver_1 = require("./Resolver");
const SECONDS_PER_DAY = 86400;
class DurationResolver extends Resolver_1.Resolver {
    async resolve(value, { t }) {
        if (typeof value === typeof undefined || value.length === 0) {
            return;
        }
        let seconds = 0;
        const s = parseInt(value, 10);
        if (value.indexOf('s') >= 0) {
            seconds = s;
        }
        else if (value.indexOf('min') >= 0) {
            seconds = s * 60;
        }
        else if (value.indexOf('h') >= 0) {
            seconds = s * 3600;
        }
        else if (value.indexOf('d') >= 0) {
            seconds = s * SECONDS_PER_DAY;
        }
        else if (value.indexOf('w') >= 0) {
            seconds = s * 7 * SECONDS_PER_DAY;
        }
        else if (value.indexOf('mo') >= 0) {
            seconds = s * 30 * SECONDS_PER_DAY;
        }
        else if (value.indexOf('y') >= 0) {
            seconds = s * 365 * SECONDS_PER_DAY;
        }
        else {
            return moment_1.default.duration(value);
        }
        return moment_1.default.duration(seconds, 'second');
    }
}
exports.DurationResolver = DurationResolver;
//# sourceMappingURL=DurationResolver.js.map