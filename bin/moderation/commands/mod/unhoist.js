"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../framework/commands/Command");
const types_1 = require("../../../types");
const Moderation_1 = require("../../services/Moderation");
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.ModerationCommand.unhoist,
            aliases: ['dehoist'],
            args: [],
            group: types_1.CommandGroup.Moderation,
            defaultAdminOnly: true,
            guildOnly: true
        });
    }
    async action(message, args, flags, { guild, t, settings }) {
        const total = guild.memberCount;
        const batches = Math.ceil(total / 1000);
        const embed = this.createEmbed({
            title: t('cmd.unhoist.title'),
            description: t('cmd.unhoist.starting')
        });
        const msg = await this.sendReply(message, embed);
        if (!msg) {
            return;
        }
        let processed = 0;
        let changed = 0;
        let excluded = 0;
        let errored = 0;
        let lastId = undefined;
        embed.description = t('cmd.unhoist.processing', {
            total,
            processed,
            changed,
            excluded,
            errored
        });
        await msg.edit({ embed });
        for (let i = 0; i < batches; i++) {
            const members = await guild.getRESTMembers(1000, lastId);
            lastId = members[members.length - 1].user.id;
            for (const member of members) {
                processed++;
                if (processed % 500 === 0) {
                    embed.description = t('cmd.unhoist.processing', {
                        total,
                        processed,
                        changed,
                        excluded,
                        errored
                    });
                    await msg.edit({ embed });
                }
                // Ignore bots
                if (member.bot) {
                    excluded++;
                    continue;
                }
                // If moderated roles are set then only moderate those roles
                if (settings.autoModModeratedRoles && settings.autoModModeratedRoles.length > 0) {
                    if (!settings.autoModModeratedRoles.some((r) => member.roles.indexOf(r) >= 0)) {
                        excluded++;
                        continue;
                    }
                }
                // Don't moderate ignored roles
                if (settings.autoModIgnoredRoles && settings.autoModIgnoredRoles.some((ir) => member.roles.indexOf(ir) >= 0)) {
                    excluded++;
                    continue;
                }
                const name = member.nick ? member.nick : member.username;
                if (!Moderation_1.NAME_HOIST_REGEX.test(name)) {
                    continue;
                }
                const newName = (Moderation_1.NAME_DEHOIST_PREFIX + ' ' + name).substr(0, 32);
                await guild
                    .editMember(member.user.id, { nick: newName }, 'Unhoist command')
                    .then(() => changed++)
                    .catch(() => errored++);
            }
        }
        embed.description = t('cmd.unhoist.done', {
            total,
            processed,
            changed,
            excluded,
            errored
        });
        await msg.edit({ embed });
    }
}
exports.default = default_1;
//# sourceMappingURL=unhoist.js.map