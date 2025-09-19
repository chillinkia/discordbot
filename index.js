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
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// --- DISCORD CLIENT ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER']
});

// --- TOKEN & LOGIN ---
let token = process.env.BOT_TOKEN?.trim();
if (!token) {
    console.error("❌ No bot token found! Set BOT_TOKEN in .env or Render env vars.");
    process.exit(1);
}

client.login(token)
    .then(() => console.log(`✅ Logged in as ${client.user.tag}`))
    .catch(err => { console.error("❌ Failed to log in.", err); process.exit(1); });

// --- ERROR HANDLERS ---
client.on('error', console.error);
client.on('warn', console.warn);
client.on('shardError', console.error);
process.on('unhandledRejection', console.error);

// --- CONFIG ---
const config = {
    welcomeChannelId: '1404097606988075040',
    reactionRolesChannelId: '1407307017621864550',
    verifiedChannelId: '1407271197544022118',
    verifiedRoleId: '1404107837851832410',
    rulesChannelId: '1404104982638104789',
    introChannelId: '1407360906739978281',
    birthdaySetChannelId: '1407436351284052199',
    birthdayGreetChannelId: '1407435745387610218',
    boostChannelId: '1407352144067301458',
    birthdayFile: './birthdays.json',
    botMessagesFile: './botMessages.json',
    birthdaySentFile: './birthdaySent.json'
};

// --- ENSURE FILES EXIST ---
for (const file of [config.birthdayFile, config.botMessagesFile, config.birthdaySentFile]) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, file === config.botMessagesFile ? '{}' : '[]');
}

let botMessages = JSON.parse(fs.readFileSync(config.botMessagesFile, 'utf-8'));
let birthdaySent = JSON.parse(fs.readFileSync(config.birthdaySentFile, 'utf-8'));

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

// --- UTILITY FUNCTIONS ---
async function sendMessageIfNotExists(channel, key, options) {
    if (botMessages[key]) {
        try { 
            const existing = await channel.messages.fetch(botMessages[key]); 
            if (existing) return existing;
        } catch {}
    }
    const msg = await channel.send(options);
    botMessages[key] = msg.id;
    fs.writeFileSync(config.botMessagesFile, JSON.stringify(botMessages, null, 2));
    return msg;
}

async function sendReactionRoles(channel, gamesArray, keyPrefix = 'reactionRoles') {
    const maxPerMsg = 20;
    const total = Math.ceil(gamesArray.length / maxPerMsg);
    for (let i = 0; i < total; i++) {
        const slice = gamesArray.slice(i * maxPerMsg, (i + 1) * maxPerMsg);
        let description = '**🎮 React to get your game role!**\n\n';
        for (const game of slice) {
            const emoji = channel.guild.emojis.cache.get(game.emoteId);
            description += emoji ? `${emoji} - **${game.name}**\n` : `❓ - **${game.name}** (emoji not found)\n`;
        }
        const msg = await sendMessageIfNotExists(channel, `${keyPrefix}_${i}`, { content: description });
        for (const game of slice) {
            const emoji = channel.guild.emojis.cache.get(game.emoteId);
            if (emoji) await msg.react(emoji).catch(console.error);
        }
    }
}

async function sendVerifyMessage(channel, key) {
    const button = new ButtonBuilder().setCustomId('verify_button').setLabel('✅ Verify').setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder().addComponents(button);
    return sendMessageIfNotExists(channel, key, { content: 'Click the button below to verify yourself!', components: [row] });
}

async function sendRulesMessage(channel, key) {
    const rulesEmbed = new EmbedBuilder()
        .setTitle('📜 Server Rules – AdU Game 🎮')
        .setThumbnail('https://cdn.discordapp.com/attachments/1404667971078459412/1418078042596573265/548465965_1597541707883047_8064824227716457744_n.png')
        .setImage('https://cdn.discordapp.com/attachments/1404667971078459412/1418078041933877289/548957804_1311038923851980_8844997152190400872_n.png')
        .setColor('#6A0DAD')
        .addFields(
            { name: '🔒 1. All channels are locked', value: 'For Guildmeyts/Adamsonians/Casuals only. Follow the guidelines before joining any voice or chat channels.' },
            { name: '📝 2. Registered Guildmeyts', value: 'Change your nickname to `AdUG | [name]` (Ex.: AdUG: Falcon).' },
            { name: '✅ 3. Get Guildmeyt role', value: 'Complete the application form upon joining. Officers will verify your legitimacy.' },
            { name: '🎁 4. Guildmeyt perks', value: 'Being a Guildmeyt grants access to exclusive channels and perks.' },
            { name: '❓ 5. Questions or concerns', value: 'Use the Tickets channel and wait for an officer to respond.' },
            { name: '💜 Happy Gaming!', value: '\u200B' }
        )
        .setTimestamp();

    await sendMessageIfNotExists(channel, key, { embeds: [rulesEmbed] });
}

