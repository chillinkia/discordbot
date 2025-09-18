// index.js
const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');
const fs = require('fs');

// =============================
// CONFIG (replace with your IDs)
// =============================
const TOKEN = "MTQwNzI3NTY4NTc1OTY4MDUxMg.GKowcw.FiyfaAyBvRbOupdAVcpW7G9Er2jv87WoK5-pZA"; //
const GUILD_ID = "1404097287348682842"; 
const RULES_CHANNEL_ID = "1404104982638104789"; 
const VERIFY_CHANNEL_ID = "1407271197544022118"; 
const ROLES_CHANNEL_ID = "1407307017621864550"; 
const VERIFIED_ROLE_ID = "1404107837851832410"; 

// =============================
// BOT SETUP
// =============================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Store sent messages so we don’t resend
let botMessages = {};

// =============================
// RULES EMBED
// =============================
async function sendRulesMessage(channel, key) {
    if (botMessages[key]) {
        try {
            const existingMsg = await channel.messages.fetch(botMessages[key]);
            if (existingMsg) return;
        } catch {}
    }

    const embed = new EmbedBuilder()
        .setColor('#1E90FF')
        .setTitle('📜 AdU Game Rules & Guidelines')
        .setThumbnail('https://i.ibb.co/VCXHcY2/server-icon.png') 
        .setImage('https://i.ibb.co/WDcBKy3/server-banner.png')   
        .setDescription(
            `1️⃣ **All channels are locked.** For casuals/Adamsonians/Guildmeyts only!  
            Before you can join any voice or chat channels, follow the guidelines and read the rules below.  

            2️⃣ If you are a registered **Guildmeyt**, change your nickname to:  
            \`AdUG | [name]\`  
            Example: \`AdUG | Falcon\`  

            3️⃣ To get the role of **Guildmeyt**, make sure to answer the **application form** upon joining. This lets us verify that you are part of the GAME.  

            4️⃣ Being a **Guildmeyt** gives you access to exclusive channels and Discord perks!  

            5️⃣ If you have any questions or reports, use the **CONCERNS** category (<#1407924450271301693>) and wait for officers to claim your ticket.  

            ⚠️ Please also remember to:  
            - Respect Everyone  
            - No Cheating or Exploiting  
            - Keep Channels On Topic  
            - No Self-Promotion  
            - Follow Discord TOS  
            - Be Sportsmanlike  
            - No NSFW Content  
            - Listen to Staff  
            - Have Fun! 🎮`
        )
        .setFooter({ 
            text: 'Adamson University Guild of Animation Makers and Esports • Be the Game Changer'
        })
        .setTimestamp();

    const msg = await channel.send({ embeds: [embed] });
    botMessages[key] = msg.id;
}

// =============================
// VERIFY EMBED
// =============================
async function sendVerifyMessage(channel, key) {
    if (botMessages[key]) {
        try {
            const existingMsg = await channel.messages.fetch(botMessages[key]);
            if (existingMsg) return;
        } catch {}
    }

    const embed = new EmbedBuilder()
        .setColor('#32CD32')
        .setTitle('✅ Verify to Access the Server')
        .setDescription(
            `Welcome to the server! 🎉  
            To unlock channels and become a **Guildmeyt**, click the ✅ reaction below.`
        )
        .setFooter({ text: 'Verification System' });

    const msg = await channel.send({ embeds: [embed] });
    await msg.react('✅');
    botMessages[key] = msg.id;
}

// =============================
// ROLES EMBED
// =============================
async function sendRolesMessage(channel, key) {
    if (botMessages[key]) {
        try {
            const existingMsg = await channel.messages.fetch(botMessages[key]);
            if (existingMsg) return;
        } catch {}
    }

    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎭 Reaction Roles')
        .setDescription(
            `React to get your roles!  

            🎮 - Gamer  
            📚 - Student  
            🏆 - Competitor`
        )
        .setFooter({ text: 'Pick your roles wisely!' });

    const msg = await channel.send({ embeds: [embed] });
    await msg.react('🎮');
    await msg.react('📚');
    await msg.react('🏆');
    botMessages[key] = msg.id;
}

// =============================
// READY
// =============================
client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const guild = await client.guilds.fetch(GUILD_ID);

    // Rules
    const rulesChannel = await guild.channels.fetch(RULES_CHANNEL_ID);
    await sendRulesMessage(rulesChannel, 'rules');

    // Verify
    const verifyChannel = await guild.channels.fetch(VERIFY_CHANNEL_ID);
    await sendVerifyMessage(verifyChannel, 'verify');

    // Roles
    const rolesChannel = await guild.channels.fetch(ROLES_CHANNEL_ID);
    await sendRolesMessage(rolesChannel, 'roles');
});

// =============================
// REACTION HANDLING
// =============================
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;

    const { message } = reaction;

    // ✅ Verify Reaction
    if (message.id === botMessages['verify'] && reaction.emoji.name === '✅') {
        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(user.id);
        await member.roles.add(VERIFIED_ROLE_ID);
        console.log(`✅ Verified: ${member.user.tag}`);
    }

    // 🎭 Role Reactions
    if (message.id === botMessages['roles']) {
        const guild = await client.guilds.fetch(GUILD_ID);
        const member = await guild.members.fetch(user.id);

        if (reaction.emoji.name === '🎮') {
            let role = guild.roles.cache.find(r => r.name === "Gamer");
            if (role) await member.roles.add(role);
        }
        if (reaction.emoji.name === '📚') {
            let role = guild.roles.cache.find(r => r.name === "Student");
            if (role) await member.roles.add(role);
        }
        if (reaction.emoji.name === '🏆') {
            let role = guild.roles.cache.find(r => r.name === "Competitor");
            if (role) await member.roles.add(role);
        }
    }
});

// =============================
// START BOT
// =============================
client.login(TOKEN);




















