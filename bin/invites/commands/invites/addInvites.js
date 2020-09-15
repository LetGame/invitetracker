"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const Log_1 = require("../../../framework/models/Log");
const resolvers_1 = require("../../../framework/resolvers");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.addInvites,
            aliases: ['add-invites'],
            args: [
                {
                    name: 'user',
                    resolver: resolvers_1.UserResolver,
                    required: true
                },
                {
                    name: 'amount',
                    resolver: resolvers_1.NumberResolver,
                    required: true
                },
                {
                    name: 'reason',
                    resolver: resolvers_1.StringResolver,
                    rest: true
                }
            ],
            group: types_1.CommandGroup.Invites,
            guildOnly: true,
            defaultAdminOnly: true,
            extraExamples: ['!addInvites @User 5', '!addInvites "Name with space" -30 Removed for cheating']
        });
    }
    async action(message, [user, amount, reason], flags, { guild, t, me }) {
        if (amount === 0) {
            return this.sendReply(message, t('cmd.addInvites.zero'));
        }
        const invites = await this.client.cache.invites.getOne(guild.id, user.id);
        const totalInvites = invites.total + amount;
        await this.client.db.saveMembers([
            {
                id: user.id,
                name: user.username,
                discriminator: user.discriminator,
                guildId: guild.id
            }
        ]);
        const customInviteId = await this.client.db.saveCustomInvite({
            guildId: guild.id,
            memberId: user.id,
            creatorId: message.author.id,
            amount: `${amount}`,
            reason
        });
        // Update cache
        invites.custom += amount;
        invites.total += amount;
        await this.client.logAction(guild, message, Log_1.LogAction.addInvites, {
            customInviteId,
            targetId: user.id,
            amount,
            reason
        });
        const embed = this.createEmbed({
            title: user.username
        });
        let descr = '';
        if (amount > 0) {
            descr += t('cmd.addInvites.amount.positive', {
                amount,
                member: `<@${user.id}>`,
                totalInvites
            });
        }
        else {
            descr += t('cmd.addInvites.amount.negative', {
                amount: -amount,
                member: `<@${user.id}>`,
                totalInvites
            });
        }
        let member = guild.members.get(user.id);
        if (!member) {
            member = await guild.getRESTMember(user.id).catch(() => undefined);
        }
        // Promote the member if it's not a bot
        // and if the member is still in the guild
        if (member && !member.user.bot) {
            const promoteInfo = await this.client.invs.promoteIfQualified(guild, member, me, totalInvites);
            if (promoteInfo) {
                const { shouldHave, shouldNotHave, dangerous } = promoteInfo;
                if (shouldHave.length > 0) {
                    descr +=
                        '\n\n' +
                            t('roles.shouldHave', {
                                shouldHave: shouldHave.map((r) => `<@&${r.id}>`).join(', ')
                            });
                }
                if (shouldNotHave.length > 0) {
                    descr +=
                        '\n\n' +
                            t('roles.shouldNotHave', {
                                shouldNotHave: shouldNotHave.map((r) => `<@&${r.id}>`).join(', ')
                            });
                }
                if (dangerous.length > 0) {
                    descr +=
                        '\n\n' +
                            t('roles.dangerous', {
                                dangerous: dangerous.map((r) => `<@&${r.id}>`).join(', ')
                            });
                }
            }
        }
        embed.description = descr;
        return this.sendReply(message, embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=addInvites.js.map