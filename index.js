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
    { name: 'NBA 2K', emoteId: '1407300324863119491', roleId: '1404109015516057650' },
    { name: 'League of Legends', emoteId: '1407300447231803494', roleId: '1404109092514955345' },
    { name: 'Wild Rift', emoteId: '1407300567574909009', roleId: '1404109126572965958' },
    { name: 'Team Fight Tactics', emoteId: '1407300757325348975', roleId: '1404112145821733015' },
    { name: 'Roblox', emoteId: '1407300884756693062', roleId: '1404115005657452655' },
    { name: 'Left 4 Dead', emoteId: '1407301029912907827', roleId: '1404115035608973382' },
    { name: 'GTA', emoteId: '1407301156836868178', roleId: '1404115078952783922' },
    { name: 'Overwatch', emoteId: '1407301263837630514', roleId: '1404115102680219888' },
    { name: 'Fall Guys', emoteId: '1407301367516627035', roleId: '1404115130849034280' },
    { name: 'Crab Game', emoteId: '1407301463838818324', roleId: '1404115159584215131' },
    { name: 'Once Human', emoteId: '1407301586669015142', roleId: '1404115187505565747' },
    { name: 'Fortnite', emoteId: '1407301744664379433', roleId: '1404115224214241413' },
    { name: 'Honor of Kings', emoteId: '1407303258673778739', roleId: '1404118277088739348' },
    { name: 'Tekken', emoteId: '1407303262536994907', roleId: '1404118222072057856' },
    { name: 'Honkai', emoteId: '1407303265816678531', roleId: '1404118159878914170' },
    { name: 'Rainbow Six Siege', emoteId: '1407303270074159114', roleId: '1404118099246190684' },
    { name: 'Pokémon Unite', emoteId: '1407303275727818752', roleId: '1404118058745987072' },
    { name: 'PUBG', emoteId: '1407303377104273429', roleId: '1404118026709635113' },
    { name: 'Minecraft', emoteId: '1407303380468105257', roleId: '1404117972892651602' },
    { name: 'Genshin Impact', emoteId: '1407303382707998790', roleId: '1404117936700002405' },
    { name: 'Farlight 84', emoteId: '1407303385316724736', roleId: '1404117902763884575' },
    { name: 'Dota 2', emoteId: '1407303389402108015', roleId: '1404117878134800414' },
    { name: 'COD Mobile', emoteId: '1407300193304580259', roleId: '1404117846417477632' },
    { name: 'CS:GO', emoteId: '1407303394087014400', roleId: '1404117795423125535' },
    { name: 'Apex Legends', emoteId: '1407303485392945282', roleId: '1404115358385836162' },
    { name: 'Among Us', emoteId: '1407303487536107613', roleId: '1404115334583161015' },
    { name: 'Clash of Clans', emoteId: '1407303490367131739', roleId: '1404115250260742274' }
];

// --- FUNCTIONS ---
// Send reaction roles (auto split if >20)
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

// Send verify button
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

// Send rules
async function sendRulesMessage(channel, key) {
    if (botMessages[key]) {
        try { const existingMsg = await channel.messages.fetch(botMessages[key]); if (existingMsg) return; } catch {}
    }
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
    const msg = await channel.send(rulesText);
    botMessages[key] = msg.id;
    fs.writeFileSync(botMessagesFile, JSON.stringify(botMessages, null, 2));
}

// --- WELCOME MESSAGE ---
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;
    channel.send({
        content: `🎉 **Welcome to AdU Game!** 🎮\n\nHey ${member}! Glad you joined us! Here's how to get started:\n\n✅ **Verify yourself** in <#${verifiedChannelId}>  \n📌 **Read the rules** in <#${rulesChannelId}>  \n🎮 **Pick your game roles** in <#${reactionRolesChannelId}>\n\nHave fun, play fair, and let's level up together! 💜`,
        allowedMentions: { parse: ['users'] }
    });
});

// --- ON READY ---
client.once('clientReady', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    const rrChannel = await client.channels.fetch(reactionRolesChannelId);
    const verifiedChannel = await client.channels.fetch(verifiedChannelId);
    const rulesChannel = await client.channels.fetch(rulesChannelId);

    await sendReactionRoles(rrChannel, games);
    await sendVerifyMessage(verifiedChannel, 'verifyMessage');
    await sendRulesMessage(rulesChannel, 'rulesMessage');
});

// --- REACTION ROLE HANDLERS ---
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.message.channel.id !== reactionRolesChannelId) return;
    const game = games.find(g => g.emoteId === reaction.emoji.id);
    if (!game) return;
    const member = reaction.message.guild.members.cache.get(user.id);
    const role = reaction.message.guild.roles.cache.get(game.roleId);
    if (role && member) member.roles.add(role).catch(console.error);
});
client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.message.channel.id !== reactionRolesChannelId) return;
    const game = games.find(g => g.emoteId === reaction.emoji.id);
    if (!game) return;
    const member = reaction.message.guild.members.cache.get(user.id);
    const role = reaction.message.guild.roles.cache.get(game.roleId);
    if (role && member) member.roles.remove(role).catch(console.error);
});

// --- VERIFICATION BUTTON ---
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
});

// --- LOGIN ---
client.login(token);





















