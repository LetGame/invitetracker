"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ManagementCommand.makeMentionable,
            aliases: ['make-mentionable', 'mm'],
            args: [
                {
                    name: 'role',
                    resolver: resolvers_1.RoleResolver,
                    required: true
                }
            ],
            group: types_1.CommandGroup.Other,
            guildOnly: true,
            defaultAdminOnly: true,
            extraExamples: ['!makeMentionable @Role', '!makeMentionable "Role with space"']
        });
    }
    async action(message, [role], flags, { t, me, guild }) {
        if (role.mentionable) {
            return this.sendReply(message, t('cmd.makeMentionable.alreadyDone', { role: `<@&${role.id}>` }));
        }
        else {
            let myRole;
            me.roles.forEach((r) => {
                const gRole = guild.roles.get(r);
                if (!myRole || gRole.position > myRole.position) {
                    myRole = gRole;
                }
            });
            // Check if we are higher then the role we want to edit
            if (myRole.position < role.position) {
                return this.sendReply(message, t('cmd.mentionRole.roleTooHigh', {
                    role: role.name,
                    myRole: myRole.name
                }));
            }
            await role.edit({ mentionable: true }, 'Pinging role');
            const func = async (msg) => {
                if (msg.roleMentions.includes(role.id)) {
                    await role.edit({ mentionable: false }, 'Done pinging role');
                    this.client.removeListener('messageCreate', func);
                }
            };
            this.client.on('messageCreate', func);
            const timeOut = () => {
                this.client.removeListener('messageCreate', func);
            };
            setTimeout(timeOut, 60000);
            await message.delete().catch(() => undefined);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=makeMentionable.js.map