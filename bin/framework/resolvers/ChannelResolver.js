"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelResolver = void 0;
const Resolver_1 = require("./Resolver");
const channelRegex = /^(?:<#)?(\d+)>?$/;
class ChannelResolver extends Resolver_1.Resolver {
    async resolve(value, { guild, t }) {
        if (!guild || !value) {
            return;
        }
        let channel;
        if (channelRegex.test(value)) {
            const id = value.match(channelRegex)[1];
            channel = guild.channels.get(id);
            if (!channel) {
                throw Error(t(`resolvers.channel.notFound`));
            }
        }
        else {
            const name = value.toLowerCase();
            const channels = guild.channels.filter((r) => {
                const rName = r.name.toLowerCase();
                return rName.includes(name) || name.includes(rName);
            });
            if (channels.length === 1) {
                channel = channels[0];
            }
            else {
                if (channels.length === 0) {
                    throw Error(t(`resolvers.channel.notFound`));
                }
                else {
                    throw Error(t(`resolvers.channel.multiple`, {
                        channels: channels
                            .slice(0, 10)
                            .map((c) => `\`${c.name}\``)
                            .join(', ')
                    }));
                }
            }
        }
        return channel;
    }
}
exports.ChannelResolver = ChannelResolver;
//# sourceMappingURL=ChannelResolver.js.map