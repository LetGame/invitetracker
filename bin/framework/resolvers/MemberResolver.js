"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberResolver = void 0;
const Resolver_1 = require("./Resolver");
const idRegex = /^(?:<@!?)?(\d+)>?$/;
class MemberResolver extends Resolver_1.Resolver {
    async resolve(value, { guild, t }) {
        if (!value || !guild) {
            return;
        }
        let member;
        if (idRegex.test(value)) {
            const id = value.match(idRegex)[1];
            member = guild.members.get(id);
            if (!member) {
                member = await guild.getRESTMember(id).then(() => undefined);
            }
            if (!member) {
                throw Error(t(`resolvers.member.notFound`));
            }
        }
        else {
            const name = value.toLowerCase();
            const members = guild.members.filter((m) => {
                const mName = m.username.toLowerCase() + '#' + m.discriminator;
                return mName.includes(name) || name.includes(mName);
            });
            if (members.length === 1) {
                member = members[0];
            }
            else {
                if (members.length === 0) {
                    throw Error(t(`resolvers.member.notFound`));
                }
                else {
                    throw Error(t(`resolvers.member.multiple`, {
                        members: members
                            .slice(0, 10)
                            .map((m) => `\`${m.username}#${m.discriminator}\``)
                            .join(', ')
                    }));
                }
            }
        }
        return member;
    }
}
exports.MemberResolver = MemberResolver;
//# sourceMappingURL=MemberResolver.js.map