"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const node_1 = require("@sentry/node");
const chalk_1 = __importDefault(require("chalk"));
const moment_1 = __importDefault(require("moment"));
const ScheduledAction_1 = require("../models/ScheduledAction");
const Service_1 = require("./Service");
const SEND_MESSAGES = 0x00000800;
const NOT_SEND_MESSAGES = 0x7ffff7ff;
class SchedulerService extends Service_1.IMService {
    constructor() {
        super(...arguments);
        this.scheduledActionTimers = new Map();
        this.scheduledActionFunctions = {
            [ScheduledAction_1.ScheduledActionType.unmute]: (g, a) => this.unmute(g, a),
            [ScheduledAction_1.ScheduledActionType.unlock]: (g, a) => this.unlock(g, a)
        };
    }
    async onClientReady() {
        await this.scheduleScheduledActions();
        await super.onClientReady();
    }
    async addScheduledAction(guildId, actionType, args, date, reason) {
        const newId = await this.client.db.saveScheduledAction({
            guildId: guildId,
            actionType: actionType,
            args: args,
            date: date,
            reason: reason
        });
        const action = await this.client.db.getScheduledAction(guildId, newId);
        if (action.date !== null) {
            this.createTimer(action);
        }
    }
    async getScheduledActionsOfType(guildId, type) {
        return this.client.db.getScheduledActionsForGuildByType(guildId, type);
    }
    createTimer(action) {
        const millisUntilAction = Math.max(1000, moment_1.default(action.date).diff(moment_1.default(), 'milliseconds'));
        const func = async () => {
            const guild = this.client.guilds.get(action.guildId);
            if (!guild) {
                console.error('COULD NOT FIND GUILD FOR SCHEDULED FUNCTION', action.guildId);
                return;
            }
            try {
                const scheduledFunc = this.scheduledActionFunctions[action.actionType];
                if (scheduledFunc) {
                    await scheduledFunc(guild, JSON.parse(action.args));
                }
                await this.client.db.removeScheduledAction(action.guildId, action.id);
            }
            catch (error) {
                node_1.withScope((scope) => {
                    scope.setExtra('action', JSON.stringify(action));
                    node_1.captureException(error);
                });
            }
        };
        console.log(`Scheduling timer in ${chalk_1.default.blue(millisUntilAction)}ms for action ${chalk_1.default.blue(action.id)}`);
        const timer = setTimeout(func, millisUntilAction);
        this.scheduledActionTimers.set(action.id, timer);
    }
    async removeScheduledAction(guildId, actionId) {
        const timer = this.scheduledActionTimers.get(actionId);
        if (timer) {
            clearTimeout(timer);
            this.scheduledActionTimers.delete(actionId);
        }
        await this.client.db.removeScheduledAction(guildId, actionId);
    }
    async scheduleScheduledActions() {
        let actions = await this.client.db.getScheduledActionsForGuilds(this.client.guilds.map((g) => g.id));
        actions = actions.filter((a) => a.date !== null);
        console.log(`Scheduling ${chalk_1.default.blue(actions.length)} actions from DB`);
        actions.forEach((action) => this.createTimer(action));
    }
    //////////////////////////
    // Scheduler Functions
    //////////////////////////
    async unmute(guild, { memberId, roleId }) {
        console.log('SCHEDULED TASK: UNMUTE', guild.id, memberId);
        let member = guild.members.get(memberId);
        if (!member) {
            member = await guild.getRESTMember(memberId);
        }
        if (!member) {
            console.error('SCHEDULED TASK: UNMUTE: COULD NOT FIND MEMBER', memberId);
            return;
        }
        await member.removeRole(roleId, 'Timed unmute');
    }
    async unlock(guild, { channelId, roleId, wasAllowed }) {
        console.log('SCHEDULED TASK: UNLOCK', guild.id, channelId, roleId);
        let channel = guild.channels.get(channelId);
        if (!channel) {
            await guild.getRESTChannels();
            channel = guild.channels.get(channelId);
        }
        if (!channel) {
            console.error('SCHEDULED TASK: UNLOCK: COULD NOT FIND CHANNEL', channelId);
            return;
        }
        const override = channel.permissionOverwrites.get(roleId);
        const newAllow = wasAllowed ? SEND_MESSAGES : 0;
        // tslint:disable: no-bitwise
        await this.client.editChannelPermission(channelId, roleId, override ? override.allow | newAllow : newAllow, override ? override.deny & NOT_SEND_MESSAGES : 0, 'role', 'Channel lockdown');
    }
}
exports.SchedulerService = SchedulerService;
//# sourceMappingURL=Scheduler.js.map