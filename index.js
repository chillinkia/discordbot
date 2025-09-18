const express = require('express');
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

// --- CONFIG FROM RENDER ENV ---
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("❌ No bot token found! Set BOT_TOKEN in Render environment variables.");
  process.exit(1);
}

// Optional debug: check token length only
console.log("Bot token length:", token.length);

// Channel & role IDs
const welcomeChannelId = process.env.WELCOME_CHANNEL_ID || '1404097606988075040';
const reactionRolesChannelId = process.env.ROLES_CHANNEL_ID || '1407307017621864550';
const verifiedChannelId = process.env.VERIFY_CHANNEL_ID || '1407271197544022118';
const verifiedRoleId = process.env.VERIFIED_ROLE_ID || '1404107837851832410';
const rulesChannelId = process.env.RULES_CHANNEL_ID || '1404104982638104789';
const introChannelId = process.env.INTRO_CHANNEL_ID || '1407360906739978281';
const birthdaySetChannelId = process.env.BIRTHDAY_SET_CHANNEL_ID || '1407436351284052199';
const birthdayGreetChannelId = process.env.BIRTHDAY_GREET_CHANNEL_ID || '1407435745387610218';
const boostChannelId = process.env.BOOST_CHANNEL_ID || '1407352144067301458';
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
  { name: 'League of Legends', emoteId: '1407300447231803494', roleId: '1404109092514955345' }
  // add more roles if needed
];

// --- FUNCTIONS ---
async function sendReactionRoles(channel, gamesArray, keyPrefix = 'reactionRoles') {
  const maxReactions = 20;
  const totalMessages = Math.ceil(gamesArray.length / maxReactions);

  for (let i = 0; i < totalMessages; i++) {
    const slice = gamesArray.slice(i * maxReactions, (i + 1) * maxReactions);
    const key = `${keyPrefix}_${i}`;
    let msg;

    if (botMessages[key]) {
      try { msg = await channel.messages.fetch(botMessages[key]); } catch {}
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

// --- EVENTS ---
client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;
  channel.send({
    content: `🎉 Welcome ${member}! Verify in <#${verifiedChannelId}>, read rules <#${rulesChannelId}>, pick roles <#${reactionRolesChannelId}>.`,
    allowedMentions: { parse: ['users'] }
  });
});

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  const rrChannel = await client.channels.fetch(reactionRolesChannelId);
  const verifiedChannel = await client.channels.fetch(verifiedChannelId);
  const rulesChannel = await client.channels.fetch(rulesChannelId);

  await sendReactionRoles(rrChannel, games);
  await sendVerifyMessage(verifiedChannel, 'verifyMessage');
  await sendRulesMessage(rulesChannel, 'rulesMessage');
});

// Reaction roles
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

// Verify button
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
    } catch {
      interaction.reply({ content: 'Error assigning role.', flags: InteractionResponseFlags.Ephemeral });
    }
  }
});

// --- LOGIN ---
client.login(token);
























