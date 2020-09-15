"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptchaService = exports.FileMode = void 0;
const canvas_1 = require("canvas");
const i18n_1 = __importDefault(require("i18n"));
const moment_1 = __importDefault(require("moment"));
const Service_1 = require("../../framework/services/Service");
var FileMode;
(function (FileMode) {
    FileMode["FILE"] = "file";
    FileMode["BUFFER"] = "buffer";
    FileMode["BASE64"] = "base64";
})(FileMode = exports.FileMode || (exports.FileMode = {}));
const captchaOptions = {
    size: 6,
    fileMode: FileMode.BUFFER,
    height: 50,
    noiseColor: 'rgb(10,40,100)',
    color: 'rgb(50,40,50)',
    spacing: 2,
    nofLines: 4
};
class CaptchaService extends Service_1.IMService {
    async init() {
        this.client.on('guildMemberAdd', this.onGuildMemberAdd.bind(this));
    }
    async onGuildMemberAdd(guild, member) {
        // Ignore when pro bot is active
        if (this.client.disabledGuilds.has(guild.id)) {
            return;
        }
        const sets = await this.client.cache.guilds.get(guild.id);
        if (!sets.captchaVerificationOnJoin) {
            return;
        }
        const [text, buffer] = await this.createCaptcha(captchaOptions);
        const embed = this.client.msg.createEmbed({
            title: 'Captcha',
            description: sets.captchaVerificationWelcomeMessage.replace(/\{serverName\}/g, member.guild.name),
            image: {
                url: 'attachment://captcha.png'
            }
        });
        const dmChannel = await member.user.getDMChannel();
        await dmChannel.createMessage({ embed }, {
            name: 'captcha.png',
            file: buffer
        });
        const endTime = moment_1.default().add(sets.captchaVerificationTimeout, 's');
        while (true) {
            const response = await this.awaitMessage(member, endTime.diff(moment_1.default(), 'ms'));
            if (!response) {
                await dmChannel
                    .createMessage(sets.captchaVerificationFailedMessage.replace(/\{serverName\}/g, member.guild.name))
                    .catch(() => undefined);
                member.kick().catch(() => undefined);
                return;
            }
            if (response === text) {
                await dmChannel.createMessage(sets.captchaVerificationSuccessMessage.replace(/\{serverName\}/g, member.guild.name));
                return;
            }
            await dmChannel.createMessage(i18n_1.default.__({ locale: sets.lang, phrase: 'captcha.invalid' }));
        }
    }
    async createCaptcha(_config) {
        const config = Object.assign({}, _config);
        config.fileMode = config.fileMode || FileMode.BASE64;
        config.size = config.size || 4;
        config.height = config.height || 24;
        // Height times 3 because of the weird bug on linux servers where the letters are not positioned within the captcha
        config.canvasHeight = config.height * 3;
        config.width = config.width || config.height * config.size;
        config.color = config.color || 'rgb(0,0,0)';
        config.background = config.background || 'rgb(255,255,255)';
        config.lineWidth = config.lineWidth || 2;
        config.saveDir = config.saveDir || __dirname;
        config.text = config.text || Math.random().toString().substr(2, config.size);
        config.noise = config.noise !== false ? true : false;
        config.noiseColor = config.noiseColor || config.color;
        config.complexity = config.complexity || 3;
        config.complexity = config.complexity < 1 || config.complexity > 5 ? 3 : config.complexity;
        config.spacing = config.spacing || 2;
        config.spacing = config.spacing < 1 || config.spacing > 3 ? 2 : config.spacing;
        config.nofLines = config.nofLines || 2;
        const fontSize = Math.round(config.height * 0.5 + (15 - config.complexity * 3));
        const canvas = new canvas_1.Canvas(config.width, config.canvasHeight);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = config.background;
        ctx.fillRect(0, 0, config.width, config.canvasHeight);
        ctx.fillStyle = config.color;
        ctx.lineWidth = config.lineWidth;
        ctx.font = fontSize.toString() + 'px sans';
        if (config.noise) {
            ctx.strokeStyle = config.noiseColor;
            const noiseHeight = config.canvasHeight;
            const noiseWidthDiff = config.width / 3;
            const paddingFromBorder = 20;
            for (let i = 0; i < config.nofLines; i++) {
                ctx.moveTo(paddingFromBorder, Math.random() * noiseHeight);
                ctx.bezierCurveTo(noiseWidthDiff, Math.random() * noiseHeight, noiseWidthDiff * 2, Math.random() * noiseHeight, noiseWidthDiff * 3 - paddingFromBorder, Math.random() * noiseHeight);
                ctx.stroke();
            }
        }
        const modifier = config.complexity / 5;
        ctx.strokeStyle = config.color;
        for (let i = 0; i < config.text.length; i++) {
            ctx.setTransform(Math.random() * modifier + 1 + modifier / 3, Math.random() * modifier + modifier / 3, Math.random() * modifier + modifier / 3, Math.random() * modifier + 1 + modifier / 3, config.width / 4 + (config.height * i) / (4 - config.spacing) + (config.height - fontSize) / 3 + 10, config.canvasHeight - (config.canvasHeight - fontSize) / 2);
            ctx.fillText(config.text.charAt(i), 0, 0);
        }
        return new Promise((resolve) => {
            if (config.fileMode === FileMode.FILE) {
                const fs = require('fs');
                const filename = `${new Date().getTime()}-${Math.floor(Math.random() * 1000)}.png`;
                const out = fs.createWriteStream(config.saveDir + '/' + filename);
                const stream = canvas.createPNGStream();
                stream.on('data', function (chunk) {
                    out.write(chunk);
                });
                stream.on('end', function () {
                    resolve([config.text, filename]);
                });
            }
            else if (config.fileMode === FileMode.BUFFER) {
                canvas.toBuffer(function (err, buf) {
                    resolve([config.text, buf]);
                });
            }
            else {
                canvas.toDataURL('image/png', (err, data) => {
                    resolve([config.text, data]);
                });
            }
        });
    }
    async awaitMessage(member, timeLeft) {
        return new Promise((resolve) => {
            let timeOut;
            const func = async (resp) => {
                if (member.id !== resp.author.id) {
                    return;
                }
                clearTimeout(timeOut);
                this.client.removeListener('messageCreate', func);
                resolve(resp.content);
            };
            this.client.on('messageCreate', func);
            const timeOutFunc = () => {
                this.client.removeListener('messageCreate', func);
                resolve();
            };
            timeOut = setTimeout(timeOutFunc, timeLeft);
        });
    }
}
exports.CaptchaService = CaptchaService;
//# sourceMappingURL=Captcha.js.map