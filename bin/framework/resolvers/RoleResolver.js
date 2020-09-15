"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleResolver = void 0;
const Resolver_1 = require("./Resolver");
const idRegex = /^(?:<@&)?(\d+)>?$/;
class RoleResolver extends Resolver_1.Resolver {
    async resolve(value, { guild, t }) {
        if (!guild || !value) {
            return;
        }
        let role;
        if (idRegex.test(value)) {
            const id = value.match(idRegex)[1];
            role = guild.roles.get(id);
            if (!role) {
                throw Error(t(`resolvers.role.notFound`));
            }
        }
        else {
            const name = value.toLowerCase();
            // Trying to find exact match
            let roles = guild.roles.filter((r) => {
                const rName = r.name.toLowerCase();
                return rName === name;
            });
            // If no roles found, allow for partial match
            if (roles.length === 0) {
                roles = guild.roles.filter((r) => {
                    const rName = r.name.toLowerCase();
                    return rName.includes(name) || name.includes(rName);
                });
            }
            if (roles.length === 1) {
                role = roles[0];
            }
            else {
                if (roles.length === 0) {
                    throw Error(t(`resolvers.role.notFound`));
                }
                else {
                    throw Error(t(`resolvers.role.multiple`, {
                        roles: roles
                            .slice(0, 10)
                            .map((r) => `\`${r.name}\``)
                            .join(', ')
                    }));
                }
            }
        }
        return role;
    }
}
exports.RoleResolver = RoleResolver;
//# sourceMappingURL=RoleResolver.js.map