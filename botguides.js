const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Events } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Embeds for each bot
const embeds = {
  lunabot: new EmbedBuilder()
    .setColor(0x7289da)
    .setTitle("🎶 Bot Guide: Lunabot")
    .setDescription("Lunabot is a multifunctional bot with music, fun, and moderation features.")
    .addFields(
      { name: "📌 Music Commands", value: "`/play <song>` • `/skip` • `/stop` • `/queue`" },
      { name: "🎭 Fun Commands", value: "`/anime` • `/quote` • `/meme`" },
      { name: "🛡️ Moderation", value: "`/ban` • `/kick` • `/warn`" },
      { name: "❓ Help", value: "Type `/help` to see the full list of commands." }
    )
    .setFooter({ text: "Bot Guides • Lunabot" })
    .setTimestamp(),

  flavibot: new EmbedBuilder()
    .setColor(0xffa500)
    .setTitle("🎶 Bot Guide: FlaviBot")
    .setDescription("FlaviBot is a lightweight music and utility bot.")
    .addFields(
      { name: "📌 Music Commands", value: "`/play <song>` • `/pause` • `/resume` • `/lyrics`" },
      { name: "⚙️ Utility", value: "`/userinfo` • `/serverinfo`" },
      { name: "🎭 Fun", value: "`/8ball` • `/roll`" },
      { name: "❓ Help", value: "Use `/help` for more." }
    )
    .setFooter({ text: "Bot Guides • FlaviBot" })
    .setTimestamp(),

  rythm: new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle("🎶 Bot Guide: Rythm")
    .setDescription("Rythm is a dedicated music bot for high-quality sound in voice channels.")
    .addFields(
      { name: "📌 Music Commands", value: "`!play <song>` • `!skip` • `!stop` • `!queue` • `!np`" },
      { name: "🎶 Playlist Support", value: "Play entire YouTube/Spotify playlists." },
      { name: "⚙️ Other Features", value: "`!lyrics <song>` • `!remove <position>`" },
      { name: "❓ Help", value: "Type `!help` to explore all commands." }
    )
    .setFooter({ text: "Bot Guides • Rythm" })
    .setTimestamp(),

  dank: new EmbedBuilder()
    .setColor(0x00ff99)
    .setTitle("😂 Bot Guide: Dank Memer")
    .setDescription("The funniest (and richest 💰) bot in Discord. Economy + memes!")
    .addFields(
      { name: "🎭 Fun Commands", value: "`pls meme` • `pls joke` • `pls image <type>`" },
      { name: "💰 Economy", value: "`pls beg` • `pls hunt` • `pls fish` • `pls work` • `pls daily`" },
      { name: "🎲 Gambling", value: "`pls slots` • `pls coinflip` • `pls gamble <amount>`" },
      { name: "❓ Help", value: "Type `pls help` for the full command list." }
    )
    .setFooter({ text: "Bot Guides • Dank Memer" })
    .setTimestamp()
};

// Dropdown menu
const guideMenu = new ActionRowBuilder().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId("guideMenu")
    .setPlaceholder("Select a bot guide...")
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel("Lunabot").setValue("lunabot").setEmoji("🎶"),
      new StringSelectMenuOptionBuilder().setLabel("FlaviBot").setValue("flavibot").setEmoji("🎶"),
      new StringSelectMenuOptionBuilder().setLabel("Rythm").setValue("rythm").setEmoji("🎶"),
      new StringSelectMenuOptionBuilder().setLabel("Dank Memer").setValue("dank").setEmoji("😂")
    )
);

// Command to show the guide selector
client.on("messageCreate", async (message) => {
  if (message.content === "!guides") {
    await message.reply({
      content: "📚 Choose a bot to see its guide:",
      components: [guideMenu]
    });
  }
});

// Handle menu selections (per user reply)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === "guideMenu") {
    const selected = interaction.values[0];
    await interaction.reply({
      content: `📖 Here’s your selected guide, ${interaction.user}:`,
      embeds: [embeds[selected]],
      ephemeral: true // only visible to the user who picked
    });
  }
});

client.login(process.env.TOKEN);
