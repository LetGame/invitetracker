"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const Command_1 = require("../../../framework/commands/Command");
const ScheduledAction_1 = require("../../../framework/models/ScheduledAction");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const PunishmentConfig_1 = require("../../models/PunishmentConfig");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.mute,
            aliases: [],
            args: [
                {
                    name: 'user',
                    resolver: resolvers_1.MemberResolver,
                    required: true
                },
                {
                    name: 'reason',
                    resolver: resolvers_1.StringResolver,
                    rest: true
                }
            ],
            flags: [
                {
                    name: 'duration',
                    resolver: resolvers_1.DurationResolver,
                    short: 'd'
                }
            ],
            group: types_1.CommandGroup.Moderation,
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, [targetMember, reason], { duration }, { guild, me, settings, t }) {
        const embed = this.client.mod.createBasicEmbed(targetMember);
        const mutedRole = settings.mutedRole;
        if (!mutedRole || !guild.roles.has(mutedRole)) {
            embed.description = t('cmd.mute.missingRole');
        }
        else if (this.client.mod.isPunishable(guild, targetMember, message.member, me)) {
            await this.client.mod.informAboutPunishment(targetMember, PunishmentConfig_1.PunishmentType.mute, settings, { reason });
            try {
                await targetMember.addRole(mutedRole, encodeURIComponent(reason));
                // Make sure member exists in DB
                await this.client.db.saveMembers([
                    {
                        id: targetMember.user.id,
                        name: targetMember.user.username,
                        discriminator: targetMember.user.discriminator,
                        guildId: guild.id
                    }
                ]);
                await this.client.db.savePunishment({
                    guildId: guild.id,
                    memberId: targetMember.id,
                    type: PunishmentConfig_1.PunishmentType.mute,
                    amount: 0,
                    args: '',
                    reason: reason,
                    creatorId: message.author.id
                });
                await this.client.mod.logPunishmentModAction(guild, targetMember.user, PunishmentConfig_1.PunishmentType.mute, 0, [{ name: 'Reason', value: reason }], message.author);
                if (duration) {
                    embed.fields.push({
                        name: t('cmd.mute.unmute.title'),
                        value: t('cmd.mute.unmute.description', { duration: duration.humanize(false) })
                    });
                    await this.client.scheduler.addScheduledAction(guild.id, ScheduledAction_1.ScheduledActionType.unmute, { memberId: targetMember.id, roleId: mutedRole }, moment_1.default().add(duration).toDate(), 'Unmute from timed `!mute` command');
                }
                embed.description = t('cmd.mute.done');
            }
            catch (error) {
                embed.description = t('cmd.mute.error', { error });
            }
        }
        else {
            embed.description = t('cmd.mute.canNotMute');
        }
        const response = await this.sendReply(message, embed);
        if (response && settings.modPunishmentMuteDeleteMessage) {
            const func = () => {
                message.delete().catch(() => undefined);
                response.delete().catch(() => undefined);
            };
            setTimeout(func, 4000);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=mute.js.map