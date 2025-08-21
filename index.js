require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers
    ] 
});

// === CONFIG ===
const token = process.env.BOT_TOKEN;
if (!token) { console.error("❌ BOT_TOKEN missing in .env"); process.exit(1); }

const config = {
    welcomeChannelId: '1404097606988075040',
    reactionRolesChannelId: '1407307017621864550',
    verifiedChannelId: '1407271197544022118',
    verifiedRoleId: '1407318706412978248',
    rulesChannelId: '1404104982638104789',
    introChannelId: '1407360906739978281',
    birthdaySetChannelId: '1407436351284052199',
    birthdayGreetChannelId: '1407435745387610218',
    boostChannelId: '1407352144067301458',
    botMessagesFile: './botMessages.json',
    birthdayFile: './birthdays.json'
};

// Ensure data files exist
if (!fs.existsSync(config.botMessagesFile)) fs.writeFileSync(config.botMessagesFile, '{}');
if (!fs.existsSync(config.birthdayFile)) fs.writeFileSync(config.birthdayFile, '[]');

let botMessages = JSON.parse(fs.readFileSync(config.botMessagesFile, 'utf-8'));
function saveMessages() { fs.writeFileSync(config.botMessagesFile, JSON.stringify(botMessages, null, 2)); }

// === GAME ROLES ===
const games = [
    { name: 'Valorant', emote: 'valo', roleId: '1404108937300803615' },
    { name: 'MLBB', emote: 'ml', roleId: '1404108965331075112' },
    { name: 'Call of Duty', emote: 'cod', roleId: '1404108994582417428' },
    { name: 'NBA 2K', emote: 'nba', roleId: '1404109015516057650' },
    { name: 'League of Legends', emote: 'lol', roleId: '1404109092514955345' },
    { name: 'Wild Rift', emote: 'WildRift', roleId: '1404109126572965958' },
    { name: 'Team Fight Tactics', emote: 'tft', roleId: '1404112145821733015' },
    { name: 'Roblox', emote: 'roblox', roleId: '1404115005657452655' },
    { name: 'Left 4 Dead', emote: 'l4d', roleId: '1404115035608973382' },
    { name: 'GTA', emote: 'GTA', roleId: '1404115078952783922' },
    { name: 'Overwatch', emote: 'Overwatch', roleId: '1404115102680219888' },
    { name: 'Fall Guys', emote: 'fg', roleId: '1404115130849034280' },
    { name: 'Crab Game', emote: 'cg', roleId: '1404115159584215131' },
    { name: 'Once Human', emote: 'oh', roleId: '1404115187505565747' },
    { name: 'Fortnite', emote: 'fortnite', roleId: '1404115224214241413' },
    { name: 'Honor of Kings', emote: 'hok', roleId: '1404118277088739348' },
    { name: 'Tekken', emote: 'tekken', roleId: '1404118222072057856' },
    { name: 'Honkai', emote: 'honkai', roleId: '1404118159878914170' },
    { name: 'Rainbow Six Siege', emote: 'r6s', roleId: '1404118099246190684' },
    { name: 'Pokémon Unite', emote: 'pokeunite', roleId: '1404118058745987072' },
    { name: 'PUBG', emote: 'pubg', roleId: '1404118026709635113' },
    { name: 'Minecraft', emote: 'minecraft', roleId: '1404117972892651602' },
    { name: 'Genshin Impact', emote: 'genshin', roleId: '1404117936700002405' },
    { name: 'Farlight 84', emote: 'farlight', roleId: '1404117902763884575' },
    { name: 'Dota 2', emote: 'dota2', roleId: '1404117878134800414' },
    { name: 'COD Mobile', emote: 'codm', roleId: '1404117846417477632' },
    { name: 'CS:GO', emote: 'csgo', roleId: '1404117795423125535' },
    { name: 'Apex Legends', emote: 'apex', roleId: '1404115358385836162' },
    { name: 'Among Us', emote: 'amogus', roleId: '1404115334583161015' },
    { name: 'Clash of Clans', emote: 'cc', roleId: '1404115250260742274' }
];

const games1 = games.slice(0, Math.ceil(games.length / 2));
const games2 = games.slice(Math.ceil(games.length / 2));

