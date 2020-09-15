"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShardIdForGuild = exports.idToBinary = exports.deconstruct = void 0;
// Discord epoch (2015-01-01T00:00:00.000Z)
const EPOCH = 1420070400000;
exports.deconstruct = (snowflake) => {
    const BINARY = idToBinary(snowflake).padStart(64, '0');
    return parseInt(BINARY.substring(0, 42), 2) + EPOCH;
};
function idToBinary(num) {
    let bin = '';
    let high = parseInt(num.slice(0, -10), 10) || 0;
    let low = parseInt(num.slice(-10), 10);
    while (low > 0 || high > 0) {
        // tslint:disable-next-line:no-bitwise
        bin = String(low & 1) + bin;
        low = Math.floor(low / 2);
        if (high > 0) {
            low += 5000000000 * (high % 2);
            high = Math.floor(high / 2);
        }
    }
    return bin;
}
exports.idToBinary = idToBinary;
function getShardIdForGuild(guildId, shardCount) {
    const bin = idToBinary(guildId);
    const num = parseInt(bin.substring(0, bin.length - 22), 2);
    return (num % shardCount) + 1;
}
exports.getShardIdForGuild = getShardIdForGuild;
//# sourceMappingURL=util.js.map