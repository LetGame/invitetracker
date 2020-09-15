"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteCodeResolver = void 0;
const Resolver_1 = require("./Resolver");
const codeRegex = /^(?:(?:https?:\/\/)?discord.gg\/)?(.*)$/;
class InviteCodeResolver extends Resolver_1.Resolver {
    async resolve(value, { t }) {
        if (!value) {
            return;
        }
        let inv;
        if (codeRegex.test(value)) {
            const id = value.match(codeRegex)[1];
            inv = await this.client.getInvite(id);
        }
        if (!inv) {
            throw Error(t(`resolvers.invitecode.notFound`));
        }
        return inv;
    }
}
exports.InviteCodeResolver = InviteCodeResolver;
//# sourceMappingURL=InviteCodeResolver.js.map