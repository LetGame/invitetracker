"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ManagementCommand.mentionRole,
            aliases: ['mention-role', 'mr'],
            args: [
                {
                    name: 'role',
                    resolver: resolvers_1.RoleResolver,
                    required: true
                }
            ],
            group: types_1.CommandGroup.Other,
            botPermissions: [types_1.GuildPermission.MANAGE_ROLES],
            guildOnly: true,
            defaultAdminOnly: true,
            extraExamples: ['!mentionRole @Role', '!mentionRole "Role with space"']
        });
    }
    async action(message, [role], flags, { t, me, guild }) {
        if (role.mentionable) {
            return this.sendReply(message, t('cmd.mentionRole.alreadyDone', { role: `<@&${role.id}>` }));
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
            const res = await role.edit({ mentionable: true }, 'Pinging role');
            if (!res) {
                return;
            }
            const msg = await message.channel.createMessage(`<@&${role.id}>`).catch(() => null);
            if (!msg) {
                return;
            }
            await role.edit({ mentionable: false }, 'Done pinging role');
            await message.delete().catch(() => undefined);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=mentionRole.js.map