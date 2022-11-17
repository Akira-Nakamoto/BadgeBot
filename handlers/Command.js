const fs = require('fs');
const { PermissionsBitField } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { REST } = require('@discordjs/rest');
var Config = require('../Config.json');
var Discord = {
    TOKEN: Config.Token,
    CLIENT_ID: Config.ClientID,
    GUILD_ID: Config.GuildID,
};
const rest = new REST({ version: '9' }).setToken(Discord.TOKEN);
module.exports = (client) => {
    const Commands = [];
    fs.readdirSync('./Commands/').forEach(async (dir) => {
        const files = fs.readdirSync(`./Commands/${dir}/`).filter((file) => file.endsWith('.js'));
        for (const file of files) {
            const Command = require(`../Commands/${dir}/${file}`);
            Commands.push({
                name: Command.name,
                description: Command.description,
                type: Command.type,
                options: Command.options ? Command.options : null,
                default_permission: Command.default_permission ? Command.default_permission : null,
                default_member_permissions: Command.default_member_permissions ? PermissionsBitField.resolve(Command.default_member_permissions).toString() : null,
            });
            if (Command.name) {
                client.Commands.set(Command.name, Command);
                console.log('Command:', file.split('.js')[0], '✅');
            } else {
                console.log('Command:', file.split('.js')[0], '⛔');
            }
        }
    });
    (async () => {
        try {
            await rest.put(process.env.GUILD_ID ? Routes.applicationGuildCommands(Discord.CLIENT_ID, Discord.GUILD_ID) : Routes.applicationCommands(Discord.CLIENT_ID), { body: Commands });
            console.log('Commands Registered');
        } catch (error) {
            console.log(error);
        }
    })();
};