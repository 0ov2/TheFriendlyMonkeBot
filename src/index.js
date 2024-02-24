//
//  :packages:
const { Client } = require("discord.js");
require("dotenv").config();

//
//  :code:
const { setUpAvailabilityCronJobs, manualPostAv } = require("./js/cron");
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

const superPowers = [
  "259466508814516224",
  "206848734867226634",
  "156861171062931456",
];

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

  if (message.content === "!pa" && superPowers.includes(message.author.id)) {
    manualPostAv(client)
  }

  if (message.content.includes("!cmatch")) {
    cheekiMonke.confirmMatch(message)
  }
  try {
    if (message.content.includes("!delm")) { 
      cheekiMonke.deleteMessagesInThisChannel(message);
    }
  
    if (message.content.includes("!decline")) { 
      await cheekiMonke.declineMatch(message)
    }
  
    if (message.content.includes("!reorder")) { 
      await cheekiMonke.reorderScheduleMessages(message)
    }
  
    if (message.content.includes("!changeTime")) { 
      await cheekiMonke.changeMatchTime(message)
    }
  } catch (error) {
    console.log(error);
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
    try {
      await cheekiMonke.handleCheekiBreachabilityReactionAdd(
        epochTime,
        messageFromChannel
      );
    } catch (error) {
      console.log(error);
    }
  }
  if (channel.name === "cheeki-schedule") {
    if (!epochTime) {
      return;
    }
    try {
      await cheekiMonke.handleCheekiScheduleReactionAdd(message, user, epochTime);
    } catch (error) {
      console.log(error);
    }
  }
  if (channel.name === "cheeki-confirm") {
    try {
      await cheekiMonke.handleCheekiConfirmReactionAdd(message, epochTime);
    } catch (error) {
      console.log(error);
    }
  }

  if (message.emoji.name === "❓" && channel.name !== "cheeki-breachability") {
    try {
      cheekiMonke.deleteTestMessage(message, user)
    } catch (error) {
      console.log(error);
    }
  }

  if (channel.name === "cheeki-matches") {
    try {
      await cheekiMonke.handleCheekiMatchesReactionAdd(
        epochTime,
        messageFromChannel
      );
    } catch (error) {
      console.log(error);
    }
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
    try {
      cheekiMonke.handleCheekiScheduleReactionRemove(
        epochTime,
        messageFromChannel
      );
    } catch (error) {
      console.log(error);
    }
  }

  if (channel.name === "cheeki-matches") {
    try {
      await cheekiMonke.handleCheekiMatchesReactionRemove(
        epochTime,
        messageFromChannel
      );
    } catch (error) {
      console.log(error);
    }
  }
});

client.login(process.env.TOKEN);
