import { Message } from 'eris';

import { IMClient } from '../../../client';
import { BotCommand, CommandGroup } from '../../../types';
import { Command, Context } from '../Command';

export default class extends Command {
	public constructor(client: IMClient) {
		super(client, {
			name: BotCommand.ack,
			aliases: [],
			group: CommandGroup.Info,
			defaultAdminOnly: false,
			guildOnly: false
		});
	}

	public async action(message: Message, args: any[], flags: {}, { t }: Context): Promise<any> {
		const embed = this.createEmbed();

		embed.fields.push({
			name: 'Who is Ack?',
			value: `Ack is a big dum dum, who is too lucky`
		});

		return this.sendReply(message, embed);
	}
}
