//
//  :code:
const { getDiscordChannelObject } = require("../util");

class CheekiMonke {
  constructor(client) {
    // :client:
    this.client = client;

    //
    //  :runtime:
    this.cheekiBreachabilityReactionCount = null;
    this.cheekiScheduleChannelObject = null;
    this.cheekiConfirmChannelObject = null;
    this.cheekiMatchesChannelObject = null;
    //
    // :other:
    this.minReactions = 1;

    //
    //  :statics:
    this.pubicScheduleChannelName = "cheeki-schedule";
    this.confirmScrimChannelName = "cheeki-confirm";
    this.matchesChannelName = "cheeki-matches";
  }

  async runtime() {
    this.cheekiScheduleChannelObject = await getDiscordChannelObject(
      this.client,
      this.pubicScheduleChannelName
    );
    this.cheekiConfirmChannelObject = await getDiscordChannelObject(
        this.client,
        this.confirmScrimChannelName
      );
    this.cheekiMatchesChannelObject = await getDiscordChannelObject(
        this.client,
        this.matchesChannelName
      );
  }

  async handleCheekiBreachabilityReactionAdd(epochTime, messageFromChannel) {
    if (!epochTime || !messageFromChannel) {
      return;
    }
    //
    // Get what we will need for the handler
    let channelMessages = await this.cheekiScheduleChannelObject.messages.fetch();
    let channelMessage = channelMessages.find(
      (msg) => msg.content.includes(epochTime) && msg.author.bot == true
    );

    //
    // :step 1:
    //  Count how many reactions are on this message
    await messageFromChannel.reactions.cache.map(() => {
      this.cheekiBreachabilityReactionCount += 1;
    });

    if (this.cheekiBreachabilityReactionCount >= this.minReactions) {
      if (!channelMessage) {
        //
        //  :step 4b:
        //  If there is no channel message, we need to create one
        await this.cheekiScheduleChannelObject.send(
          `========================================\n<t:${epochTime}:F>`
        );
      }
    }
  }
}

module.exports = { CheekiMonke };