// --- SEND REACTION ROLES ---
async function sendGamesMessage(channel, gamesArray, key) {
    let description = '**🎮 React to get your game role!**\n\n';
    gamesArray.forEach(game => description += `:${game.emote}: - **${game.name}**\n`);
    const msg = await channel.send(description);
    for (const game of gamesArray) {
        try { await msg.react(game.emote); } catch(e) { console.log(`Emoji not found: ${game.emote}`); }
    }
    botMessages[key] = msg.id;
    saveMessages();
    return msg;
}

async function sendReactionRoles(channel) {
    if (!botMessages.reactionRoles1) await sendGamesMessage(channel, games1, 'reactionRoles1');
    if (!botMessages.reactionRoles2) await sendGamesMessage(channel, games2, 'reactionRoles2');
}

// === ON READY ===
client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    // Channels
    const rrChannel = await client.channels.fetch(config.reactionRolesChannelId);
    if (rrChannel) await sendReactionRoles(rrChannel);

    const welcomeChannel = await client.channels.fetch(config.welcomeChannelId);
    if (welcomeChannel) welcomeChannel.send(`🎉 **Welcome to the server!**`);

    const rulesChannel = await client.channels.fetch(config.rulesChannelId);
    if (rulesChannel && !botMessages.rules) {
        const rulesText = `📜 **Server Rules**\n1️⃣ Be nice\n2️⃣ No spam\n3️⃣ Follow Discord TOS\n4️⃣ Have fun!`;
        const msg = await rulesChannel.send(rulesText);
        botMessages.rules = msg.id;
        saveMessages();
    }

    const verifiedChannel = await client.channels.fetch(config.verifiedChannelId);
    if (verifiedChannel && !botMessages.verifyButton) {
        const button = new ButtonBuilder().setCustomId('verify_button').setLabel('✅ Verify').setStyle(ButtonStyle.Success);
        const row = new ActionRowBuilder().addComponents(button);
        const msg = await verifiedChannel.send({ content: 'Click to verify yourself!', components: [row] });
        botMessages.verifyButton = msg.id;
        saveMessages();
    }
});

// === REACTION ROLE HANDLERS ===
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot || reaction.message.channel.id !== config.reactionRolesChannelId) return;
    const game = games.find(g => g.emote === reaction.emoji.name);
    const member = reaction.message.guild.members.cache.get(user.id);
    const role = game ? reaction.message.guild.roles.cache.get(game.roleId) : null;
    if (role && member) member.roles.add(role).catch(console.error);
});

client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot || reaction.message.channel.id !== config.reactionRolesChannelId) return;
    const game = games.find(g => g.emote === reaction.emoji.name);
    const member = reaction.message.guild.members.cache.get(user.id);
    const role = game ? reaction.message.guild.roles.cache.get(game.roleId) : null;
    if (role && member) member.roles.remove(role).catch(console.error);
});

// === VERIFY BUTTON ===
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'verify_button') {
        const member = interaction.guild.members.cache.get(interaction.user.id);
        const role = interaction.guild.roles.cache.get(config.verifiedRoleId);
        if (!member || !role) return interaction.reply({ content: 'Error!', ephemeral: true });
        if (!member.roles.cache.has(role.id)) await member.roles.add(role);
        await interaction.reply({ content: '✅ You are now verified!', ephemeral: true });
    }
});

// === BOOST MESSAGE ===
client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (!oldMember.premiumSince && newMember.premiumSince) {
        const boostChannel = newMember.guild.channels.cache.get(config.boostChannelId);
        if (!boostChannel) return;
        boostChannel.send(`🚀 Thank you ${newMember.user} for boosting the server! 💜`);
    }
});

// === BIRTHDAY FEATURE ===
setInterval(async () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;

    const birthdays = JSON.parse(fs.readFileSync(config.birthdayFile, 'utf-8'));
    const birthdayUsers = birthdays.filter(b => b.day === day && b.month === month);
    if (!birthdayUsers.length) return;

    const birthdayChannel = await client.channels.fetch(config.birthdayGreetChannelId);
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
}, 1000 * 60 * 60); // checks hourly

// --- BIRTHDAY SET COMMAND ---
client.on('messageCreate', async message => {
    if (message.channel.id !== config.birthdaySetChannelId || message.author.bot) return;

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
});

// === LOGIN ===
client.login(token).catch(console.error);








