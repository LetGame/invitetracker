"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
const moment_1 = __importDefault(require("moment"));
const Command_1 = require("../../../framework/commands/Command");
const ScheduledAction_1 = require("../../../framework/models/ScheduledAction");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const SEND_MESSAGES = 0x00000800;
const NOT_SEND_MESSAGES = 0x7ffff7ff;
// tslint:disable: no-bitwise
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.lockdown,
            aliases: [],
            args: [
                {
                    name: 'channel',
                    resolver: resolvers_1.ChannelResolver,
                    required: false
                }
            ],
            flags: [
                {
                    name: 'timeout',
                    resolver: resolvers_1.DurationResolver,
                    short: 't'
                }
            ],
            group: types_1.CommandGroup.Moderation,
            botPermissions: [types_1.GuildPermission.MANAGE_ROLES, types_1.GuildPermission.MANAGE_CHANNELS],
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, [channel], { timeout }, { guild, me, settings, t }) {
        channel = channel || message.channel;
        if (!(channel instanceof eris_1.TextChannel)) {
            await this.sendReply(message, t('cmd.lockdown.notATextChannel'));
            return;
        }
        const scheduledUnlockActions = await this.client.scheduler.getScheduledActionsOfType(guild.id, ScheduledAction_1.ScheduledActionType.unlock);
        const scheduledUnlockAction = scheduledUnlockActions.find((action) => action.args.channelId === channel.id);
        if (scheduledUnlockAction) {
            const override = channel.permissionOverwrites.get(scheduledUnlockAction.args.roleId);
            const newAllow = scheduledUnlockAction.args.wasAllowed ? SEND_MESSAGES : 0;
            await this.client.editChannelPermission(scheduledUnlockAction.args.channelId, scheduledUnlockAction.args.roleId, override ? override.allow | newAllow : newAllow, override ? override.deny & NOT_SEND_MESSAGES : 0, 'role', 'Channel lockdown');
            await this.client.scheduler.removeScheduledAction(guild.id, scheduledUnlockAction.id);
            await this.sendReply(message, t('cmd.lockdown.channelUnlocked', { channel: `<#${channel.id}>` }));
            return;
        }
        // Get lowest role that has write permissions
        let lowestRole = null;
        let lowestOverride = null;
        for (const [id, value] of channel.permissionOverwrites) {
            if (value.type === 'member') {
                continue;
            }
            if ((value.deny & SEND_MESSAGES) === SEND_MESSAGES) {
                continue;
            }
            const role = guild.roles.get(id);
            if (lowestRole && lowestRole.position < role.position) {
                continue;
            }
            lowestRole = role;
            lowestOverride = value;
        }
        if (!lowestRole) {
            await this.sendReply(message, t('cmd.lockdown.noSuitingRoleFound'));
            return;
        }
        // We always add a scheduled actions so that we know what to restore on unlock
        // But if the user didn't specify a timeout then we set it to null so they must do it manually
        await this.client.scheduler.addScheduledAction(guild.id, ScheduledAction_1.ScheduledActionType.unlock, {
            channelId: channel.id,
            roleId: lowestRole.id,
            wasAllowed: !!(lowestOverride.allow & SEND_MESSAGES)
        }, timeout ? moment_1.default().add(timeout).toDate() : null, 'Unlock from `!lockdown` command');
        await this.client.editChannelPermission(channel.id, me.id, SEND_MESSAGES, 0, 'member', 'Channel lockdown');
        await this.client.editChannelPermission(channel.id, lowestRole.id, lowestOverride.allow & NOT_SEND_MESSAGES, lowestOverride.deny | SEND_MESSAGES, 'role', 'Channel lockdown');
        await this.sendReply(message, t('cmd.lockdown.channelLockedDown', { channel: `<#${channel.id}>` }));
    }
}
exports.default = default_1;
//# sourceMappingURL=lockdown.js.map