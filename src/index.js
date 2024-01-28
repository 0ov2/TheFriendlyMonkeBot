//
//  :packages:
const { Client } = require("discord.js");
require("dotenv").config();

//
//  :code:
const { setUpAvailabilityCronJobs } = require("./js/cron");
const { getDiscordChannelObjectByID } = require("./js/util");
const { CheekiMonke } = require("./js/classes/cheekiMonke");

//
//  :statics:
const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION", "USER"],
  intents: [
    "GUILD_VOICE_STATES",
    "GUILDS",
    "GUILD_MEMBERS",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
    "DIRECT_MESSAGES",
  ],
});

//
//  CheekMonke

//
//  :runtime:
//  This is our main runtime, this fires when the bot starts up
client.on("ready", async () => {
  //
  //  Lets set up our avilability cron
  setUpAvailabilityCronJobs(client);
});

client.on("messageCreate", async (message) => {
  let cheekiMonke = new CheekiMonke(client);
  cheekiMonke.runtime();

  if (message.content === "/bdel") {
    cheekiMonke.bulkDeleteMessagesInThisChannel(message);
  }

  //
  //  For testing
  if (message.content === "!areyoualive") {
    cheekiMonke.testWeHaveWhatWeNeed(message)
  } 
});

client.on("messageReactionAdd", async (message, user) => {
  if (user.bot) return;

  let epochTime = null;
  let cheekiMonke = new CheekiMonke(client);
  cheekiMonke.runtime();

  const channel = getDiscordChannelObjectByID(
    client,
    message.message.channelId
  );
  const messageFromChannel = await channel.messages.fetch(message.message.id);
  const messageContent = messageFromChannel.content;
  const regexOutput = messageContent.match(/<t:(\d+):F>/);

  if (regexOutput) {
    epochTime = regexOutput[1];
  }

  //
  //  :Handlers:
  if (channel.name === "cheeki-breachability") {
    await cheekiMonke.handleCheekiBreachabilityReactionAdd(
      epochTime,
      messageFromChannel
    );
  }
  if (channel.name === "cheeki-schedule") {
    if (!epochTime) {
      return;
    }
    await cheekiMonke.handleCheekiScheduleReactionAdd(message, user, epochTime);
  }
  if (channel.name === "cheeki-confirm") {
    await cheekiMonke.handleCheekiConfirmReactionAdd(message, epochTime);
  }

  if (message.emoji.name === "❓") {
    cheekiMonke.deleteTestMessage(message, user)
  }
});

client.on("messageReactionRemove", async (message, user) => {
  if (user.bot) return;

  let epochTime = null;
  let cheekiMonke = new CheekiMonke(client);
  cheekiMonke.runtime();

  const channel = getDiscordChannelObjectByID(
    client,
    message.message.channelId
  );

  //
  //  :step 2:
  //  Get the amount of reactions and the epoch time from the message
  const messageFromChannel = await channel.messages.fetch(message.message.id);
  const messageContent = messageFromChannel.content;
  const regexOutput = messageContent.match(/<t:(\d+):F>/);

  if (regexOutput) {
    epochTime = regexOutput[1];
  }

  if (channel.name === "cheeki-breachability") {
    cheekiMonke.handleCheekiScheduleReactionRemove(
      epochTime,
      messageFromChannel
    );
  }
});

client.login(process.env.TOKEN);
