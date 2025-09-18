require('dotenv').config();
const express = require("express");
const fs = require('fs');
const { 
    Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder, InteractionResponseFlags
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

// --- TOKEN & LOGIN ---
let token = process.env.BOT_TOKEN;
if (token) token = token.trim();

if (!token) {
    console.error("❌ No bot token found! Set BOT_TOKEN in .env (local) or Render environment variables.");
    process.exit(1);
}

console.log("Bot token first 5 chars:", token.slice(0, 5));

client.login(token)
    .then(() => console.log(`✅ Logged in as ${client.user.tag}`))
    .catch(err => {
        console.error("❌ Failed to log in. Check your token!", err);
        process.exit(1);
    });

// --- ERROR HANDLERS ---
client.on('error', error => console.error('Discord client error:', error));
client.on('warn', info => console.warn('Discord client warning:', info));
client.on('shardError', error => console.error('Shard error:', error));
process.on('unhandledRejection', error => console.error('Unhandled promise rejection:', error));

// --- CHANNEL & ROLE CONFIG ---
const welcomeChannelId = '1404097606988075040';
const reactionRolesChannelId = '1407307017621864550';
const verifiedChannelId = '1407271197544022118';
const verifiedRoleId = '1404107837851832410';
const rulesChannelId = '1404104982638104789';
const introChannelId = '1407360906739978281';
const birthdaySetChannelId = '1407436351284052199';
const birthdayGreetChannelId = '1407435745387610218';
const boostChannelId = '1407352144067301458';
const birthdayFile = './birthdays.json';
const botMessagesFile = './botMessages.json';

// Ensure files exist
if (!fs.existsSync(birthdayFile)) fs.writeFileSync(birthdayFile, '[]');
if (!fs.existsSync(botMessagesFile)) fs.writeFileSync(botMessagesFile, '{}');
let botMessages = JSON.parse(fs.readFileSync(botMessagesFile, 'utf-8'));

// --- GAME ROLES ---
const games = [
    { name: 'Valorant', emoteId: '1407299610690453569', roleId: '1404108937300803615' },
    { name: 'MLBB', emoteId: '1407300001830273114', roleId: '1404108965331075112' },
    { name: 'Call of Duty', emoteId: '1407300193304580259', roleId: '1404108994582417428' },
    // ... rest of the games
];

// --- FUNCTIONS ---
async function sendReactionRoles(channel, gamesArray, keyPrefix = 'reactionRoles') {
    const maxReactionsPerMessage = 20;
    const totalMessages = Math.ceil(gamesArray.length / maxReactionsPerMessage);

    for (let i = 0; i < totalMessages; i++) {
        const slice = gamesArray.slice(i * maxReactionsPerMessage, (i + 1) * maxReactionsPerMessage);
        const key = `${keyPrefix}_${i}`;
        let msg;
        if (botMessages[key]) {
            try { msg = await channel.messages.fetch(botMessages[key]); } 
            catch { console.log(`Previous reaction roles message not found for ${key}.`); }
        }
        if (!msg) {
            let description = '**🎮 React to get your game role!**\n\n';
            for (const game of slice) {
                const emoji = channel.guild.emojis.cache.get(game.emoteId);
                description += emoji ? `${emoji} - **${game.name}**\n` : `❓ - **${game.name}** (emoji not found)\n`;
            }
            msg = await channel.send(description);
            botMessages[key] = msg.id;
            fs.writeFileSync(botMessagesFile, JSON.stringify(botMessages, null, 2));
        }
        for (const game of slice) {
            const emoji = channel.guild.emojis.cache.get(game.emoteId);
            if (emoji) await msg.react(emoji).catch(console.error);
        }
    }
}

async function sendVerifyMessage(channel, key) {
    if (botMessages[key]) {
        try { const existingMsg = await channel.messages.fetch(botMessages[key]); if (existingMsg) return; } catch {}
    }
    const button = new ButtonBuilder().setCustomId('verify_button').setLabel('✅ Verify').setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder().addComponents(button);
    const msg = await channel.send({ content: 'Click the button below to verify yourself!', components: [row] });
    botMessages[key] = msg.id;
    fs.writeFileSync(botMessagesFile, JSON.stringify(botMessages, null, 2));
}

async function sendRulesMessage(channel, key) {
    if (botMessages[key]) {
        try { 
            const existingMsg = await channel.messages.fetch(botMessages[key]); 
            if (existingMsg) return; 
        } catch {}
    }

    const rulesEmbed = new EmbedBuilder()
        .setTitle('📜 Server Rules – AdU Game 🎮')
        .setThumbnail('https://cdn.discordapp.com/attachments/1404667971078459412/1418078042596573265/548465965_1597541707883047_8064824227716457744_n.png?ex=68cd7857&is=68cc26d7&hm=369fab652951d80e43320eb7020ddf525b51bda8a08a198e67f88fec2b18d2ce&')
        .setImage('https://cdn.discordapp.com/attachments/1404667971078459412/1418078041933877289/548957804_1311038923851980_8844997152190400872_n.png?ex=68cd7857&is=68cc26d7&hm=2aff0654a602f9ae071ab0ce6c0b38bf77149f9439e03c01c8ba3e6a210c0db7&')
        .setColor('#6A0DAD')
        .addFields(
            { name: '🔒 1. All channels are locked', value: 'For Guildmeyts/Adamsonians/Casuals only. Follow the guidelines before joining any voice or chat channels.' },
            { name: '📝 2. Registered Guildmeyts', value: 'Change your nickname to `AdUG | [name]` (Ex.: AdUG: Falcon).' },
            { name: '✅ 3. Get Guildmeyt role', value: 'Complete the application form upon joining. Officers will verify your legitimacy.' },
            { name: '🎁 4. Guildmeyt perks', value: 'Being a Guildmeyt grants access to exclusive channels and perks.' },
            { name: '❓ 5. Questions or concerns', value: 'Use the Tickets channel and wait for an officer to respond.' },
            { name: '💜 Happy Gaming!', value: '\u200B' } // empty value for spacing
        )
        .setTimestamp();

    const msg = await channel.send({ embeds: [rulesEmbed] });
    botMessages[key] = msg.id;
    fs.writeFileSync(botMessagesFile, JSON.stringify(botMessages, null, 2));
}
// --- ON READY ---
client.once('ready', async () => {
    console.log(`Bot is ready: ${client.user.tag}`);

    const rrChannel = await client.channels.fetch(reactionRolesChannelId);
    const verifiedChannel = await client.channels.fetch(verifiedChannelId);
    const rulesChannel = await client.channels.fetch(rulesChannelId);

    await sendReactionRoles(rrChannel, games);
    await sendVerifyMessage(verifiedChannel, 'verifyMessage');
    await sendRulesMessage(rulesChannel, 'rulesMessage');
});

// --- EVENTS ---
// Guild member join
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;
    channel.send({
        content: `🎉 **Welcome to AdU Game!** 🎮\n\nHey ${member}! Glad you joined us! Here's how to get started:\n\n✅ **Verify yourself** in <#${verifiedChannelId}>  \n📌 **Read the rules** in <#${rulesChannelId}>  \n🎮 **Pick your game roles** in <#${reactionRolesChannelId}>\n\nHave fun, play fair, and let's level up together! 💜`,
        allowedMentions: { parse: ['users'] }
    });
});

