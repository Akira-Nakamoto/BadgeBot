const { ApplicationCommandType } = require('discord.js');

module.exports = {
    name: 'give',
    description: 'Give the Active Developer Badge',
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async (client, interaction) => {
        const messageEmbed = {
            color: 0x0099ff,
            title: 'Discord Active Developer Badge',
            description: 'The badge can be redeemed [here](https://discord.com/developers/active-developer).\nThis may take up to 24-72 hours to become redeemable.',
            thumbnail: {
                url: 'https://i.imgur.com/ZijGf92.png',
            },
        };
        interaction.reply({ embeds: [messageEmbed] });
    },
};
