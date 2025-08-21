require('dotenv').config(); // loads .env if present

const express = require("express");
const app = express();
const fs = require('fs');
const { 
    Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder 
} = require('discord.js');

// --- EXPRESS SERVER ---
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(3000, () => console.log("Web server is running on port 3000"));

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

// --- CONFIG ---
const token = process.env.BOT_TOKEN;
if (!token) {
    console.error("❌ No bot token found! Set BOT_TOKEN in .env or Replit Secrets.");
    process.exit(1);
}
const welcomeChannelId = '1404097606988075040';
const reactionRolesChannelId = '1407307017621864550';
const verifiedChannelId = '1407271197544022118';
const verifiedRoleId = '1407318706412978248';
const rulesChannelId = '1404104982638104789';
const introChannelId = '1407360906739978281';
const birthdaySetChannelId = '1407436351284052199';
const birthdayGreetChannelId = '1407435745387610218';
const boostChannelId = '1407352144067301458'; 
const birthdayFile = './birthdays.json';

// Ensure birthdays.json exists
if (!fs.existsSync(birthdayFile)) fs.writeFileSync(birthdayFile, '[]');

// === WELCOME MESSAGE ===
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;
    channel.send({
        content: `🎉 **Welcome to AdU Game!** 🎮\n\nHey ${member}! Glad you joined us! Here's how to get started:\n\n✅ **Verify yourself** in <#${verifiedChannelId}>  \n📌 **Read the rules** in <#${rulesChannelId}>  \n🎮 **Pick your game roles** in <#${reactionRolesChannelId}>\n\nHave fun, play fair, and let's level up together! 💜`,
        allowedMentions: { parse: ['users'] }
    });
});

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

// Send reaction roles
async function sendReactionRoles(channel, gamesArray, fileName) {
    let msg;
    let messageId;

    if (fs.existsSync(fileName)) {
        messageId = fs.readFileSync(fileName, 'utf-8');
        try { msg = await channel.messages.fetch(messageId); } 
        catch (err) { console.log('Previous reaction roles message not found:', err); }
    }

    if (!msg) {
        let description = '**🎮 React to get your game role!**\n\n';
        gamesArray.forEach(game => {
            const emoji = channel.guild.emojis.cache.find(e => e.name === game.emote);
            description += `${emoji ? emoji : `:${game.emote}:`} - **${game.name}**\n`;
        });
        msg = await channel.send(description);
        fs.writeFileSync(fileName, msg.id);
    }

    for (const game of gamesArray) {
        const emoji = msg.guild.emojis.cache.find(e => e.name === game.emote);
        if (emoji) await msg.react(emoji);
    }
}

// === ON READY ===
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Reaction roles
    const rrChannel = await client.channels.fetch(reactionRolesChannelId);
    await sendReactionRoles(rrChannel, games1, 'reactionMessage1.txt');
    await sendReactionRoles(rrChannel, games2, 'reactionMessage2.txt');

    // Verification button
    const verifiedChannel = await client.channels.fetch(verifiedChannelId);
    if (verifiedChannel) {
        const messages = await verifiedChannel.messages.fetch({ limit: 10 });
        const msgExists = messages.find(m => m.author.id === client.user.id && m.components.length > 0);
        if (!msgExists) {
            const button = new ButtonBuilder().setCustomId('verify_button').setLabel('✅ Verify').setStyle(ButtonStyle.Success);
            const row = new ActionRowBuilder().addComponents(button);
            await verifiedChannel.send({ content: 'Click the button below to verify yourself and gain access to the server!', components: [row] });
        }
    }

    // Rules message
    const rulesChannel = await client.channels.fetch(rulesChannelId);
    if (rulesChannel) {
        const rulesText = `📜 **Server Rules – AdU Game** 🎮\n\n1️⃣ Respect Everyone\n2️⃣ No Cheating or Exploiting\n3️⃣ Keep Channels On Topic\n4️⃣ No Self-Promotion\n5️⃣ Follow Discord TOS\n6️⃣ Be Sportsmanlike\n7️⃣ Voice Channel Etiquette\n8️⃣ No NSFW Content\n9️⃣ Listen to Staff\n🔟 Have Fun!\n\n💡 Please read carefully and follow the rules to keep the server awesome!`;
        const messages = await rulesChannel.messages.fetch({ limit: 10 });
        const alreadySent = messages.find(m => m.content.includes('📜 **Server Rules'));
        if (!alreadySent) await rulesChannel.send(rulesText);
    }
});

// === REACTION ROLE HANDLERS ===
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.message.channel.id !== reactionRolesChannelId) return;

    const game = games.find(g => g.emote === reaction.emoji.name);
    if (!game) return;

    const member = reaction.message.guild.members.cache.get(user.id);
    const role = reaction.message.guild.roles.cache.get(game.roleId);
    if (role && member) member.roles.add(role).catch(console.error);
});
client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.message.channel.id !== reactionRolesChannelId) return;

    const game = games.find(g => g.emote === reaction.emoji.name);
    if (!game) return;

    const member = reaction.message.guild.members.cache.get(user.id);
    const role = reaction.message.guild.roles.cache.get(game.roleId);
    if (role && member) member.roles.remove(role).catch(console.error);
});

// === VERIFICATION BUTTON ===
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'verify_button') {
        try {
            const member = interaction.guild.members.cache.get(interaction.user.id);
            const role = interaction.guild.roles.cache.get(verifiedRoleId);
            if (!member || !role) return interaction.reply({ content: 'Something went wrong. Please contact a mod.', ephemeral: true });
            if (member.roles.cache.has(role.id)) {
                await interaction.reply({ content: 'You are already verified!', ephemeral: true });
            } else {
                await member.roles.add(role);
                await interaction.reply({ content: 'You are now verified! 🎉', ephemeral: true });
            }
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'There was an error assigning your role.', ephemeral: true });
        }
    }
});

// === BOOST MESSAGE ===
client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (!oldMember.premiumSince && newMember.premiumSince) {
        const boostChannel = newMember.guild.channels.cache.get(boostChannelId);
        if (!boostChannel) return;
        boostChannel.send(`🚀 Thank you ${newMember.user} for boosting the server! Your support helps us level up! 💜`);
    }
});

// === INTRO CHANNEL ===
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

// === BIRTHDAY FEATURE ===
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
            .setDescription(`Hey <@${user.id}>, everyone in the server wishes you an amazing day! 💜`)
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
    if (existing) {
        existing.month = month;
        existing.day = day;
    } else {
        birthdays.push({ id: message.author.id, month, day });
    }
    fs.writeFileSync(birthdayFile, JSON.stringify(birthdays, null, 2));
    message.reply(`✅ Your birthday is set to ${month}-${day}!`);
});

// === LOGIN ===
client.login(token);








