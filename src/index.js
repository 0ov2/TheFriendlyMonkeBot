//
//  :packages:
const { Client } = require("discord.js");
require("dotenv").config();

//
//  :code:
const { setUpAvailabilityCronJobs } = require("./js/cron");
const {
  getDiscordChannelObject,
  getDiscordChannelObjectByID,
  getSpecificRoleByName,
} = require("./js/util");
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
const userToConfirmScrimID = "259466508814516224";

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

client.on('messageCreate', async (message) => {
  let cheekiMonke = new CheekiMonke(client)
  cheekiMonke.runtime()

  if (message.content === "/bdel") {
    cheekiMonke.bulkDeleteMessagesInThisChannel(message)
  }
})

client.on("messageReactionAdd", async (message, user) => {
  if (user.bot) return;
  let cheekiMonke = new CheekiMonke(client)
  cheekiMonke.runtime()

  //
  //  :step 1:
  //  Check if this message is from cheeki-breachability
  //
  //  :TODO:
  //  Clean this, move to class runtime
  const channel = getDiscordChannelObjectByID(
    client,
    message.message.channelId
  );
  const messageFromChannel = await channel.messages.fetch(message.message.id);
  const messageContent = messageFromChannel.content;
  const regexOutput = messageContent.match(/<t:(\d+):F>/);
  let epochTime = null;

  if (regexOutput) {
    epochTime = regexOutput[1];
  }

  //
  //  :Handlers:
  if (channel.name === "cheeki-breachability") { 
    await cheekiMonke.handleCheekiBreachabilityReactionAdd(epochTime, messageFromChannel)
  }
  if (channel.name === "cheeki-schedule") {
    await cheekiMonke.handleCheekiScheduleReactionAdd(user, epochTime)
  }
  if (channel.name === "cheeki-confirm" ) {
    await cheekiMonke.handleCheekiConfirmReactionAdd(message, epochTime)
  }
});

client.on("messageReactionRemove", async (message, user) => {
  const channel = getDiscordChannelObjectByID(
    client,
    message.message.channelId
  );

  //
  //  :step 1:
  //  Check if this message is from cheeki-breachability
  if (channel.name === "cheeki-breachability") {
    let epochTime = null;
    let reactionCount = null;
    //
    //  :step 2:
    //  Get the amount of reactions and the epoch time from the message
    const messageFromChannel = await channel.messages.fetch(message.message.id);
    const messageContent = messageFromChannel.content;
    const regexOutput = messageContent.match(/<t:(\d+):F>/);
    if (regexOutput) {
      epochTime = regexOutput[1];

      //
      //  :step 3:
      //  We've confirmed that the reaction is valid, now lets count how many other reactions are on this message
      await messageFromChannel.reactions.cache.map(() => {
        reactionCount += 1;
      });

      if (reactionCount <= 0) {
        const cheekiScheduleChannelObject = await getDiscordChannelObject(
          client,
          "cheeki-schedule"
        );
        //
        //  :step 4a:
        //  first try to find the message with the epoch time
        let channelMessages =
          await cheekiScheduleChannelObject.messages.fetch();
        let channelMessage = channelMessages.find(
          (msg) => msg.content.includes(epochTime) && msg.author.bot == true
        );
        if (channelMessage) {
          //
          //  :step 4b:
          //  If there is a message with this epoch time, we need to delete it
          await channelMessage.delete();
        }
      }
    }
  }
});

client.login(process.env.TOKEN);
