"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const Command_1 = require("../../../framework/commands/Command");
const types_1 = require("../../../types");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.inviteCodes,
            aliases: [
                'inviteCode',
                'invite-code',
                'invite-codes',
                'getInviteCode',
                'get-invite-code',
                'get-invite-codes',
                'showInviteCode',
                'show-invite-code'
            ],
            group: types_1.CommandGroup.Invites,
            botPermissions: [types_1.GuildPermission.MANAGE_GUILD],
            guildOnly: true,
            defaultAdminOnly: false
        });
    }
    async action(message, args, flags, { guild, t, settings }) {
        const lang = settings.lang;
        let codes = await this.client.db.getInviteCodesForMember(guild.id, message.author.id);
        const activeCodes = (await guild.getInvites().catch(() => []))
            .filter((code) => code.inviter && code.inviter.id === message.author.id)
            .map((code) => code);
        const newCodes = activeCodes.filter((code) => !codes.find((c) => c.code === code.code));
        if (newCodes.length > 0) {
            const newDbCodes = newCodes.map((code) => ({
                code: code.code,
                createdAt: new Date(code.createdAt),
                channelId: code.channel ? code.channel.id : null,
                maxAge: code.maxAge,
                maxUses: code.maxUses,
                uses: code.uses,
                temporary: code.temporary,
                guildId: code.guild.id,
                inviterId: code.inviter ? code.inviter.id : null,
                clearedAmount: 0,
                isVanity: false,
                isWidget: !code.inviter
            }));
            const vanityInv = await this.client.cache.vanity.get(guild.id);
            if (vanityInv) {
                newDbCodes.push({
                    code: vanityInv,
                    createdAt: new Date(),
                    channelId: null,
                    guildId: guild.id,
                    inviterId: null,
                    uses: 0,
                    maxUses: 0,
                    maxAge: 0,
                    temporary: false,
                    clearedAmount: 0,
                    isVanity: true,
                    isWidget: false
                });
            }
            // Insert any new codes that haven't been used yet
            if (newCodes.length > 0) {
                await this.client.db.saveChannels(newCodes.map((c) => ({
                    id: c.channel.id,
                    guildId: c.guild.id,
                    name: c.channel.name
                })));
                await this.client.db.saveInviteCodes(newDbCodes);
            }
            codes = codes.concat(newDbCodes);
        }
        const validCodes = codes.filter((c) => c.maxAge === 0 || moment_1.default(c.createdAt).add(c.maxAge, 'second').isAfter(moment_1.default()));
        const temporaryInvites = validCodes.filter((i) => i.maxAge > 0);
        const permanentInvites = validCodes.filter((i) => i.maxAge === 0);
        const recommendedCode = permanentInvites.reduce((max, val) => (val.uses > max.uses ? val : max), permanentInvites[0]);
        const embed = this.createEmbed({
            title: t('cmd.inviteCodes.title', { guild: guild.name })
        });
        if (permanentInvites.length === 0 && temporaryInvites.length === 0) {
            embed.description = t('cmd.inviteCodes.noCodes');
        }
        else {
            if (recommendedCode) {
                embed.fields.push({
                    name: t('cmd.inviteCodes.recommendedCode.title'),
                    value: `https://discord.gg/${recommendedCode.code}`
                });
            }
            else {
                embed.fields.push({
                    name: t('cmd.inviteCodes.recommendedCode.title'),
                    value: t('cmd.inviteCodes.recommendedCode.none')
                });
            }
        }
        if (permanentInvites.length > 0) {
            // embed.addBlankField();
            embed.fields.push({
                name: t('cmd.inviteCodes.permanent.title'),
                value: t('cmd.inviteCodes.permanent.text')
            });
            permanentInvites.forEach((i) => {
                embed.fields.push({
                    name: `${i.code}`,
                    value: t('cmd.inviteCodes.permanent.entry', {
                        uses: i.uses,
                        maxAge: i.maxAge,
                        maxUses: i.maxUses,
                        channel: `<#${i.channelId}>`
                    }),
                    inline: true
                });
            });
        }
        if (temporaryInvites.length > 0) {
            // embed.addBlankField();
            embed.fields.push({
                name: t('cmd.inviteCodes.temporary.title'),
                value: t('cmd.inviteCodes.temporary.text')
            });
            temporaryInvites.forEach((i) => {
                const maxAge = moment_1.default.duration(i.maxAge, 's').locale(lang).humanize();
                const expires = moment_1.default(i.createdAt).add(i.maxAge, 's').locale(lang).fromNow();
                embed.fields.push({
                    name: `${i.code}`,
                    value: t('cmd.inviteCodes.temporary.entry', {
                        uses: i.uses,
                        maxAge,
                        maxUses: i.maxUses,
                        channel: `<#${i.channelId}>`,
                        expires
                    }),
                    inline: true
                });
            });
        }
        const msg = await this.sendEmbed(await message.author.getDMChannel(), embed);
        if (msg) {
            await this.sendReply(message, `<@!${message.author.id}>, ${t('cmd.inviteCodes.dmSent')}`);
        }
        else {
            await this.sendReply(message, `<@!${message.author.id}>, ${t('cmd.inviteCodes.error')}`);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=inviteCodes.js.map