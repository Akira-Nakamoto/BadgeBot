var Requirement = {
    Config: require('./Config.json'),
    Intents: null,
    Client: null,
    EmbedBuilder: null,
};
const { Client, IntentsBitField, EmbedBuilder, PermissionsBitField, Collection, Partials } = require('discord.js');
const fs = require('fs');
Requirement.Client = Client;
Requirement.Intents = new IntentsBitField();
Requirement.EmbedBuilder = EmbedBuilder;
Requirement.Intents.add(
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildIntegrations
);
const Bot = new Requirement.Client({ intents: Requirement.Intents, partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction] });
const ms = require('ms');
const cooldownMessage = 'You are on `<duration>` cooldown!';
const cooldown = new Collection();
Start();
async function PrepareCommands() {
    Bot.Commands = new Collection();
    Bot.aliases = new Collection();
    Bot.buttons = new Collection();
    fs.readdirSync('./handlers').forEach((handler) => { require(`./handlers/${handler}`)(Bot); });
}
async function Start() {
    PrepareCommands();
    Bot.on('ready', async () => { console.log(`[Discord] Running as: ${Bot.user.username}`); });
    Bot.on('interactionCreate', async (interaction) => {
        const Command = Bot.Commands.get(interaction.commandName);
        if (interaction.type == 4) {
            if (Command.autocomplete) {
                const choices = [];
                await Command.autocomplete(interaction, choices);
            }
        }
        if (interaction.type != 2) return;
        if (!Command) return Bot.Commands.delete(interaction.commandName);
        try {
            if (Command.cooldown) {
                if (cooldown.has(`-${Command.name}${interaction.user.id}`)) return interaction.reply({ content: cooldownMessage.replace('<duration>', ms(cooldown.get(`-${Command.name}${interaction.user.id}`) - Date.now(), { long: true })) });
                if (Command.userPerms || Command.botPerms) {
                    if (!interaction.memberPermissions.has(PermissionsBitField.resolve(Command.userPerms || []))) {
                        const userPerms = new EmbedBuilder().setDescription(`🚫 ${interaction.user}, You don't have \`${Command.userPerms}\` permissions to use this command!`).setColor('Red');
                        return interaction.reply({ embeds: [userPerms] });
                    }
                    if (!interaction.guild.members.cache.get(Bot.user.id).permissions.has(PermissionsBitField.resolve(Command.botPerms || []))) {
                        const botPerms = new EmbedBuilder().setDescription(`🚫 ${interaction.user}, I don't have \`${Command.botPerms}\` permissions to use this command!`).setColor('Red');
                        return interaction.reply({ embeds: [botPerms] });
                    }
                }
                await Command.run(Bot, interaction);
                cooldown.set(`-${Command.name}${interaction.user.id}`, Date.now() + Command.cooldown);
                setTimeout(() => { cooldown.delete(`-${Command.name}${interaction.user.id}`); }, Command.cooldown);
            } else {
                if (Command.userPerms || Command.botPerms) {
                    if (!interaction.memberPermissions.has(PermissionsBitField.resolve(Command.userPerms || []))) {
                        const userPerms = new EmbedBuilder().setDescription(`🚫 ${interaction.user}, You don't have \`${Command.userPerms}\` permissions to use this command!`).setColor('Red');
                        return interaction.reply({ embeds: [userPerms] });
                    }
                    if (!interaction.guild.members.cache.get(Bot.user.id).permissions.has(PermissionsBitField.resolve(Command.botPerms || []))) {
                        const botPerms = new EmbedBuilder().setDescription(`🚫 ${interaction.user}, I don't have \`${Command.botPerms}\` permissions to use this command!`).setColor('Red');
                        return interaction.reply({ embeds: [botPerms] });
                    }
                }
                await Command.run(Bot, interaction);
            }
        } catch (error) { console.log(error); }
    });
    Bot.login(Requirement.Config.Token);
}
module.exports = { Bot };