// Reaction role add/remove
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

// Verification button
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'verify_button') {
        try {
            const member = interaction.guild.members.cache.get(interaction.user.id);
            const role = interaction.guild.roles.cache.get(verifiedRoleId);
            if (!member || !role) return interaction.reply({ content: 'Something went wrong.', flags: InteractionResponseFlags.Ephemeral });
            if (member.roles.cache.has(role.id)) {
                await interaction.reply({ content: 'You are already verified!', flags: InteractionResponseFlags.Ephemeral });
            } else {
                await member.roles.add(role);
                await interaction.reply({ content: 'You are now verified! 🎉', flags: InteractionResponseFlags.Ephemeral });
            }
        } catch { interaction.reply({ content: 'Error assigning role.', flags: InteractionResponseFlags.Ephemeral }); }
    }
});

// Boost message
client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (!oldMember.premiumSince && newMember.premiumSince) {
        const boostChannel = newMember.guild.channels.cache.get(boostChannelId);
        if (!boostChannel) return;
        boostChannel.send(`🚀 Thank you ${newMember.user} for boosting the server! 💜`);
    }
});

// Introduction messages
client.on('messageCreate', async message => {
    if (message.channel.id === introChannelId && !message.author.bot) {
        const embed = new EmbedBuilder()
            .setTitle('👋 New Introduction!')
            .setDescription(`${message.author} says:\n\n${message.content}`)
            .setColor('#00FF00')
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
        message.delete().catch(console.error);
    }

    // Birthday set
    if (message.channel.id === birthdaySetChannelId && !message.author.bot) {
        const content = message.content.trim();
        const [month, day] = content.split('-').map(Number);
        if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
            return message.reply('❌ Invalid format! Use MM-DD (e.g., 08-19).');
        }
        const birthdays = JSON.parse(fs.readFileSync(birthdayFile, 'utf-8'));
        const existing = birthdays.find(b => b.id === message.author.id);
        if (existing) { existing.month = month; existing.day = day; } 
        else { birthdays.push({ id: message.author.id, month, day }); }
        fs.writeFileSync(birthdayFile, JSON.stringify(birthdays, null, 2));
        message.reply(`✅ Your birthday is set to ${month}-${day}!`);
    }
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
}, 1000 * 60 * 60); // runs every hour
























