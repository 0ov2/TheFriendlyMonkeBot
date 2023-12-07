//
//  :packages:
const { Client } = require("discord.js");
require("dotenv").config();

//
//  :code:
const { setUpAvailabilityCronJobs } = require("./js/cron");
const { getDiscordChannelObject, getDiscordChannelObjectByID } = require("./js/util");

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
  ],
});

//
//  :runtime:
//  This is our main runtime, this fires when the bot starts up
client.on("ready", async () => {
  //
  //  Lets set up our avilability cron
  setUpAvailabilityCronJobs(client);
});

client.on("messageReactionAdd", async (message) => {
    //
    //  :step 1:
    //  Check if this message is from cheeki-breachability
    const channel = getDiscordChannelObjectByID(client, message.message.channelId)
    if (channel.name === "cheeki-breachability") {
        let epochTime = null
        let reactionCount = null
        //
        //  :step 2:
        //  Get the amount of reactions and the epoch time from the message
        const messageFromChannel = await channel.messages.fetch(message.message.id);
        const messageContent = messageFromChannel.content
        const regexOutput = messageContent.match(/<t:(\d+):F>/);
        if (regexOutput) {
            epochTime = regexOutput[1]

            //
            //  :step 3:
            //  We've confirmed that the reaction is valid, now lets count how many other reactions are on this message 
            await messageFromChannel.reactions.cache.map(() => {reactionCount+=1})
        }
    }
    if (channel.name === "cheeki-schedule") {
        
    }
})

client.login(process.env.TOKEN);
