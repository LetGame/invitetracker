"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const resolvers_1 = require("../resolvers");
const Resolver_1 = require("../resolvers/Resolver");
class Command {
    constructor(client, props) {
        this.extraExamples = [];
        this.client = client;
        this.name = props.name;
        this.aliases = props.aliases.map((a) => a.toLowerCase());
        this.args = props.args ? props.args : [];
        this.flags = props.flags ? props.flags : [];
        this.group = props.group;
        this.botPermissions = props.botPermissions ? props.botPermissions : [];
        this.strict = props.defaultAdminOnly;
        this.guildOnly = props.guildOnly;
        this.premiumOnly = props.premiumOnly;
        if (props.extraExamples) {
            this.extraExamples = props.extraExamples;
        }
        this.usage = `{prefix}${this.name} `;
        this.flagResolvers = new Map();
        this.flags.forEach((flag) => {
            const res = flag.resolver instanceof Resolver_1.Resolver ? flag.resolver : new flag.resolver(this.client);
            this.flagResolvers.set(flag.name, res);
            delete flag.resolver;
            const val = res instanceof resolvers_1.BooleanResolver ? '' : '=value';
            const short = flag.short ? `-${flag.short}${val.replace('=', ' ')}|` : '';
            this.usage += `[${short}--${flag.name}${val}] `;
        });
        this.resolvers = [];
        this.args.forEach((arg) => {
            if (arg.resolver instanceof Resolver_1.Resolver) {
                this.resolvers.push(arg.resolver);
            }
            else {
                this.resolvers.push(new arg.resolver(this.client));
            }
            delete arg.resolver;
            this.usage += arg.required ? `<${arg.name}> ` : `[${arg.name}] `;
        });
        this.createEmbed = client.msg.createEmbed.bind(client.msg);
        this.sendReply = client.msg.sendReply.bind(client.msg);
        this.sendEmbed = client.msg.sendEmbed.bind(client.msg);
        this.showPaginated = client.msg.showPaginated.bind(client.msg);
    }
    getInfo(context) {
        let info = '';
        for (let i = 0; i < this.flags.length; i++) {
            const flag = this.flags[i];
            const help = this.flagResolvers.get(flag.name).getHelp(context);
            const descr = context.t(`cmd.${this.name}.self.flags.${flag.name}`);
            info += `**--${flag.name}**\n${descr}\n` + (help ? `${help.substr(0, 800)}\n\n` : '\n');
        }
        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i];
            const help = this.resolvers[i].getHelp(context);
            const descr = context.t(`cmd.${this.name}.self.args.${arg.name}`);
            info += `**<${arg.name}>**\n${descr}\n` + (help ? `${help}\n\n` : '\n');
        }
        return info;
    }
    getInfo2(context) {
        const ret = { args: [], flags: [] };
        for (let i = 0; i < this.flags.length; i++) {
            const flag = this.flags[i];
            const res = this.flagResolvers.get(flag.name);
            ret.flags.push({
                name: flag.name,
                type: context.t(`resolvers.${res.getType()}.type`),
                short: flag.short,
                description: context.t(`cmd.${this.name}.self.flags.${flag.name}`),
                help: res.getHelp(context)
            });
        }
        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i];
            const res = this.resolvers[i];
            ret.args.push({
                name: arg.name,
                type: context.t(`resolvers.${res.getType()}.type`),
                required: arg.required,
                description: context.t(`cmd.${this.name}.self.args.${arg.name}`),
                help: res.getHelp(context)
            });
        }
        return ret;
    }
}
exports.Command = Command;
//# sourceMappingURL=Command.js.map