"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@sentry/node");
const chalk_1 = __importDefault(require("chalk"));
const client_1 = require("./client");
const pkg = require('../package.json');
const config = require('../config.json');
// First two arguments are "node" and "<filename>"
if (process.argv.length < 5) {
    console.error('-------------------------------------');
    console.error('Syntax: bot.js <token> <shardId> <shardCount> (<instance>)');
    console.error('-------------------------------------');
    process.exit(1);
}
const rawParams = process.argv.slice(2);
const args = rawParams.filter((a) => !a.startsWith('--'));
const flags = rawParams.filter((f) => f.startsWith('--'));
const type = config.bot.type;
const token = args[0];
const shardId = Number(args[1]);
const shardCount = Number(args[2]);
const instance = args[3] || type;
// Initialize sentry
node_1.init({
    dsn: config.sentryDsn,
    release: pkg.version,
    environment: process.env.NODE_ENV || 'production'
});
node_1.configureScope((scope) => {
    scope.setTag('botType', type);
    scope.setTag('instance', instance);
    scope.setTag('shard', `${shardId}/${shardCount}`);
});
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
const main = async () => {
    console.log(chalk_1.default.green('-------------------------------------'));
    console.log(chalk_1.default.green(`This is shard ${chalk_1.default.blue(`${shardId}/${shardCount}`)} of ${chalk_1.default.blue(type)} instance ${chalk_1.default.blue(instance)}`));
    console.log(chalk_1.default.green('-------------------------------------'));
    const client = new client_1.IMClient({
        version: pkg.version,
        token,
        type,
        instance,
        shardId,
        shardCount,
        flags,
        config
    });
    console.log(chalk_1.default.green('-------------------------------------'));
    console.log(chalk_1.default.green('Starting bot...'));
    console.log(chalk_1.default.green('-------------------------------------'));
    await client.init();
    console.log(chalk_1.default.green('-------------------------------------'));
    console.log(chalk_1.default.green('Waiting for start ticket...'));
    console.log(chalk_1.default.green('-------------------------------------'));
    await client.waitForStartupTicket();
    console.log(chalk_1.default.green('-------------------------------------'));
    console.log(chalk_1.default.green('Connecting to discord...'));
    console.log(chalk_1.default.green('-------------------------------------'));
    await client.connect();
};
main().catch((err) => console.error(err));
//# sourceMappingURL=bot.js.map