// --- ON READY ---
client.once('ready', async () => {
    console.log(`Bot ready: ${client.user.tag}`);
    const rrChannel = await client.channels.fetch(config.reactionRolesChannelId);
    const verifiedChannel = await client.channels.fetch(config.verifiedChannelId);
    const rulesChannel = await client.channels.fetch(config.rulesChannelId);

    await sendReactionRoles(rrChannel, games);
    await sendVerifyMessage(verifiedChannel, 'verifyMessage');
    await sendRulesMessage(rulesChannel, 'rulesMessage');
});

// --- EVENTS ---

// Welcome new members
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (!channel) return;

    channel.send({
        content: `🎉 **Welcome to AdU Game!** 🎮\n\nHey ${member}! Glad you joined us! Here's how to get started:\n\n✅ **Verify yourself** in <#${config.verifiedChannelId}>\n📌 **Read the rules** in <#${config.rulesChannelId}>\n🎮 **Pick your game roles** in <#${config.reactionRolesChannelId}>\n\nHave fun, play fair, and let's level up together! 💜`,
        allowedMentions: { parse: ['users'] }
    });
});

// Reaction roles (add/remove)
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot || reaction.message.channel.id !== config.reactionRolesChannelId) return;
    if (reaction.partial) await reaction.fetch().catch(console.error);

    const game = games.find(g => g.emoteId === (reaction.emoji.id || reaction.emoji.name));
    if (!game) return;

    const member = reaction.message.guild.members.cache.get(user.id);
    const role = reaction.message.guild.roles.cache.get(game.roleId);
    if (role && member) member.roles.add(role).catch(console.error);
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot || reaction.message.channel.id !== config.reactionRolesChannelId) return;
    if (reaction.partial) await reaction.fetch().catch(console.error);

    const game = games.find(g => g.emoteId === (reaction.emoji.id || reaction.emoji.name));
    if (!game) return;

    const member = reaction.message.guild.members.cache.get(user.id);
    const role = reaction.message.guild.roles.cache.get(game.roleId);
    if (role && member) member.roles.remove(role).catch(console.error);
});

// Verification button
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton() || interaction.customId !== 'verify_button') return;

    const member = interaction.guild.members.cache.get(interaction.user.id);
    const role = interaction.guild.roles.cache.get(config.verifiedRoleId);
    if (!member || !role) return interaction.reply({ content: 'Something went wrong.', ephemeral: true });

    if (member.roles.cache.has(role.id)) {
        await interaction.reply({ content: 'You are already verified!', ephemeral: true });
    } else {
        await member.roles.add(role);
        await interaction.reply({ content: 'You are now verified! 🎉', ephemeral: true });
    }
});

// Boost messages
client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (!oldMember.premiumSince && newMember.premiumSince) {
        const boostChannel = newMember.guild.channels.cache.get(config.boostChannelId);
        if (!boostChannel) return;
        boostChannel.send(`🚀 Thank you ${newMember.user} for boosting the server! 💜`);
    }
});

// Introduction messages
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Introduction
    if (message.channel.id === config.introChannelId) {
        const embed = new EmbedBuilder()
            .setTitle('👋 New Introduction!')
            .setDescription(`${message.author} says:\n\n${message.content}`)
            .setColor('#00FF00')
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
        message.delete().catch(console.error);
    }

    // Birthday set
    if (message.channel.id === config.birthdaySetChannelId) {
        const content = message.content.trim();
        const [month, day] = content.split('-').map(Number);
        if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
            return message.reply('❌ Invalid format! Use MM-DD (e.g., 08-19).');
        }

        const birthdays = JSON.parse(fs.readFileSync(config.birthdayFile, 'utf-8'));
        const existing = birthdays.find(b => b.id === message.author.id);
        if (existing) {
            existing.month = month;
            existing.day = day;
        } else {
            birthdays.push({ id: message.author.id, month, day });
        }

        fs.writeFileSync(config.birthdayFile, JSON.stringify(birthdays, null, 2));
        message.reply(`✅ Your birthday is set to ${month}-${day}!`);
    }
});

// --- BIRTHDAY FEATURE ---
setInterval(async () => {
    const today = new Date();
    const key = `${today.getMonth() + 1}-${today.getDate()}`;

    // Reset daily
    if (!birthdaySent.lastDate || birthdaySent.lastDate !== key) {
        birthdaySent.lastDate = key;
        birthdaySent.users = [];
    }

    const birthdays = JSON.parse(fs.readFileSync(config.birthdayFile, 'utf-8'));
    const birthdayUsers = birthdays.filter(b => b.day === today.getDate() && b.month === today.getMonth() + 1);
    if (!birthdayUsers.length) return;

    const channel = await client.channels.fetch(config.birthdayGreetChannelId);
    if (!channel) return;

    for (const user of birthdayUsers) {
        if (birthdaySent.users.includes(user.id)) continue;

        const embed = new EmbedBuilder()
            .setTitle('🎂 Happy Birthday! 🎉')
            .setDescription(`Hey <@${user.id}>, everyone wishes you an amazing day! 💜`)
            .setColor('#FFC0CB')
            .setImage('https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif')
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        birthdaySent.users.push(user.id);
    }

    fs.writeFileSync(config.birthdaySentFile, JSON.stringify(birthdaySent, null, 2));
}, 1000 * 60 * 60); // checks every hour

























