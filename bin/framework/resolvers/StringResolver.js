"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringResolver = void 0;
const Resolver_1 = require("./Resolver");
class StringResolver extends Resolver_1.Resolver {
    async resolve(value, { guild }) {
        return value;
    }
}
exports.StringResolver = StringResolver;
//# sourceMappingURL=StringResolver.js.map