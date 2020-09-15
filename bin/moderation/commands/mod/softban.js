"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const PunishmentConfig_1 = require("../../models/PunishmentConfig");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.softBan,
            aliases: ['soft-ban'],
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
                    name: 'deleteMessageDays',
                    resolver: resolvers_1.NumberResolver,
                    short: 'd'
                }
            ],
            group: types_1.CommandGroup.Moderation,
            botPermissions: [types_1.GuildPermission.BAN_MEMBERS],
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, [targetMember, reason], { deleteMessageDays }, { guild, me, settings, t }) {
        const embed = this.client.mod.createBasicEmbed(targetMember);
        if (this.client.mod.isPunishable(guild, targetMember, message.member, me)) {
            await this.client.mod.informAboutPunishment(targetMember, PunishmentConfig_1.PunishmentType.softban, settings, { reason });
            const days = deleteMessageDays ? deleteMessageDays : 0;
            try {
                await targetMember.ban(days, reason);
                await targetMember.unban('softban');
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
                    type: PunishmentConfig_1.PunishmentType.softban,
                    amount: 0,
                    args: '',
                    reason: reason,
                    creatorId: message.author.id
                });
                await this.client.mod.logPunishmentModAction(guild, targetMember.user, PunishmentConfig_1.PunishmentType.softban, 0, [{ name: 'Reason', value: reason }], message.author);
                embed.description = t('cmd.softBan.done');
            }
            catch (error) {
                embed.description = t('cmd.softBan.error', { error });
            }
        }
        else {
            embed.description = t('cmd.ban.canNotSoftBan');
        }
        const response = await this.sendReply(message, embed);
        if (response && settings.modPunishmentSoftbanDeleteMessage) {
            const func = () => {
                message.delete().catch(() => undefined);
                response.delete().catch(() => undefined);
            };
            setTimeout(func, 4000);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=softban.js.map