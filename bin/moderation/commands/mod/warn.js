"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
const PunishmentConfig_1 = require("../../models/PunishmentConfig");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.warn,
            aliases: [],
            args: [
                {
                    name: 'member',
                    resolver: resolvers_1.MemberResolver,
                    required: true
                },
                {
                    name: 'reason',
                    resolver: resolvers_1.StringResolver,
                    rest: true
                }
            ],
            group: types_1.CommandGroup.Moderation,
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, [targetMember, reason], flags, { guild, me, settings, t }) {
        const embed = this.client.mod.createBasicEmbed(targetMember);
        if (this.client.mod.isPunishable(guild, targetMember, message.member, me)) {
            await this.client.mod.informAboutPunishment(targetMember, PunishmentConfig_1.PunishmentType.warn, settings, { reason });
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
                id: null,
                guildId: guild.id,
                memberId: targetMember.id,
                type: PunishmentConfig_1.PunishmentType.warn,
                amount: 0,
                args: '',
                reason: reason,
                creatorId: message.author.id
            });
            await this.client.mod.logPunishmentModAction(guild, targetMember.user, PunishmentConfig_1.PunishmentType.warn, 0, [
                { name: 'Mod', value: `<@${message.author.id}>` },
                { name: 'Reason', value: reason }
            ]);
            embed.description = t('cmd.warn.done');
        }
        else {
            embed.description = t('cmd.warn.canNotWarn');
        }
        const response = await this.sendReply(message, embed);
        if (response && settings.modPunishmentWarnDeleteMessage) {
            const func = () => {
                message.delete().catch(() => undefined);
                response.delete().catch(() => undefined);
            };
            setTimeout(func, 4000);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=warn.js.map