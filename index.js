// -------------------- IMPORTS --------------------
const { 
    Client, GatewayIntentBits, Partials, EmbedBuilder, 
    ActionRowBuilder, ButtonBuilder, ButtonStyle, Events 
} = require("discord.js");
const express = require("express");
const fs = require("fs");

// -------------------- CONFIG --------------------
const GUILD_ID = "1404097287348682842";

// Channels
const RULES_CHANNEL_ID = "1404104982638104789";
const VERIFY_CHANNEL_ID = "1407271197544022118";
const ROLES_CHANNEL_ID = "1407307017621864550";
const WELCOME_CHANNEL_ID = "1404118573516990505";

// Roles
const VERIFIED_ROLE_ID = "1404107837851832410";

// Save bot messages
const botMessagesFile = "./botMessages.json";
if (!fs.existsSync(botMessagesFile)) fs.writeFileSync(botMessagesFile, "{}");
let botMessages = JSON.parse(fs.readFileSync(botMessagesFile, "utf-8"));

// Birthday storage
const birthdayFile = "./birthdays.json";
if (!fs.existsSync(birthdayFile)) fs.writeFileSync(birthdayFile, "{}");
let birthdays = JSON.parse(fs.readFileSync(birthdayFile, "utf-8"));

// -------------------- EXPRESS KEEP-ALIVE --------------------
const app = express();
app.get("/", (_, res) => res.send("Bot is running!"));
app.listen(3000, () => console.log("✅ Web server running on port 3000"));

// -------------------- DISCORD CLIENT --------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// -------------------- REACTION ROLES --------------------
const games = [
    { emoji: "<:valorant:1407299610690453569>", name: "Valorant", roleId: "1404108937300803615" },
    { emoji: "<:mlbb:1407300001830273114>", name: "MLBB", roleId: "1404108965331075112" },
    { emoji: "<:cod:1407300193304580259>", name: "Call of Duty", roleId: "1404108994582417428" },
    { emoji: "<:nba2k:1407300324863119491>", name: "NBA 2K", roleId: "1404109015516057650" },
    { emoji: "<:lol:1407300447231803494>", name: "League of Legends", roleId: "1404109092514955345" },
    { emoji: "<:wr:1407300567574909009>", name: "Wild Rift", roleId: "1404109126572965958" },
    { emoji: "<:tft:1407300757325348975>", name: "Team Fight Tactics", roleId: "1404112145821733015" },
    { emoji: "<:roblox:1407300884756693062>", name: "Roblox", roleId: "1404115005657452655" },
    { emoji: "<:l4d:1407301029912907827>", name: "Left 4 Dead", roleId: "1404115035608973382" },
    { emoji: "<:gta:1407301156836868178>", name: "GTA", roleId: "1404115078952783922" },
    { emoji: "<:overwatch:1407301263837630514>", name: "Overwatch", roleId: "1404115102680219888" },
    { emoji: "<:fallguys:1407301367516627035>", name: "Fall Guys", roleId: "1404115130849034280" },
    { emoji: "<:crab:1407301463838818324>", name: "Crab Game", roleId: "1404115159584215131" },
    { emoji: "<:oncehuman:1407301586669015142>", name: "Once Human", roleId: "1404115187505565747" },
    { emoji: "<:fortnite:1407301744664379433>", name: "Fortnite", roleId: "1404115224214241413" },
    { emoji: "<:hok:1407303258673778739>", name: "Honor of Kings", roleId: "1404118277088739348" },
    { emoji: "<:tekken:1407303262536994907>", name: "Tekken", roleId: "1404118222072057856" },
    { emoji: "<:honkai:1407303265816678531>", name: "Honkai", roleId: "1404118159878914170" },
    { emoji: "<:r6s:1407303270074159114>", name: "Rainbow Six Siege", roleId: "1404118099246190684" },
    { emoji: "<:pokemonunite:1407303275727818752>", name: "Pokémon Unite", roleId: "1404118058745987072" },
    { emoji: "<:pubg:1407303377104273429>", name: "PUBG", roleId: "1404118026709635113" },
    { emoji: "<:mc:1407303380468105257>", name: "Minecraft", roleId: "1404117972892651602" },
    { emoji: "<:genshin:1407303382707998790>", name: "Genshin Impact", roleId: "1404117936700002405" },
    { emoji: "<:farlight:1407303385316724736>", name: "Farlight 84", roleId: "1404117902763884575" },
    { emoji: "<:dota:1407303389402108015>", name: "Dota 2", roleId: "1404117878134800414" },
    { emoji: "<:codm:1407300193304580259>", name: "COD Mobile", roleId: "1404117846417477632" },
    { emoji: "<:csgo:1407303394087014400>", name: "CS:GO", roleId: "1404117795423125535" },
    { emoji: "<:apex:1407303485392945282>", name: "Apex Legends", roleId: "1404115358385836162" },
    { emoji: "<:amongus:1407303487536107613>", name: "Among Us", roleId: "1404115334583161015" },
    { emoji: "<:coc:1407303490367131739>", name: "Clash of Clans", roleId: "1404115250260742274" }
];

// -------------------- EVENTS --------------------
client.once(Events.ClientReady, async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const rulesChannel = await client.channels.fetch(RULES_CHANNEL_ID);
    const verifyChannel = await client.channels.fetch(VERIFY_CHANNEL_ID);
    const rolesChannel = await client.channels.fetch(ROLES_CHANNEL_ID);

    await sendRulesMessage(rulesChannel, "rulesMessage");
    await sendVerifyMessage(verifyChannel, "verifyMessage");
    await sendReactionRoles(rolesChannel, "reactionRoles");
});

