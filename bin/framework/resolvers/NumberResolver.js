"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberResolver = void 0;
const Resolver_1 = require("./Resolver");
const MAX_VALUE = Number.MAX_SAFE_INTEGER;
const MIN_VALUE = Number.MIN_SAFE_INTEGER;
class NumberResolver extends Resolver_1.Resolver {
    constructor(client, min, max) {
        super(client);
        this.min = min;
        this.max = max;
    }
    async resolve(value, { t }) {
        if (typeof value === typeof undefined || value.length === 0) {
            return;
        }
        const val = parseFloat(value);
        if (isNaN(val) || !isFinite(val)) {
            throw Error(t(`resolvers.number.invalid`));
        }
        if (val < MIN_VALUE) {
            throw Error(t(`resolvers.number.tooSmall`, { min: this.min || MIN_VALUE }));
        }
        if (val > MAX_VALUE) {
            throw Error(t(`resolvers.number.tooLarge`, { max: this.max || MAX_VALUE }));
        }
        if (this.min) {
            if (val < this.min) {
                throw Error(t(`resolvers.number.tooSmall`, { min: this.min }));
            }
        }
        if (this.max) {
            if (val > this.max) {
                throw Error(t(`resolvers.number.tooLarge`, { max: this.max }));
            }
        }
        return val;
    }
}
exports.NumberResolver = NumberResolver;
//# sourceMappingURL=NumberResolver.js.map