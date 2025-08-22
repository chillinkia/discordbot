require('dotenv').config();
const express = require("express");
const fs = require('fs');
const { 
    Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder
} = require('discord.js');

// --- EXPRESS SERVER ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(PORT, () => console.log(`Web server is running on port ${PORT}`));

// --- DISCORD CLIENT ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ]
});

// --- ERROR HANDLERS ---
client.on('error', error => console.error('Discord client error:', error));
client.on('warn', info => console.warn('Discord client warning:', info));
client.on('shardError', error => console.error('Shard error:', error));
process.on('unhandledRejection', error => console.error('Unhandled promise rejection:', error));

// --- CONFIG ---
const token = process.env.BOT_TOKEN;
if (!token) {
    console.error("❌ No bot token found! Set BOT_TOKEN in .env");
    process.exit(1);
}

// --- CHANNEL & ROLE IDS ---
const welcomeChannelId = '1404097606988075040';
const reactionRolesChannelId = '1407307017621864550';
const verifiedChannelId = '1407271197544022118';
const verifiedRoleId = '1407318706412978248';
const rulesChannelId = '1404104982638104789';
const introChannelId = '1407360906739978281';
const birthdaySetChannelId = '1407436351284052199';
const birthdayGreetChannelId = '1407435745387610218';
const boostChannelId = '1407352144067301458';

// --- DATA FILES ---
const birthdayFile = './birthdays.json';
const botMessagesFile = './botMessages.json';
if (!fs.existsSync(birthdayFile)) fs.writeFileSync(birthdayFile, '[]');
if (!fs.existsSync(botMessagesFile)) fs.writeFileSync(botMessagesFile, '{}');
let botMessages = JSON.parse(fs.readFileSync(botMessagesFile, 'utf-8'));

// --- GAME ROLES ---
const games = [
    // ... paste your full games array here ...
];
const games1 = games.slice(0, Math.ceil(games.length / 2));
const games2 = games.slice(Math.ceil(games.length / 2));

// --- UTILITIES ---
function saveBotMessages() {
    fs.writeFileSync(botMessagesFile, JSON.stringify(botMessages, null, 2));
}

async function fetchOrSend(channel, key, content, components = []) {
    if (botMessages[key]) {
        try {
            const msg = await channel.messages.fetch(botMessages[key]);
            if (msg) return msg;
        } catch {
            console.log(`Previous message not found for ${key}, sending a new one.`);
        }
    }
    const msg = await channel.send({ content, components });
    botMessages[key] = msg.id;
    saveBotMessages();
    return msg;
}

// --- FEATURES ---
async function sendReactionRoles(channel, gamesArray, key) {
    let description = '**🎮 React to get your game role!**\n\n';
    for (const game of gamesArray) {
        const emoji = channel.guild.emojis.cache.get(game.emoteId);
        description += emoji ? `${emoji} - **${game.name}**\n` : `❓ - **${game.name}** (emoji not found)\n`;
    }
    const msg = await fetchOrSend(channel, key, description);
    for (const game of gamesArray) {
        const emoji = channel.guild.emojis.cache.get(game.emoteId);
        if (emoji) await msg.react(emoji).catch(console.error);
    }
}

async function sendVerifyMessage(channel, key) {
    const button = new ButtonBuilder().setCustomId('verify_button').setLabel('✅ Verify').setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder().addComponents(button);
    await fetchOrSend(channel, key, 'Click the button below to verify yourself!', [row]);
}

async function sendRulesMessage(channel, key) {
    const rulesText = `📜 **Server Rules – AdU Game** 🎮
1️⃣ Respect Everyone
2️⃣ No Cheating or Exploiting
3️⃣ Keep Channels On Topic
4️⃣ No Self-Promotion
5️⃣ Follow Discord TOS
6️⃣ Be Sportsmanlike
7️⃣ Voice Channel Etiquette
8️⃣ No NSFW Content
9️⃣ Listen to Staff
🔟 Have Fun!`;
    await fetchOrSend(channel, key, rulesText);
}

// --- WELCOME ---
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;
    channel.send({
        content: `🎉 **Welcome to AdU Game!** 🎮\n\nHey ${member}! Glad you joined us! Here's how to get started:\n\n✅ **Verify yourself** in <#${verifiedChannelId}>  \n📌 **Read the rules** in <#${rulesChannelId}>  \n🎮 **Pick your game roles** in <#${reactionRolesChannelId}>\n\nHave fun, play fair, and let's level up together! 💜`,
        allowedMentions: { parse: ['users'] }
    });
});