// Reaction roles
client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (user.bot) return;
    if (reaction.message.channel.id !== ROLES_CHANNEL_ID) return;
    const game = games.find(g => g.emoji === reaction.emoji.toString());
    if (!game) return;
    const member = await reaction.message.guild.members.fetch(user.id);
    await member.roles.add(game.roleId).catch(console.error);
});
client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (user.bot) return;
    if (reaction.message.channel.id !== ROLES_CHANNEL_ID) return;
    const game = games.find(g => g.emoji === reaction.emoji.toString());
    if (!game) return;
    const member = await reaction.message.guild.members.fetch(user.id);
    await member.roles.remove(game.roleId).catch(console.error);
});

// Verify button
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId === "verify_button") {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member) return;
        if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
            await interaction.reply({ content: "✅ You are already verified!", ephemeral: true });
        } else {
            await member.roles.add(VERIFIED_ROLE_ID);
            await interaction.reply({ content: "🎉 You are now verified!", ephemeral: true });
        }
    }
});

// Welcome messages
client.on(Events.GuildMemberAdd, async member => {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;
    channel.send(`👋 Welcome to the server, ${member}! 🎉 Make sure to read the rules in <#${RULES_CHANNEL_ID}> and verify in <#${VERIFY_CHANNEL_ID}>.`);
});

// -------------------- BIRTHDAY + HELP COMMANDS --------------------
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    const prefix = "!";
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "setbday") {
        const date = args[0];
        if (!date || !/^\d{2}-\d{2}$/.test(date)) {
            return message.reply("❌ Format: `!setbday MM-DD`");
        }
        birthdays[message.author.id] = date;
        fs.writeFileSync(birthdayFile, JSON.stringify(birthdays, null, 2));
        return message.reply(`🎂 Birthday set to **${date}**!`);
    }

    if (command === "mybday") {
        const date = birthdays[message.author.id];
        if (!date) return message.reply("❌ You haven’t set a birthday yet.");
        return message.reply(`🎉 Your birthday is set to **${date}**!`);
    }

    if (command === "help") {
        const embed = new EmbedBuilder()
            .setColor("#FFD700")
            .setTitle("📖 Available Commands & Features")
            .setDescription(
                `Here’s what I can do:\n
                ✅ **Verify** → Use the button in <#${VERIFY_CHANNEL_ID}> to unlock channels.
                🎮 **Game Roles** → React in <#${ROLES_CHANNEL_ID}> to get your favorite game roles.
                📜 **Rules** → Read them in <#${RULES_CHANNEL_ID}>.
                🎂 **Birthdays**:
                • \`!setbday MM-DD\` → Save your birthday.
                • \`!mybday\` → Check your saved birthday.
                🎉 I’ll also greet you on your special day!`
            )
            .setFooter({ text: "Adamson University Guild • Be the Game Changer" });
        return message.reply({ embeds: [embed] });
    }
});

// Daily birthday check
setInterval(() => {
    const today = new Date();
    const mmdd = `${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    for (const [userId, date] of Object.entries(birthdays)) {
        if (date === mmdd) {
            const guild = client.guilds.cache.get(GUILD_ID);
            if (!guild) return;
            const channel = guild.channels.cache.get(WELCOME_CHANNEL_ID);
            if (channel) channel.send(`🎂 Happy Birthday <@${userId}>! 🎉`);
        }
    }
}, 1000 * 60 * 60 * 24);

// -------------------- HELPER FUNCTIONS --------------------
async function sendReactionRoles(channel, key) {
    if (botMessages[key]) {
        try { if (await channel.messages.fetch(botMessages[key])) return; } catch {}
    }
    let description = "**🎮 React to get your game role!**\n\n";
    for (const game of games) description += `${game.emoji} - **${game.name}**\n`;
    const msg = await channel.send(description);
    botMessages[key] = msg.id;
    fs.writeFileSync(botMessagesFile, JSON.stringify(botMessages, null, 2));
    for (const game of games) {
        try { await msg.react(game.emoji); } catch {}
    }
}

async function sendVerifyMessage(channel, key) {
    if (botMessages[key]) {
        try { if (await channel.messages.fetch(botMessages[key])) return; } catch {}
    }
    const button = new ButtonBuilder()
        .setCustomId("verify_button")
        .setLabel("✅ Verify")
        .setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder().addComponents(button);
    const msg = await channel.send({ content: "Click the button below to verify yourself!", components: [row] });
    botMessages[key] = msg.id;
    fs.writeFileSync(botMessagesFile, JSON.stringify(botMessages, null, 2));
}

async function sendRulesMessage(channel, key) {
    if (botMessages[key]) {
        try { if (await channel.messages.fetch(botMessages[key])) return; } catch {}
    }
    const embed = new EmbedBuilder()
        .setColor("#1E90FF")
        .setTitle("📜 AdU Game Rules & Guidelines")
        .setThumbnail("https://i.ibb.co/VCXHcY2/server-icon.png")
        .setImage("https://i.ibb.co/WDcBKy3/server-banner.png")
        .setDescription("... your rules text here ...")
        .setFooter({ text: "Adamson University Guild of Animation Makers and Esports • Be the Game Changer" })
        .setTimestamp();
    const msg = await channel.send({ embeds: [embed] });
    botMessages[key] = msg.id;
    fs.writeFileSync(botMessagesFile, JSON.stringify(botMessages, null, 2));
}

// -------------------- LOGIN --------------------
client.login(TOKEN);

















