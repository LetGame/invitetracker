"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const types_1 = require("../../../types");
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.BotCommand.tryPremium,
            aliases: ['try', 'try-premium'],
            group: types_1.CommandGroup.Premium,
            guildOnly: true,
            defaultAdminOnly: true
        });
    }
    async action(message, args, flags, { guild, settings, t, isPremium }) {
        const prefix = settings.prefix;
        const embed = this.createEmbed();
        const trialDuration = moment_1.default.duration(1, 'week');
        const validUntil = moment_1.default().add(trialDuration);
        embed.title = t('cmd.tryPremium.title');
        if (isPremium) {
            embed.description = t('cmd.tryPremium.currentlyActive');
        }
        else if (await this.memberHadTrial(message.author.id)) {
            embed.description = t('cmd.tryPremium.alreadyUsed', {
                prefix
            });
        }
        else {
            const promptEmbed = this.createEmbed();
            promptEmbed.description = t('cmd.tryPremium.text', {
                duration: trialDuration.humanize()
            });
            await this.sendReply(message, promptEmbed);
            const [keyResult] = await this.client.msg.prompt(message, t('cmd.tryPremium.prompt'));
            if (keyResult === types_1.PromptResult.TIMEOUT) {
                return this.sendReply(message, t('cmd.tryPremium.timedOut'));
            }
            if (keyResult === types_1.PromptResult.FAILURE) {
                return this.sendReply(message, t('cmd.tryPremium.canceled'));
            }
            await this.client.db.savePremiumSubscription({
                amount: 0,
                maxGuilds: 1,
                isFreeTier: true,
                isPatreon: false,
                isStaff: false,
                validUntil: validUntil.toDate(),
                memberId: message.author.id,
                reason: ''
            });
            await this.client.db.savePremiumSubscriptionGuild({
                memberId: message.author.id,
                guildId: guild.id
            });
            this.client.cache.premium.flush(guild.id);
            embed.description = t('cmd.tryPremium.started', {
                prefix
            });
        }
        return this.sendReply(message, embed);
    }
    async memberHadTrial(memberId) {
        const sub = await this.client.db.getPremiumSubscriptionsForMember(memberId, false, true);
        return sub && sub.length > 0;
    }
}
exports.default = default_1;
//# sourceMappingURL=tryPremium.js.map