// --- READY ---
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    const rrChannel = await client.channels.fetch(reactionRolesChannelId);
    const verifiedChannel = await client.channels.fetch(verifiedChannelId);
    const rulesChannel = await client.channels.fetch(rulesChannelId);

    await sendReactionRoles(rrChannel, games1, 'reactionRoles1');
    await sendReactionRoles(rrChannel, games2, 'reactionRoles2');
    await sendVerifyMessage(verifiedChannel, 'verifyMessage');
    await sendRulesMessage(rulesChannel, 'rulesMessage');
});

// --- REACTION ROLES ---
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot || reaction.message.channel.id !== reactionRolesChannelId) return;
    const game = games.find(g => g.emoteId === reaction.emoji.id);
    if (!game) return;
    const member = reaction.message.guild.members.cache.get(user.id);
    const role = reaction.message.guild.roles.cache.get(game.roleId);
    if (role && member) member.roles.add(role).catch(console.error);
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot || reaction.message.channel.id !== reactionRolesChannelId) return;
    const game = games.find(g => g.emoteId === reaction.emoji.id);
    if (!game) return;
    const member = reaction.message.guild.members.cache.get(user.id);
    const role = reaction.message.guild.roles.cache.get(game.roleId);
    if (role && member) member.roles.remove(role).catch(console.error);
});

// --- VERIFICATION BUTTON ---
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton() || interaction.customId !== 'verify_button') return;
    try {
        const member = interaction.guild.members.cache.get(interaction.user.id);
        const role = interaction.guild.roles.cache.get(verifiedRoleId);
        if (!member || !role) return interaction.reply({ content: 'Something went wrong.', ephemeral: true });
        if (member.roles.cache.has(role.id)) {
            await interaction.reply({ content: 'You are already verified!', ephemeral: true });
        } else {
            await member.roles.add(role);
            await interaction.reply({ content: 'You are now verified! 🎉', ephemeral: true });
        }
    } catch { interaction.reply({ content: 'Error assigning role.', ephemeral: true }); }
});

// --- BOOST MESSAGE ---
client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (!oldMember.premiumSince && newMember.premiumSince) {
        const boostChannel = newMember.guild.channels.cache.get(boostChannelId);
        if (!boostChannel) return;
        boostChannel.send(`🚀 Thank you ${newMember.user} for boosting the server! 💜`);
    }
});

// --- INTRO CHANNEL ---
client.on('messageCreate', async message => {
    if (message.channel.id !== introChannelId || message.author.bot) return;
    const embed = new EmbedBuilder()
        .setTitle('👋 New Introduction!')
        .setDescription(`${message.author} says:\n\n${message.content}`)
        .setColor('#00FF00')
        .setTimestamp();
    message.channel.send({ embeds: [embed] });
    message.delete().catch(console.error);
});

// --- BIRTHDAY FEATURE ---
setInterval(async () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const birthdays = JSON.parse(fs.readFileSync(birthdayFile, 'utf-8'));
    const birthdayUsers = birthdays.filter(b => b.day === day && b.month === month);
    if (!birthdayUsers.length) return;
    const birthdayChannel = await client.channels.fetch(birthdayGreetChannelId);
    if (!birthdayChannel) return;
    birthdayUsers.forEach(user => {
        const embed = new EmbedBuilder()
            .setTitle('🎂 Happy Birthday! 🎉')
            .setDescription(`Hey <@${user.id}>, everyone wishes you an amazing day! 💜`)
            .setColor('#FFC0CB')
            .setImage('https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif')
            .setTimestamp();
        birthdayChannel.send({ embeds: [embed] });
    });
}, 1000 * 60 * 60);

client.on('messageCreate', async message => {
    if (message.channel.id !== birthdaySetChannelId || message.author.bot) return;
    const [month, day] = message.content.trim().split('-').map(Number);
    if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
        return message.reply('❌ Invalid format! Use MM-DD (e.g., 08-19).');
    }
    const birthdays = JSON.parse(fs.readFileSync(birthdayFile, 'utf-8'));
    const existing = birthdays.find(b => b.id === message.author.id);
    if (existing) { existing.month = month; existing.day = day; } 
    else { birthdays.push({ id: message.author.id, month, day }); }
    fs.writeFileSync(birthdayFile, JSON.stringify(birthdays, null, 2));
    message.reply(`✅ Your birthday is set to ${month}-${day}!`);
});

// --- LOGIN ---
client.login(token);












