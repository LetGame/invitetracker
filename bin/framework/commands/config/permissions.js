"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../../types");
const resolvers_1 = require("../../resolvers");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.permissions,
            aliases: ['perms'],
            args: [
                {
                    name: 'cmd',
                    resolver: resolvers_1.CommandResolver
                },
                {
                    name: 'role',
                    resolver: resolvers_1.RoleResolver
                }
            ],
            group: types_1.CommandGroup.Config,
            guildOnly: true,
            defaultAdminOnly: true
        });
    }
    async action(message, [cmd, role], flags, { guild, t }) {
        if (!cmd) {
            const perms = await this.client.db.getRolePermissionsForGuild(guild.id);
            const embed = this.createEmbed({
                description: t('cmd.permissions.adminsCanUseAll')
            });
            const rs = {
                Everyone: [],
                Administrators: []
            };
            this.client.cmds.commands.forEach((command) => {
                const ps = perms.filter((p) => p.command === command.name);
                if (!ps.length) {
                    if (command.strict) {
                        rs.Administrators.push(command.name);
                    }
                    else {
                        rs.Everyone.push(command.name);
                    }
                }
                else {
                    // Check if the everyone role is allowed to use it
                    if (ps.some((p) => p.roleId === guild.id)) {
                        rs.Everyone.push(command.name);
                    }
                    else {
                        ps.forEach((p) => {
                            const roleName = '@' + p.roleName;
                            if (!rs[roleName]) {
                                rs[roleName] = [];
                            }
                            rs[roleName].push(command.name);
                        });
                    }
                }
            });
            Object.keys(rs).forEach((r) => {
                if (rs[r].length <= 0) {
                    return;
                }
                embed.fields.push({
                    name: r,
                    value: rs[r].map((c) => `\`${c}\``).join(', ')
                });
            });
            return this.sendReply(message, embed);
        }
        /*
        TODO: This should be moved to the setup command

        const cmds = [];
        const cmd = rawCmd.toLowerCase();
        if (cmd === 'mod') {
            cmds.push(BotCommand.info);
            cmds.push(BotCommand.addInvites);
            cmds.push(BotCommand.clearInvites);
            cmds.push(BotCommand.restoreInvites);
            cmds.push(BotCommand.subtractFakes);
            cmds.push(BotCommand.subtractLeaves);
            cmds.push(BotCommand.export);
            cmds.push(BotCommand.makeMentionable);
            cmds.push(BotCommand.mentionRole);
        }

        const cmBot = Object.values(BotCommand).find(v => v.toLowerCase() === cmd);
        if (cmBot) {
            cmds.push(cmBot);
        }

        const cmOwner = Object.values(OwnerCommand).find(
            v => v.toLowerCase() === cmd
        ) as OwnerCommand;
        if (cmOwner) {
            cmds.push(cmOwner);
        }
        */
        if (!role) {
            const perms = await this.client.db.getRolePermissionsForGuild(guild.id, cmd.name);
            const embed = this.createEmbed({
                description: t('cmd.permissions.adminsCanUseAll')
            });
            if (perms.length === 0) {
                embed.fields.push({
                    name: cmd.name,
                    value: cmd.strict ? t('cmd.permissions.adminOnly') : t('cmd.permissions.everyone')
                });
            }
            else {
                const grouped = new Map();
                perms.forEach((p) => {
                    let roles = grouped.get(p.command);
                    if (!roles) {
                        roles = [];
                        grouped.set(p.command, roles);
                    }
                    roles.push(p.roleId);
                });
                grouped.forEach((roles, c) => {
                    embed.fields.push({
                        name: c,
                        value: roles.map((r) => `<@&${r}>`).join(', ')
                    });
                });
            }
            return this.sendReply(message, embed);
        }
        if (cmd.name === types_1.BotCommand.config ||
            cmd.name === types_1.BotCommand.botConfig ||
            cmd.name === types_1.BotCommand.inviteCodeConfig ||
            cmd.name === types_1.BotCommand.memberConfig ||
            cmd.name === types_1.BotCommand.permissions ||
            cmd.name === types_1.BotCommand.interactiveConfig ||
            cmd.name === types_1.InvitesCommand.addRank ||
            cmd.name === types_1.InvitesCommand.removeRank) {
            return this.sendReply(message, t('cmd.permissions.canNotChange', { cmd: cmd.name }));
        }
        const oldPerms = await this.client.db.getRolePermissions(guild.id, role.id, cmd.name);
        if (oldPerms) {
            await this.client.db.removeRolePermissions(guild.id, oldPerms.roleId, oldPerms.command);
            await this.sendReply(message, t('cmd.permissions.removed', {
                role: role.id === guild.id ? '@everyone' : `<@&${role.id}>`,
                cmds: `\`${cmd.name}\``
            }));
        }
        else {
            await this.client.db.saveRoles([
                {
                    id: role.id,
                    name: role.name,
                    color: role.color.toString(16),
                    guildId: role.guild.id,
                    createdAt: new Date(role.createdAt)
                }
            ]);
            await this.client.db.saveRolePermissions(guild.id, [
                {
                    command: cmd.name,
                    roleId: role.id
                }
            ]);
            await this.sendReply(message, t('cmd.permissions.added', {
                role: role.id === guild.id ? '@everyone' : `<@&${role.id}>`,
                cmds: `\`${cmd.name}\``
            }));
        }
        this.client.cache.permissions.flush(guild.id);
    }
}
exports.default = default_1;
//# sourceMappingURL=permissions.js.map