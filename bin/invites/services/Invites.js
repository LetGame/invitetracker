"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitesService = void 0;
const moment_1 = __importDefault(require("moment"));
const GuildSetting_1 = require("../../framework/models/GuildSetting");
const Join_1 = require("../../framework/models/Join");
const Service_1 = require("../../framework/services/Service");
const types_1 = require("../../types");
class InvitesService extends Service_1.IMService {
    async getInviteCounts(guildId, memberId) {
        const inviteCodePromise = this.client.db.getInviteCodeTotalForMember(guildId, memberId);
        const joinsPromise = this.client.db.getInvalidatedJoinsForMember(guildId, memberId);
        const customInvitesPromise = this.client.db.getCustomInviteTotalForMember(guildId, memberId);
        const [regular, js, custom] = await Promise.all([inviteCodePromise, joinsPromise, customInvitesPromise]);
        let fake = 0;
        let leave = 0;
        js.forEach((j) => {
            if (j.invalidatedReason === Join_1.JoinInvalidatedReason.fake) {
                fake -= Number(j.total);
            }
            else if (j.invalidatedReason === Join_1.JoinInvalidatedReason.leave) {
                leave -= Number(j.total);
            }
        });
        return {
            regular,
            custom,
            fake,
            leave,
            total: regular + custom + fake + leave
        };
    }
    async generateLeaderboard(guildId) {
        const inviteCodePromise = this.client.db.getInviteCodesForGuild(guildId);
        const joinsPromise = this.client.db.getJoinsForGuild(guildId);
        const customInvitesPromise = this.client.db.getCustomInvitesForGuild(guildId);
        // TODO: This is typed as "any" because of a typescript bug https://github.com/microsoft/TypeScript/issues/34925
        const [invCodes, js, customInvs] = await Promise.all([
            inviteCodePromise,
            joinsPromise,
            customInvitesPromise
        ]);
        const entries = new Map();
        invCodes.forEach((inv) => {
            const id = inv.id;
            entries.set(id, {
                id,
                name: inv.name,
                discriminator: inv.discriminator,
                total: Number(inv.total),
                regular: Number(inv.total),
                custom: 0,
                fakes: 0,
                leaves: 0
            });
        });
        js.forEach((join) => {
            const id = join.id;
            let fake = 0;
            let leave = 0;
            if (join.invalidatedReason === Join_1.JoinInvalidatedReason.fake) {
                fake += Number(join.total);
            }
            else {
                leave += Number(join.total);
            }
            const entry = entries.get(id);
            if (entry) {
                entry.total -= fake + leave;
                entry.fakes -= fake;
                entry.leaves -= leave;
            }
            else {
                entries.set(id, {
                    id,
                    name: join.name,
                    discriminator: join.discriminator,
                    total: -(fake + leave),
                    regular: 0,
                    custom: 0,
                    fakes: -fake,
                    leaves: -leave
                });
            }
        });
        customInvs.forEach((inv) => {
            const id = inv.id;
            const custom = Number(inv.total);
            const entry = entries.get(id);
            if (entry) {
                entry.total += custom;
                entry.custom += custom;
            }
            else {
                entries.set(id, {
                    id,
                    name: inv.name,
                    discriminator: inv.discriminator,
                    total: custom,
                    regular: 0,
                    custom: custom,
                    fakes: 0,
                    leaves: 0
                });
            }
        });
        return [...entries.entries()]
            .filter(([k, entry]) => entry.total > 0)
            .sort(([, a], [, b]) => {
            const diff = b.total - a.total;
            return diff !== 0 ? diff : a.name ? a.name.localeCompare(b.name) : 0;
        })
            .map(([, e]) => e);
    }
    async fillJoinLeaveTemplate(template, guild, member, invites, { invite, inviter }) {
        if (typeof template !== 'string') {
            template = JSON.stringify(template);
        }
        let numJoins = 0;
        if (template.indexOf('{numJoins}') >= 0) {
            numJoins = await this.client.db.getTotalJoinsForMember(guild.id, member.id);
        }
        let firstJoin = 'never';
        if (template.indexOf('{firstJoin:') >= 0) {
            const temp = await this.client.db.getFirstJoinForMember(guild.id, member.id);
            if (temp) {
                firstJoin = moment_1.default(temp.createdAt);
            }
        }
        let prevJoin = 'never';
        if (template.indexOf('{previousJoin:') >= 0) {
            const temp = await this.client.db.getPreviousJoinForMember(guild.id, member.id);
            if (temp) {
                prevJoin = moment_1.default(temp.createdAt);
            }
        }
        const memberFullName = member.user.username + '#' + member.user.discriminator;
        const inviterFullName = inviter.user.username + '#' + inviter.user.discriminator;
        let memberName = member.nick ? member.nick : member.user.username;
        const encodedMemberName = JSON.stringify(memberName);
        memberName = encodedMemberName.substring(1, encodedMemberName.length - 1);
        let invName = inviter.nick ? inviter.nick : inviter.user.username;
        const encodedInvName = JSON.stringify(invName);
        invName = encodedInvName.substring(1, encodedInvName.length - 1);
        const joinedAt = moment_1.default(member.joinedAt);
        const createdAt = moment_1.default(member.user.createdAt);
        return this.client.msg.fillTemplate(guild, template, {
            inviteCode: invite.code,
            memberId: member.id,
            memberName: memberName,
            memberFullName: memberFullName,
            memberMention: `<@${member.id}>`,
            memberImage: member.user.avatarURL,
            numJoins: `${numJoins}`,
            inviterId: inviter.user.id,
            inviterName: invName,
            inviterFullName: inviterFullName,
            inviterMention: `<@${inviter.user.id}>`,
            inviterImage: inviter.user.avatarURL,
            numInvites: `${invites.total}`,
            numRegularInvites: `${invites.regular}`,
            numBonusInvites: `${invites.custom}`,
            numFakeInvites: `${invites.fake}`,
            numLeaveInvites: `${invites.leave}`,
            memberCount: `${guild.memberCount}`,
            channelMention: `<#${invite.channel.id}>`,
            channelName: invite.channel.name
        }, {
            memberCreated: createdAt,
            firstJoin: firstJoin,
            previousJoin: prevJoin,
            joinedAt: joinedAt
        });
    }
    async promoteIfQualified(guild, member, me, totalInvites) {
        let nextRankName = '';
        let nextRank = null;
        const settings = await this.client.cache.guilds.get(guild.id);
        const style = settings.rankAssignmentStyle;
        const allRanks = await this.client.cache.ranks.get(guild.id);
        // Return early if we don't have any ranks so we do not
        // get any permission issues for MANAGE_ROLES
        // or if we're trying to promote a bot
        if (allRanks.length === 0 || member.bot) {
            return;
        }
        let highest = null;
        let dangerous = [];
        let reached = [];
        const notReached = [];
        for (const rank of allRanks) {
            const role = guild.roles.get(rank.roleId);
            if (!role) {
                console.log(`ROLE ${rank.roleId} FOR RANK DOES NOT EXIST IN GUILD ${rank.guildId}`);
                continue;
            }
            if (rank.numInvites <= totalInvites) {
                reached.push(role);
                if (!highest || highest.position < role.position) {
                    highest = role;
                }
            }
            else {
                notReached.push(role);
                // Rank requires more invites
                if (!nextRank || rank.numInvites < nextRank.numInvites) {
                    // Next rank is the one with lowest invites needed
                    nextRank = rank;
                    nextRankName = role.name;
                }
            }
        }
        let myRole;
        me.roles.forEach((r) => {
            const role = guild.roles.get(r);
            if (role && (!myRole || myRole.position < role.position)) {
                myRole = role;
            }
        });
        const tooHighRoles = guild.roles.filter((r) => r.position > myRole.position);
        let shouldHave = [];
        let shouldNotHave = notReached.filter((r) => tooHighRoles.includes(r) && member.roles.includes(r.id));
        if (highest && !member.roles.includes(highest.id)) {
            const rankChannelId = settings.rankAnnouncementChannel;
            if (rankChannelId) {
                const rankChannel = guild.channels.get(rankChannelId);
                // Check if it's a valid channel
                if (rankChannel) {
                    const rankMessageFormat = settings.rankAnnouncementMessage;
                    if (rankMessageFormat) {
                        const msg = await this.client.msg.fillTemplate(guild, rankMessageFormat, {
                            memberId: member.id,
                            memberName: member.user.username,
                            memberFullName: member.user.username + '#' + member.user.discriminator,
                            memberMention: `<@${member.id}>`,
                            memberImage: member.user.avatarURL,
                            rankMention: `<@&${highest.id}>`,
                            rankName: highest.name,
                            totalInvites: totalInvites.toString()
                        });
                        rankChannel
                            .createMessage(typeof msg === 'string' ? msg : { embed: msg })
                            .then((m) => m.addReaction('🎉'))
                            .catch(() => undefined);
                    }
                }
                else {
                    console.error(`Guild ${guild.id} has invalid ` + `rank announcement channel ${rankChannelId}`);
                    await this.client.cache.guilds.setOne(guild.id, GuildSetting_1.GuildSettingsKey.rankAnnouncementChannel, null);
                }
            }
        }
        if (me.permission.has(types_1.GuildPermission.MANAGE_ROLES)) {
            // Filter dangerous roles
            dangerous = reached.filter((r) => r.permissions.has(types_1.GuildPermission.ADMINISTRATOR) || r.permissions.has(types_1.GuildPermission.MANAGE_GUILD));
            reached = reached.filter((r) => dangerous.indexOf(r) === -1);
            if (style !== GuildSetting_1.RankAssignmentStyle.onlyAdd) {
                // Remove roles that we haven't reached yet
                notReached
                    .filter((r) => !tooHighRoles.includes(r) && member.roles.includes(r.id))
                    .forEach((r) => this.client
                    .removeGuildMemberRole(guild.id, member.id, r.id, 'Not have enough invites for rank')
                    .catch(() => undefined));
            }
            if (style === GuildSetting_1.RankAssignmentStyle.all || style === GuildSetting_1.RankAssignmentStyle.onlyAdd) {
                // Add all roles that we've reached to the member
                const newRoles = reached.filter((r) => !member.roles.includes(r.id));
                // Roles that the member should have but we can't assign
                shouldHave = newRoles.filter((r) => tooHighRoles.includes(r));
                // Assign only the roles that we can assign
                newRoles
                    .filter((r) => !tooHighRoles.includes(r))
                    .forEach((r) => this.client
                    .addGuildMemberRole(guild.id, member.user.id, r.id, 'Reached a new rank by invites')
                    .catch(() => undefined));
            }
            else if (style === GuildSetting_1.RankAssignmentStyle.highest) {
                // Only add the highest role we've reached to the member
                // Remove roles that we've reached but aren't the highest
                const oldRoles = reached.filter((r) => r !== highest && member.roles.includes(r.id));
                // Add more roles that we shouldn't have
                shouldNotHave = shouldNotHave.concat(oldRoles.filter((r) => tooHighRoles.includes(r)));
                // Remove the old ones from the member
                oldRoles
                    .filter((r) => !tooHighRoles.includes(r))
                    .forEach((r) => this.client
                    .removeGuildMemberRole(guild.id, member.id, r.id, 'Only keeping highest rank')
                    .catch(() => undefined));
                // Add the highest one if we don't have it yet
                if (highest && !member.roles.includes(highest.id)) {
                    if (!tooHighRoles.includes(highest)) {
                        this.client
                            .addGuildMemberRole(guild.id, member.id, highest.id, 'Reached a new rank by invites')
                            .catch(() => undefined);
                    }
                    else {
                        shouldHave = [highest];
                    }
                }
            }
        }
        else {
            // TODO: Notify user about the fact that he deserves a promotion, but it
            // cannot be given to him because of missing permissions
        }
        return {
            numRanks: allRanks.length,
            nextRank,
            nextRankName,
            shouldHave,
            shouldNotHave,
            dangerous
        };
    }
}
exports.InvitesService = InvitesService;
//# sourceMappingURL=Invites.js.map