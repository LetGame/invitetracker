"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumResolver = void 0;
const Resolver_1 = require("./Resolver");
class EnumResolver extends Resolver_1.Resolver {
    constructor(client, values) {
        super(client);
        this.values = new Map();
        values.forEach((v) => this.values.set(v.toLowerCase(), v));
    }
    async resolve(value, { t }) {
        if (!value) {
            return;
        }
        const val = value.toLowerCase();
        if (this.values.has(val)) {
            return this.values.get(val);
        }
        throw Error(t(`resolvers.enum.invalid`));
    }
    getHelp({ t }) {
        return t(`resolvers.enum.validValues`, {
            values: [...this.values.values()]
                .sort((a, b) => a.localeCompare(b))
                .map((v) => '`' + v + '`')
                .join(', ')
        });
    }
}
exports.EnumResolver = EnumResolver;
//# sourceMappingURL=EnumResolver.js.map