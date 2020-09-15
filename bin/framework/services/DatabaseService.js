"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const types_1 = require("../../types");
const util_1 = require("../../util");
const Join_1 = require("../models/Join");
const Service_1 = require("./Service");
const GLOBAL_SHARD_ID = 0;
var TABLE;
(function (TABLE) {
    TABLE["botSettings"] = "`botSettings`";
    TABLE["channels"] = "`channels`";
    TABLE["commandUsages"] = "`commandUsages`";
    TABLE["customInvites"] = "`customInvites`";
    TABLE["dbStats"] = "`dbStats`";
    TABLE["guilds"] = "`guilds`";
    TABLE["guildSettings"] = "`guildSettings`";
    TABLE["incidents"] = "`incidents`";
    TABLE["inviteCodes"] = "`inviteCodes`";
    TABLE["inviteCodeSettings"] = "`inviteCodeSettings`";
    TABLE["joins"] = "`joins`";
    TABLE["leaves"] = "`leaves`";
    TABLE["logs"] = "`logs`";
    TABLE["members"] = "`members`";
    TABLE["memberSettings"] = "`memberSettings`";
    TABLE["messages"] = "`messages`";
    TABLE["musicNodes"] = "`musicNodes`";
    TABLE["premiumSubscriptionGuilds"] = "`premiumSubscriptionGuilds`";
    TABLE["premiumSubscriptions"] = "`premiumSubscriptions`";
    TABLE["punishmentConfigs"] = "`punishmentConfigs`";
    TABLE["punishments"] = "`punishments`";
    TABLE["ranks"] = "`ranks`";
    TABLE["reactionRoles"] = "`reactionRoles`";
    TABLE["rolePermissions"] = "`rolePermissions`";
    TABLE["roles"] = "`roles`";
    TABLE["scheduledActions"] = "`scheduledActions`";
    TABLE["strikeConfigs"] = "`strikeConfigs`";
    TABLE["strikes"] = "`strikes`";
})(TABLE || (TABLE = {}));
class DatabaseService extends Service_1.IMService {
    constructor(client) {
        super(client);
        this.dbCount = 1;
        this.pools = new Map();
        this.guilds = new Set();
        this.doneGuilds = new Set();
        this.users = new Set();
        this.doneUsers = new Set();
        this.logActions = [];
        this.cmdUsages = [];
        this.incidents = [];
        for (const db of client.config.databases) {
            const range = db.range;
            delete db.range;
            const pool = promise_1.default.createPool(db);
            for (let i = range.from; i <= range.to; i++) {
                this.pools.set(i, pool);
            }
            this.dbCount = Math.max(this.dbCount, range.to);
        }
        console.log(`We're connected to ${this.dbCount} db shards on ${client.config.databases.length} different servers`);
        setInterval(() => this.syncDB(), 10000);
    }
    getDbInfo(dbShardOrGuildId) {
        if (typeof dbShardOrGuildId === 'number') {
            return [`\`im_${dbShardOrGuildId}\``, this.pools.get(dbShardOrGuildId)];
        }
        else {
            const db = util_1.getShardIdForGuild(dbShardOrGuildId, this.dbCount);
            return [`\`im_${db}\``, this.pools.get(db)];
        }
    }
    getDbShardForGuild(guildId) {
        return util_1.getShardIdForGuild(guildId, this.dbCount);
    }
    async findOne(shard, table, where, values) {
        const [db, pool] = this.getDbInfo(shard);
        const [rows] = await pool.query(`SELECT ${table}.* FROM ${db}.${table} WHERE ${where} LIMIT 1`, values);
        return rows[0];
    }
    async findMany(shard, table, where, values) {
        const [db, pool] = this.getDbInfo(shard);
        const [rows] = await pool.query(`SELECT ${table}.* FROM ${db}.${table} WHERE ${where}`, values);
        return rows;
    }
    async findManyOnSpecificShards(table, where, values, selector = (o) => o, dataSelector = (o) => o) {
        const map = new Map();
        for (const value of values) {
            const [id, pool] = this.getDbInfo(selector(value));
            const poolData = map.get(pool);
            if (poolData) {
                const shardData = poolData.get(id);
                if (shardData) {
                    shardData.push(dataSelector(value));
                }
                else {
                    poolData.set(id, [dataSelector(value)]);
                }
            }
            else {
                const shardData = new Map();
                shardData.set(id, [value]);
                map.set(pool, shardData);
            }
        }
        const promises = [];
        for (const [pool, poolData] of map.entries()) {
            const queries = [];
            const poolValues = [];
            for (const [db, vals] of poolData.entries()) {
                queries.push(`SELECT ${table}.* FROM ${db}.${table} WHERE ${where}`);
                poolValues.push(vals);
            }
            const query = queries.join(' UNION ');
            promises.push(pool.query(query, poolValues).then(([rs]) => rs));
        }
        const rows = await Promise.all(promises);
        return rows.reduce((acc, val) => acc.concat(val), []);
    }
    async insertOrUpdate(table, cols, updateCols, values, selector) {
        const colQuery = cols.map((c) => `\`${c}\``).join(',');
        const updateQuery = updateCols.length > 0
            ? `ON DUPLICATE KEY UPDATE ${updateCols.map((u) => `\`${u}\` = VALUES(\`${u}\`)`).join(',')}`
            : '';
        const map = new Map();
        for (const value of values) {
            const [id, pool] = this.getDbInfo(selector(value));
            const poolData = map.get(id);
            if (poolData) {
                poolData[1].push(value);
            }
            else {
                map.set(id, [pool, [value]]);
            }
        }
        const oks = [];
        for (const [db, [pool, rawVals]] of map.entries()) {
            const vals = rawVals.map((val) => cols.map((col) => {
                let v = val[col];
                if (v instanceof Date) {
                    return v;
                }
                else if (typeof v === 'object' && v !== null) {
                    v = JSON.stringify(v);
                }
                return v;
            }));
            const query = `INSERT INTO ${db}.${table} (${colQuery}) VALUES ? ${updateQuery}`;
            const [ok] = await pool.query(query, [vals]);
            oks.push(ok);
        }
        return oks;
    }
    async delete(shard, table, where, values) {
        const [db, pool] = this.getDbInfo(shard);
        const [ok] = await pool.query(`DELETE FROM ${db}.${table} WHERE ${where}`, values);
        return ok;
    }
    // ---------
    //   Guild
    // ---------
    async getGuild(id) {
        return this.findOne(id, TABLE.guilds, '`id` = ?', [id]);
    }
    async getBannedGuilds(ids) {
        return await this.findManyOnSpecificShards(TABLE.guilds, '`id` IN (?) AND `banReason` IS NOT NULL', ids);
    }
    async saveGuilds(guilds) {
        await this.insertOrUpdate(TABLE.guilds, ['id', 'name', 'icon', 'memberCount', 'banReason', 'deletedAt'], ['name', 'icon', 'memberCount', 'banReason', 'deletedAt'], guilds, (g) => g.id);
    }
    // ------------------
    //   Guild settings
    // ------------------
    async getGuildSettings(guildId) {
        return this.findOne(guildId, TABLE.guildSettings, '`guildId` = ?', [guildId]);
    }
    async saveGuildSettings(settings) {
        await this.insertOrUpdate(TABLE.guildSettings, ['guildId', 'value'], ['value'], [settings], (s) => s.guildId);
    }
    // ------------
    //   Channels
    // ------------
    async saveChannels(channels) {
        await this.insertOrUpdate(TABLE.channels, ['guildId', 'id', 'name'], ['name'], channels, (c) => c.guildId);
    }
    // -----------
    //   Members
    // -----------
    async getMember(guildId, id) {
        return this.findOne(guildId, TABLE.members, '`id` = ?', [id]);
    }
    async getMembersByName(guildId, name, discriminator) {
        return this.findMany(guildId, TABLE.members, '`name` LIKE ?' + (discriminator ? ' AND `discriminator` LIKE ?' : ''), [`%${name}%`, `%${discriminator}%`]);
    }
    async saveMembers(members) {
        await this.insertOrUpdate(TABLE.members, ['id', 'name', 'discriminator'], ['name', 'discriminator'], members, (m) => m.guildId);
    }
    // -------------------
    //   Member settings
    // -------------------
    async getMemberSettingsForGuild(guildId) {
        return this.findMany(guildId, TABLE.memberSettings, '`guildId` = ?', [guildId]);
    }
    async saveMemberSettings(settings) {
        await this.insertOrUpdate(TABLE.memberSettings, ['guildId', 'memberId', 'value'], ['value'], [settings], (s) => s.guildId);
    }
    // ---------
    //   Roles
    // ---------
    async saveRoles(roles) {
        await this.insertOrUpdate(TABLE.roles, ['id', 'createdAt', 'guildId', 'name', 'color'], ['name', 'color'], roles, (r) => r.guildId);
    }
    // ---------
    //   Ranks
    // ---------
    async getRanksForGuild(guildId) {
        return this.findMany(guildId, TABLE.ranks, '`guildId` = ?', [guildId]);
    }
    async saveRank(rank) {
        await this.insertOrUpdate(TABLE.ranks, ['guildId', 'roleId', 'numInvites', 'description'], ['numInvites', 'description'], [rank], (r) => r.guildId);
    }
    async removeRank(guildId, roleId) {
        await this.delete(guildId, TABLE.ranks, `\`roleId\` = ?`, [roleId]);
    }
    // --------------------
    //   Role permissions
    // --------------------
    async getRolePermissions(guildId, roleId, cmd) {
        return this.findOne(guildId, TABLE.rolePermissions, '`roleId` = ? AND `command` = ?', [
            roleId,
            cmd
        ]);
    }
    async getRolePermissionsForGuild(guildId, cmd) {
        const [db, pool] = this.getDbInfo(guildId);
        const cmdQuery = cmd ? `AND rp.\`command\` = ?` : '';
        const [rows] = await pool.query(`SELECT rp.*, r.name as roleName ` +
            `FROM ${db}.${TABLE.rolePermissions} rp  ` +
            `INNER JOIN ${db}.${TABLE.roles} r ON r.\`id\` = rp.\`roleId\` ` +
            `WHERE r.\`guildId\` = ? ${cmdQuery}`, [guildId, cmd]);
        return rows;
    }
    async saveRolePermissions(guildId, rolePermissions) {
        await this.insertOrUpdate(TABLE.rolePermissions, ['roleId', 'command'], [], rolePermissions, (rp) => guildId);
    }
    async removeRolePermissions(guildId, roleId, command) {
        await this.delete(guildId, TABLE.rolePermissions, '`roleId` = ? AND `command` = ?', [roleId, command]);
    }
    // --------------
    //   InviteCode
    // --------------
    async getAllInviteCodesForGuilds(guildIds) {
        return this.findManyOnSpecificShards(TABLE.inviteCodes, '`guildId` IN(?)', guildIds);
    }
    async getInviteCodesForGuild(guildId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query('SELECT SUM(ic.`uses` - ic.`clearedAmount`) AS total, ic.`inviterId` AS id, m.`name` AS name, m.`discriminator` AS discriminator ' +
            `FROM ${db}.${TABLE.inviteCodes} ic ` +
            `INNER JOIN ${db}.${TABLE.members} m ON m.\`id\` = ic.\`inviterId\` ` +
            'WHERE ic.`guildId` = ? AND ic.`uses` > ic.`clearedAmount` ' +
            'GROUP BY ic.`inviterId`', [guildId]);
        return rows;
    }
    async getInviteCodesForMember(guildId, memberId) {
        return this.findMany(guildId, TABLE.inviteCodes, '`guildId` = ? AND `inviterId` = ? ORDER BY `uses` DESC', [guildId, memberId]);
    }
    async getInviteCodeTotalForMember(guildId, memberId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query(`SELECT SUM(\`uses\` - \`clearedAmount\`) AS total FROM ${db}.${TABLE.inviteCodes} WHERE \`guildId\` = ? AND \`inviterId\` = ? AND \`uses\` > 0`, [guildId, memberId]);
        if (rows.length > 0) {
            const num = Number(rows[0].total);
            return isFinite(num) ? num : 0;
        }
        return 0;
    }
    async updateInviteCodeClearedAmount(clearedAmount, guildId, memberId) {
        const [db, pool] = this.getDbInfo(guildId);
        const memberQuery = memberId ? 'AND `inviterId` = ?' : '';
        const clearColumn = typeof clearedAmount === 'number' ? '?' : '??';
        await pool.query(`UPDATE ${db}.${TABLE.inviteCodes} SET \`clearedAmount\` = ${clearColumn} WHERE \`guildId\` = ? ${memberQuery}`, [clearedAmount, guildId, memberId]);
    }
    async incrementInviteCodesUse(guildId, codes) {
        const [db, pool] = this.getDbInfo(guildId);
        await pool.query(`UPDATE ${db}.${TABLE.inviteCodes} SET \`uses\` = \`uses\` + 1 WHERE \`code\` IN(?)`, [codes]);
    }
    async saveInviteCodes(inviteCodes) {
        await this.insertOrUpdate(TABLE.inviteCodes, [
            'guildId',
            'createdAt',
            'channelId',
            'code',
            'isVanity',
            'isWidget',
            'clearedAmount',
            'inviterId',
            'maxAge',
            'maxUses',
            'temporary',
            'uses'
        ], ['uses'], inviteCodes, (ic) => ic.guildId);
    }
    // -----------------------
    //   InviteCode settings
    // -----------------------
    async getInviteCodeSettingsForGuild(guildId) {
        return this.findMany(guildId, TABLE.inviteCodeSettings, '`guildId` = ?', [guildId]);
    }
    async saveInviteCodeSettings(settings) {
        await this.insertOrUpdate(TABLE.inviteCodeSettings, ['guildId', 'inviteCode', 'value'], ['value'], [settings], (s) => s.guildId);
    }
    // ----------------
    //   CustomInvite
    // ----------------
    async getCustomInvitesForMember(guildId, memberId) {
        return this.findMany(guildId, TABLE.customInvites, '`guildId` = ? AND `memberId` = ?', [
            guildId,
            memberId
        ]);
    }
    async getCustomInvitesForGuild(guildId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query('SELECT SUM(ci.`amount`) AS total, ci.`memberId` AS id, m.`name` AS name, m.`discriminator` AS discriminator ' +
            `FROM ${db}.${TABLE.customInvites} ci ` +
            `INNER JOIN ${db}.${TABLE.members} m ON m.\`id\` = ci.\`memberId\` ` +
            'WHERE ci.`guildId` = ? AND ci.`cleared` = 0 ' +
            'GROUP BY ci.`memberId`', [guildId]);
        return rows;
    }
    async getCustomInviteTotalForMember(guildId, memberId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query(`SELECT SUM(\`amount\`) AS total FROM ${db}.${TABLE.customInvites} WHERE \`guildId\` = ? AND \`memberId\` = ? AND \`cleared\` = 0`, [guildId, memberId]);
        if (rows.length > 0) {
            const num = Number(rows[0].total);
            return isFinite(num) ? num : 0;
        }
        return 0;
    }
    async saveCustomInvite(customInvite) {
        const res = await this.insertOrUpdate(TABLE.customInvites, ['guildId', 'memberId', 'creatorId', 'amount', 'reason'], [], [customInvite], (c) => c.guildId);
        return res[0].insertId;
    }
    async clearCustomInvites(cleared, guildId, memberId) {
        const [db, pool] = this.getDbInfo(guildId);
        const memberQuery = memberId ? 'AND `memberId` = ?' : '';
        await pool.query(`UPDATE ${db}.${TABLE.customInvites} SET \`cleared\` = ? WHERE \`guildId\` = ? ${memberQuery}`, [
            cleared ? 1 : 0,
            guildId,
            memberId
        ]);
    }
    // --------
    //   Join
    // --------
    async getJoinsForGuild(guildId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query('SELECT COUNT(j.`id`) AS total, ic.`inviterId` AS id, m.`name` AS name, m.`discriminator` AS discriminator, ' +
            'j.`invalidatedReason` AS invalidatedReason ' +
            `FROM ${db}.${TABLE.joins} j ` +
            `INNER JOIN ${db}.${TABLE.inviteCodes} ic ON ic.\`code\` = j.\`exactMatchCode\` ` +
            `INNER JOIN ${db}.${TABLE.members} m ON m.\`id\` = ic.\`inviterId\` ` +
            'WHERE j.`guildId` = ? AND j.`invalidatedReason` IS NOT NULL AND j.`cleared` = 0 ' +
            'GROUP BY ic.`inviterId`, j.`invalidatedReason`', [guildId]);
        return rows;
    }
    async getMaxJoinIdsForGuild(guildId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query(`SELECT MAX(j.\`id\`) AS id FROM ${db}.${TABLE.joins} j WHERE j.\`guildId\` = ? GROUP BY j.\`exactMatchCode\`, j.\`memberId\``, [guildId]);
        return rows.map((r) => Number(r.id));
    }
    async getInvalidatedJoinsForMember(guildId, memberId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query('SELECT COUNT(j.`id`) AS total, j.`invalidatedReason` AS invalidatedReason ' +
            `FROM ${db}.${TABLE.joins} j ` +
            `INNER JOIN ${db}.${TABLE.inviteCodes} ic ON ic.\`code\` = j.\`exactMatchCode\` ` +
            'WHERE j.`guildId` = ? AND j.`invalidatedReason` IS NOT NULL AND j.`cleared` = 0 AND ic.`inviterId` = ? ' +
            'GROUP BY j.`invalidatedReason`', [guildId, memberId]);
        return rows;
    }
    async getJoinsPerDay(guildId, from, to) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query('SELECT YEAR(`createdAt`) AS year, MONTH(`createdAt`) AS month, DAY(`createdAt`) AS day, COUNT(`id`) AS total ' +
            `FROM ${db}.${TABLE.joins} ` +
            'WHERE `guildId` = ? AND `createdAt` >= ? AND `createdAt` <= ? ' +
            'GROUP BY YEAR(`createdAt`), MONTH(`createdAt`), DAY(`createdAt`)', [guildId, from, to]);
        return rows;
    }
    async getFirstJoinForMember(guildId, memberId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query(`SELECT j.* FROM ${db}.${TABLE.joins} j ` +
            'WHERE j.`guildId` = ? AND j.`memberId` = ? ' +
            'ORDER BY j.`createdAt` ASC LIMIT 1', [guildId, memberId]);
        return rows[0];
    }
    async getPreviousJoinForMember(guildId, memberId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query(`SELECT j.* FROM ${db}.${TABLE.joins} j ` +
            'WHERE j.`guildId` = ? AND j.`memberId` = ? ' +
            'ORDER BY j.`createdAt` DESC LIMIT 1,1', [guildId, memberId]);
        return rows[0];
    }
    async getNewestJoinForMember(guildId, memberId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query('SELECT j.*, m.`id` AS inviterId, m.`name` AS inviterName, m.`discriminator` AS inviterDiscriminator, ' +
            'c.`id` AS channelId, c.`name` AS channelName ' +
            `FROM ${db}.${TABLE.joins} j ` +
            `INNER JOIN ${db}.${TABLE.inviteCodes} ic ON ic.\`code\` = j.\`exactMatchCode\` ` +
            `LEFT JOIN ${db}.${TABLE.members} m ON m.\`id\` = ic.\`inviterId\` ` +
            `LEFT JOIN ${db}.${TABLE.channels} c ON c.\`id\` = ic.\`channelId\` ` +
            'WHERE j.`guildId` = ? AND j.`memberId` = ? ' +
            'ORDER BY j.`createdAt` DESC LIMIT 1', [guildId, memberId]);
        return rows[0];
    }
    async getJoinsForMember(guildId, memberId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query('SELECT j.*, ic.`inviterId` AS inviterId ' +
            `FROM ${db}.${TABLE.joins} j ` +
            `INNER JOIN ${db}.${TABLE.inviteCodes} ic ON ic.\`code\` = j.\`exactMatchCode\` ` +
            'WHERE j.`guildId` = ? AND j.`memberId` = ? ' +
            'ORDER BY j.`createdAt` DESC LIMIT 100', [guildId, memberId]);
        return rows;
    }
    async getTotalJoinsForMember(guildId, memberId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query(`SELECT COUNT(j.\`id\`) AS total FROM ${db}.${TABLE.joins} j WHERE j.\`guildId\` = ? AND j.\`memberId\` = ?`, [guildId, memberId]);
        return Number(rows[0].total);
    }
    async getInvitedMembers(guildId, memberId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query('SELECT j.`memberId` AS memberId, MAX(j.`createdAt`) AS createdAt ' +
            `FROM ${db}.${TABLE.joins} j ` +
            `INNER JOIN ${db}.${TABLE.inviteCodes} ic ON ic.\`code\` = j.\`exactMatchCode\` ` +
            'WHERE j.`guildId` = ? AND `invalidatedReason` IS NULL AND ic.`inviterId` = ? ' +
            'GROUP BY j.`memberId` ' +
            'ORDER BY MAX(j.`createdAt`) DESC ', [guildId, memberId]);
        return rows;
    }
    async updateJoinInvalidatedReason(newInvalidatedReason, guildId, search) {
        const vals = [guildId];
        let reasonQuery = '';
        if (search && typeof search.invalidatedReason !== 'undefined') {
            if (search.invalidatedReason === null) {
                reasonQuery = 'AND `invalidatedReason` IS NULL';
            }
            else {
                reasonQuery = 'AND `invalidatedReason` = ?';
                vals.push(search.invalidatedReason);
            }
        }
        let memberQuery = '';
        if (search && typeof search.memberId !== 'undefined') {
            memberQuery = 'AND `memberId` = ?';
            vals.push(search.memberId);
        }
        let joinQuery = '';
        if (search && typeof search.joinId !== 'undefined') {
            joinQuery = 'AND `id` = ?';
            vals.push(search.joinId);
        }
        let ignoredJoinQuery = '';
        if (search && typeof search.ignoredJoinId !== 'undefined') {
            ignoredJoinQuery = 'AND `id` != ?';
            vals.push(search.ignoredJoinId);
        }
        if (Object.values(Join_1.JoinInvalidatedReason).includes(newInvalidatedReason)) {
            newInvalidatedReason = `'${newInvalidatedReason}'`;
        }
        const [db, pool] = this.getDbInfo(guildId);
        const [ok] = await pool.query(`UPDATE ${db}.${TABLE.joins} SET \`invalidatedReason\` = ${newInvalidatedReason} WHERE \`guildId\` = ? ` +
            `${reasonQuery} ${memberQuery} ${joinQuery} ${ignoredJoinQuery}`, vals);
        return ok.affectedRows;
    }
    async updateJoinClearedStatus(newCleared, guildId, exactMatchCodes) {
        const [db, pool] = this.getDbInfo(guildId);
        const codeQuery = exactMatchCodes.length > 0 ? 'AND `exactMatchCode` IN(?)' : '';
        await pool.query(`UPDATE ${db}.${TABLE.joins} SET \`cleared\` = ? WHERE \`guildId\` = ? ${codeQuery}`, [
            newCleared,
            guildId,
            exactMatchCodes
        ]);
    }
    async saveJoin(join) {
        const res = await this.insertOrUpdate(TABLE.joins, ['guildId', 'createdAt', 'memberId', 'exactMatchCode', 'invalidatedReason', 'cleared'], ['exactMatchCode'], [join], (j) => j.guildId);
        return res[0].insertId;
    }
    // ---------
    //   Leave
    // ---------
    async saveLeave(leave) {
        const res = await this.insertOrUpdate(TABLE.leaves, ['guildId', 'memberId', 'joinId'], ['joinId'], [leave], (l) => l.guildId);
        return res[0].insertId;
    }
    async getLeavesPerDay(guildId, from, to) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query('SELECT YEAR(`createdAt`) AS year, MONTH(`createdAt`) AS month, DAY(`createdAt`) AS day, COUNT(`id`) AS total ' +
            `FROM ${db}.${TABLE.leaves} ` +
            'WHERE `guildId` = ? AND `createdAt` >= ? AND `createdAt` <= ? ' +
            'GROUP BY YEAR(`createdAt`), MONTH(`createdAt`), DAY(`createdAt`)', [guildId, from, to]);
        return rows;
    }
    async subtractLeaves(guildId, autoSubtractLeaveThreshold) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query(`UPDATE ${db}.${TABLE.joins} j ` +
            `LEFT JOIN ${db}.${TABLE.leaves} l ON l.\`joinId\` = j.\`id\` SET \`invalidatedReason\` = ` +
            'CASE WHEN l.`id` IS NULL OR TIMESTAMPDIFF(SECOND, j.`createdAt`, l.`createdAt`) > ? THEN NULL ELSE "leave" END ' +
            'WHERE j.`guildId` = ? AND (j.`invalidatedReason` IS NULL OR j.`invalidatedReason` = "leave")', [autoSubtractLeaveThreshold, guildId]);
        return rows;
    }
    // ----------------
    //   Bot settings
    // ----------------
    async getBotSettings(botId) {
        return this.findOne(GLOBAL_SHARD_ID, TABLE.botSettings, '`id` = ?', [botId]);
    }
    async saveBotSettings(settings) {
        await this.insertOrUpdate(TABLE.botSettings, ['id', 'value'], ['value'], [settings], () => GLOBAL_SHARD_ID);
    }
    // --------
    //   Logs
    // --------
    saveLog(guild, user, action) {
        if (!this.doneGuilds.has(guild.id)) {
            this.guilds.add(guild);
        }
        if (!this.doneUsers.has(user.id)) {
            this.users.add(Object.assign(Object.assign({}, user), { guildId: guild.id }));
        }
        this.logActions.push(action);
    }
    async saveLogs(logs) {
        await this.insertOrUpdate(TABLE.logs, ['guildId', 'memberId', 'action', 'message', 'data'], [], logs, (l) => l.guildId);
    }
    // ------------------
    //   Command usages
    // ------------------
    saveCommandUsage(guild, user, cmdUsage) {
        if (!this.doneGuilds.has(guild.id)) {
            this.guilds.add(guild);
        }
        if (!this.doneUsers.has(user.id)) {
            this.users.add(Object.assign(Object.assign({}, user), { guildId: guild.id }));
        }
        this.cmdUsages.push(cmdUsage);
    }
    async saveCommandUsages(commandUsages) {
        await this.insertOrUpdate(TABLE.commandUsages, ['guildId', 'memberId', 'command', 'args', 'time', 'errored'], [], commandUsages, (c) => c.guildId);
    }
    // -------------
    //   Incidents
    // -------------
    saveIncident(guild, indicent) {
        if (!this.doneGuilds.has(guild.id)) {
            this.guilds.add(guild);
        }
        this.incidents.push(indicent);
    }
    async saveIncidents(indicents) {
        await this.insertOrUpdate(TABLE.incidents, ['guildId', 'error', 'details'], [], indicents, (i) => i.guildId);
    }
    // ---------------
    //   Music nodes
    // ---------------
    async getMusicNodes() {
        const typeFilter = this.client.type === types_1.BotType.custom ? 'isCustom' : this.client.type === types_1.BotType.pro ? 'isPremium' : 'isRegular';
        return this.findMany(GLOBAL_SHARD_ID, TABLE.musicNodes, `${typeFilter} = 1`, []);
    }
    // ---------------------
    //   Scheduled actions
    // ---------------------
    async getScheduledAction(guildId, id) {
        return this.findOne(guildId, TABLE.scheduledActions, '`id` = ?', [id]);
    }
    async getScheduledActionsForGuildByType(guildId, type) {
        return this.findMany(guildId, TABLE.scheduledActions, '`guildId` = ? AND `actionType` = ?', [
            guildId,
            type
        ]);
    }
    async getScheduledActionsForGuilds(guildIds) {
        return this.findManyOnSpecificShards(TABLE.scheduledActions, '`guildId` IN (?) AND date IS NOT NULL', guildIds);
    }
    async saveScheduledAction(action) {
        const res = await this.insertOrUpdate(TABLE.scheduledActions, ['guildId', 'date', 'actionType', 'args', 'reason'], [], [action], (a) => a.guildId);
        return res[0].insertId;
    }
    async removeScheduledAction(guildId, id) {
        await this.delete(guildId, TABLE.scheduledActions, '`id` = ?', [id]);
    }
    // ------------------------
    //   Premium subscription
    // ------------------------
    async getPremiumSubscriptionsForMember(memberId, onlyActive = true, onlyFree = false) {
        return this.findMany(GLOBAL_SHARD_ID, TABLE.premiumSubscriptions, '`memberId` = ? ' + (onlyActive ? 'AND `validUntil` > NOW() ' : '') + (onlyFree ? 'AND `isFreeTier` = 1 ' : ''), [memberId]);
    }
    async savePremiumSubscription(sub) {
        const res = await this.insertOrUpdate(TABLE.premiumSubscriptions, ['memberId', 'validUntil', 'isFreeTier', 'isPatreon', 'isStaff', 'amount', 'maxGuilds', 'reason'], ['validUntil'], [sub], () => GLOBAL_SHARD_ID);
        return res[0].insertId;
    }
    // ------------------------------
    //   Premium subscription guild
    // ------------------------------
    async getPremiumSubscriptionGuildForGuild(guildId, onlyActive = true) {
        const [db, pool] = this.getDbInfo(GLOBAL_SHARD_ID);
        const [rows] = await pool.query(`SELECT psg.* FROM ${db}.${TABLE.premiumSubscriptionGuilds} psg ` +
            `INNER JOIN ${db}.${TABLE.premiumSubscriptions} ps ON ps.\`memberId\` = psg.\`memberId\` ` +
            `WHERE psg.\`guildId\` = ? ` +
            (onlyActive ? `AND ps.\`validUntil\` > NOW() ` : '') +
            `ORDER BY ps.\`validUntil\` DESC ` +
            `LIMIT 1`, [guildId]);
        return rows[0];
    }
    async getPremiumSubscriptionGuildsForMember(memberId) {
        const [db, pool] = this.getDbInfo(GLOBAL_SHARD_ID);
        const [rows] = await pool.query(`SELECT psg.* FROM ${db}.${TABLE.premiumSubscriptionGuilds} psg WHERE psg.\`memberId\` = ?`, [memberId]);
        const guilds = await this.findManyOnSpecificShards(TABLE.guilds, `id IN(?)`, rows.map((r) => r.guildId));
        return rows.map((r) => (Object.assign(Object.assign({}, r), { guildName: (guilds.find((g) => g.id === r.guildId) || { name: r.guildId }).name })));
    }
    async savePremiumSubscriptionGuild(sub) {
        await this.insertOrUpdate(TABLE.premiumSubscriptionGuilds, ['guildId', 'memberId'], [], [sub], () => GLOBAL_SHARD_ID);
    }
    async removePremiumSubscriptionGuild(memberId, guildId) {
        await this.delete(GLOBAL_SHARD_ID, TABLE.premiumSubscriptionGuilds, '`guildId` = ? AND `memberId` = ?', [
            guildId,
            memberId
        ]);
    }
    // ----------
    //   Strike
    // ----------
    async getStrike(guildId, id) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query('SELECT s.*, m.`name` as memberName, m.`discriminator` as memberDiscriminator, m.`createdAt` as memberCreatedAt ' +
            `FROM ${db}.${TABLE.strikes} s INNER JOIN ${db}.${TABLE.members} m ON m.\`id\` = s.\`memberId\` WHERE s.\`guildId\` = ? AND s.\`id\` = ?`, [guildId, id]);
        return rows[0];
    }
    async getStrikesForMember(guildId, memberId) {
        return this.findMany(guildId, TABLE.strikes, '`guildId` = ? AND `memberId` = ?', [guildId, memberId]);
    }
    async getStrikeAmount(guildId, memberId) {
        const [db, pool] = this.getDbInfo(guildId);
        const [rows] = await pool.query(`SELECT SUM(amount) AS total FROM ${db}.${TABLE.strikes} WHERE \`guildId\` = ? AND \`memberId\` = ?`, [guildId, memberId]);
        if (rows.length > 0) {
            const num = Number(rows[0].total);
            return isFinite(num) ? num : 0;
        }
        return 0;
    }
    async saveStrike(strike) {
        await this.insertOrUpdate(TABLE.strikes, ['guildId', 'memberId', 'type', 'amount'], [], [strike], (s) => s.guildId);
    }
    async removeStrike(guildId, id) {
        await this.delete(guildId, TABLE.strikes, '`guildId` = ? AND `id` = ?', [guildId, id]);
    }
    // ------------------
    //   Strike configs
    // ------------------
    async getStrikeConfigsForGuild(guildId) {
        return this.findMany(guildId, TABLE.strikeConfigs, '`guildId` = ? ORDER BY `amount` DESC', [guildId]);
    }
    async saveStrikeConfig(config) {
        await this.insertOrUpdate(TABLE.strikeConfigs, ['guildId', 'type', 'amount'], ['amount'], [config], (c) => c.guildId);
    }
    async removeStrikeConfig(guildId, type) {
        await this.delete(guildId, TABLE.strikeConfigs, '`guildId` = ? AND `type` = ?', [guildId, type]);
    }
    // --------------
    //   Punishment
    // --------------
    async getPunishment(guildId, id) {
        return this.findOne(guildId, TABLE.punishments, '`guildId` = ? AND id = ?', [guildId, id]);
    }
    async savePunishment(punishment) {
        await this.insertOrUpdate(TABLE.punishments, ['guildId', 'type', 'amount', 'args', 'creatorId', 'memberId', 'reason'], [], [punishment], (p) => p.guildId);
    }
    async removePunishment(guildId, id) {
        await this.delete(guildId, TABLE.punishments, '`guildId` = ? AND `id` = ?', [guildId, id]);
    }
    async getPunishmentsForMember(guildId, memberId) {
        return this.findMany(guildId, TABLE.punishments, '`guildId` = ? AND `memberId` = ?', [
            guildId,
            memberId
        ]);
    }
    // ----------------------
    //   Punishment configs
    // ----------------------
    async getPunishmentConfigsForGuild(guildId) {
        return this.findMany(guildId, TABLE.punishmentConfigs, '`guildId` = ? ORDER BY `amount` DESC', [
            guildId
        ]);
    }
    async savePunishmentConfig(config) {
        await this.insertOrUpdate(TABLE.punishmentConfigs, ['guildId', 'type', 'amount', 'args'], ['amount', 'args'], [config], (c) => c.guildId);
    }
    async removePunishmentConfig(guildId, type) {
        await this.delete(guildId, TABLE.punishmentConfigs, '`guildId` = ? AND `type` = ?', [guildId, type]);
    }
    // ------------
    //   Messages
    // ------------
    async getMessageById(guildId, messageId) {
        return this.findOne(guildId, TABLE.messages, '`guildId` = ? AND `id` = ?', [guildId, messageId]);
    }
    async getMessagesForGuild(guildId) {
        return this.findMany(guildId, TABLE.messages, '`guildId` = ?', [guildId]);
    }
    async saveMessage(message) {
        return this.insertOrUpdate(TABLE.messages, ['guildId', 'channelId', 'id', 'content', 'embeds'], ['content', 'embeds'], [message], (m) => m.guildId);
    }
    // ------------------
    //   Reaction roles
    // ------------------
    async getReactionRolesForGuild(guildId) {
        return this.findMany(guildId, TABLE.reactionRoles, '`guildId` = ?', [guildId]);
    }
    async saveReactionRole(reactionRole) {
        return this.insertOrUpdate(TABLE.reactionRoles, ['guildId', 'channelId', 'messageId', 'emoji', 'roleId'], ['roleId'], [reactionRole], (r) => r.guildId);
    }
    async removeReactionRole(guildId, channelId, messageId, emoji) {
        await this.delete(guildId, TABLE.reactionRoles, '`guildId` = ? AND `channelId` = ? AND `messageId` = ? AND `emoji` = ?', [guildId, channelId, messageId, emoji]);
    }
    // ----------------------
    //   DB Sync
    // ----------------------
    async syncDB() {
        if (this.logActions.length === 0 && this.cmdUsages.length === 0 && this.incidents.length === 0) {
            return;
        }
        console.time('syncDB');
        const newGuilds = [...this.guilds.values()];
        this.guilds.clear();
        if (newGuilds.length > 0) {
            await this.client.db.saveGuilds(newGuilds.map((guild) => ({
                id: guild.id,
                name: guild.name,
                icon: guild.iconURL,
                memberCount: guild.memberCount
            })));
            newGuilds.forEach((g) => this.doneGuilds.add(g.id));
        }
        const newUsers = [...this.users.values()];
        this.users.clear();
        if (newUsers.length > 0) {
            await this.client.db.saveMembers(newUsers.map((user) => ({
                id: user.id,
                name: user.username,
                discriminator: user.discriminator,
                guildId: user.guildId
            })));
            newUsers.forEach((u) => this.doneUsers.add(u.id));
        }
        const promises = [];
        if (this.logActions.length > 0) {
            promises.push(this.saveLogs(this.logActions).then(() => (this.logActions = [])));
        }
        if (this.cmdUsages.length > 0) {
            promises.push(this.saveCommandUsages(this.cmdUsages).then(() => (this.cmdUsages = [])));
        }
        if (this.incidents.length > 0) {
            promises.push(this.saveIncidents(this.incidents).then(() => (this.incidents = [])));
        }
        await Promise.all(promises);
        console.timeEnd('syncDB');
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=DatabaseService.js.map