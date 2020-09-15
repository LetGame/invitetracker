"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const InviteCodeSetting_1 = require("../../../framework/models/InviteCodeSetting");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.createInvite,
            aliases: ['create-invite'],
            args: [
                {
                    name: 'name',
                    resolver: resolvers_1.StringResolver,
                    required: true
                },
                {
                    name: 'channel',
                    resolver: resolvers_1.ChannelResolver
                }
            ],
            group: types_1.CommandGroup.Invites,
            botPermissions: [types_1.GuildPermission.CREATE_INSTANT_INVITE],
            guildOnly: true,
            defaultAdminOnly: true,
            extraExamples: ['!createInvite reddit', '!createInvite website #welcome']
        });
    }
    async action(message, [name, _channel], flags, { guild, t, me }) {
        const channel = _channel ? _channel : message.channel;
        if (!channel.permissionsOf(me.id).has(types_1.GuildPermission.CREATE_INSTANT_INVITE)) {
            return this.sendReply(message, t('permissions.createInstantInvite'));
        }
        const inv = await this.client.createChannelInvite(channel.id, {
            maxAge: 0,
            maxUses: 0,
            temporary: false,
            unique: true
        }, name ? encodeURIComponent(name) : undefined);
        await this.client.db.saveChannels([
            {
                id: inv.channel.id,
                name: inv.channel.name,
                guildId: guild.id
            }
        ]);
        await this.client.db.saveInviteCodes([
            {
                code: inv.code,
                maxAge: 0,
                maxUses: 0,
                createdAt: new Date(inv.createdAt),
                temporary: false,
                channelId: inv.channel.id,
                uses: 0,
                guildId: inv.guild.id,
                inviterId: message.author.id,
                clearedAmount: 0,
                isVanity: false,
                isWidget: false
            }
        ]);
        await this.client.cache.inviteCodes.setOne(guild.id, inv.code, InviteCodeSetting_1.InviteCodeSettingsKey.name, name);
        return this.sendReply(message, t('cmd.createInvite.done', {
            code: `https://discord.gg/${inv.code}`,
            channel: `<#${channel.id}>`,
            name
        }));
    }
}
exports.default = default_1;
//# sourceMappingURL=createInvite.js.map