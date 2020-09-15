"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandResolver = void 0;
const Resolver_1 = require("./Resolver");
class CommandResolver extends Resolver_1.Resolver {
    async resolve(value, { guild, t }) {
        if (!guild || !value) {
            return;
        }
        const name = value.toLowerCase();
        const cmds = this.client.cmds.commands.filter((c) => c.name.toLowerCase().includes(name) || c.aliases.indexOf(name) >= 0);
        if (cmds.length === 0) {
            throw Error(t(`resolvers.command.notFound`));
        }
        else if (cmds.length === 1) {
            return cmds[0];
        }
        else {
            const cmd = cmds.find((c) => c.name.length - name.length === 0);
            if (!cmd) {
                throw Error(t(`resolvers.command.multiple`, {
                    commands: cmds
                        .slice(0, 10)
                        .map((c) => `\`${c.name}\``)
                        .join(', ')
                }));
            }
            return cmd;
        }
    }
    getHelp({ t }) {
        return t(`resolvers.command.validValues`, {
            values: this.client.cmds.commands.map((c) => '`' + c.name + '`').join(', ')
        });
    }
}
exports.CommandResolver = CommandResolver;
//# sourceMappingURL=CommandResolver.js.map