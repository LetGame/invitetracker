"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const Command_1 = require("../../framework/commands/Command");
const resolvers_1 = require("../../framework/resolvers");
const types_1 = require("../../types");
const Chart_1 = require("../models/Chart");
const DEFAULT_DAYS = 30;
const COLORS = ['blue', 'red', 'black'];
class default_1 extends Command_1.Command {
    constructor(client) {
        super(client, {
            name: types_1.InvitesCommand.graph,
            aliases: ['g', 'chart'],
            args: [
                {
                    name: 'type',
                    resolver: new resolvers_1.EnumResolver(client, Object.values(types_1.ChartType)),
                    required: true
                },
                {
                    name: 'from',
                    resolver: resolvers_1.DateResolver
                },
                {
                    name: 'to',
                    resolver: resolvers_1.DateResolver
                }
            ],
            group: types_1.CommandGroup.Other,
            guildOnly: true,
            defaultAdminOnly: false,
            extraExamples: ['!graph joins', '!graph leaves', '!graph usage']
        });
    }
    async action(message, [type, from, to], flags, { guild, t }) {
        if (!to) {
            to = moment_1.default();
        }
        if (!from) {
            from = to.clone().subtract(DEFAULT_DAYS, 'days');
        }
        from = from.startOf('day');
        to = to.endOf('day');
        const days = to.diff(from, 'days');
        if (days < 5) {
            await this.sendReply(message, t('cmd.graph.minDays', { days: 5 }));
            return;
        }
        else if (days > 120) {
            await this.sendReply(message, t('cmd.graph.maxDays', { days: 120 }));
            return;
        }
        let title = '';
        let description = '';
        const dates = [];
        const vs = [];
        for (const curr = from.clone(); to.isSameOrAfter(curr, 'days'); curr.add(1, 'days')) {
            dates.push(curr.clone());
        }
        const addDataset = () => {
            const map = new Map();
            dates.forEach((date) => map.set(date.format('YYYY-MM-DD'), 0));
            vs.push(map);
            return map;
        };
        if (type === types_1.ChartType.joinsAndLeaves) {
            title = t('cmd.graph.joinsAndLeaves.title');
            description = t('cmd.graph.joinsAndLeaves.text');
            const joinsMap = addDataset();
            const fs = await this.client.db.getJoinsPerDay(guild.id, from.toDate(), to.toDate());
            fs.forEach((join) => joinsMap.set(`${join.year}-${`${join.month}`.padStart(2, '0')}-${`${join.day}`.padStart(2, '0')}`, join.total));
            const leavesMap = addDataset();
            const lvs = await this.client.db.getLeavesPerDay(guild.id, from.toDate(), to.toDate());
            lvs.forEach((leave) => leavesMap.set(`${leave.year}-${`${leave.month}`.padStart(2, '0')}-${`${leave.day}`.padStart(2, '0')}`, Number(leave.total)));
        }
        else if (type === types_1.ChartType.joins) {
            title = t('cmd.graph.joins.title');
            description = t('cmd.graph.joins.text');
            const map = addDataset();
            const joins = await this.client.db.getJoinsPerDay(guild.id, from.toDate(), to.toDate());
            joins.forEach((join) => map.set(`${join.year}-${`${join.month}`.padStart(2, '0')}-${`${join.day}`.padStart(2, '0')}`, join.total));
        }
        else if (type === types_1.ChartType.leaves) {
            title = t('cmd.graph.leaves.title');
            description = t('cmd.graph.leaves.text');
            const map = addDataset();
            const leaves = await this.client.db.getLeavesPerDay(guild.id, from.toDate(), to.toDate());
            leaves.forEach((leave) => map.set(`${leave.year}-${`${leave.month}`.padStart(2, '0')}-${`${leave.day}`.padStart(2, '0')}`, leave.total));
        }
        const datasets = [];
        for (const v of vs) {
            const color = COLORS[datasets.length];
            const data = [...v.entries()].sort((a, b) => a[0].localeCompare(b[0])).map((e) => e[1]);
            datasets.push({
                label: 'Data',
                borderColor: color,
                pointBorderColor: color,
                pointBackgroundColor: color,
                pointBorderWidth: 0,
                pointRadius: 1,
                fill: true,
                borderWidth: 2,
                data,
                datalabels: {
                    align: 'end',
                    anchor: 'end'
                }
            });
        }
        const config = {
            labels: dates.map((d) => d.format('DD.MM.YYYY')),
            datasets
        };
        const buffer = await Chart_1.renderChart('line', config);
        const embed = this.createEmbed({
            title,
            description,
            image: {
                url: 'attachment://chart.png'
            }
        });
        await message.channel.createMessage({ embed }, { file: buffer, name: 'chart.png' });
    }
}
exports.default = default_1;
//# sourceMappingURL=graph.js.map