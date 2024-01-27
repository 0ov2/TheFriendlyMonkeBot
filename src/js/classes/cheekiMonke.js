//
//  :code:
const {
  getDiscordChannelObject,
  getSpecificRoleByName,
  deleteAllMessages,
  getDiscordChannelObjectByID,
  getUserObjectByID,
} = require("../util");

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
    this.minReactions = 5;

    //
    //  :statics:
    this.pubicScheduleChannelName = "cheeki-schedule";
    this.confirmScrimChannelName = "cheeki-confirm";
    this.matchesChannelName = "cheeki-matches";
    this.teamBreachersRoleName = "team-breachers";
    this.userToConfirmScrimID = "206848734867226634";
    this.superPowers = ["259466508814516224", "206848734867226634", "156861171062931456"];
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
    this.teamBreachersRole = await getSpecificRoleByName(
      this.client,
      this.teamBreachersRoleName
    );
  }

  async handleCheekiBreachabilityReactionAdd(epochTime, messageFromChannel) {
    if (!epochTime || !messageFromChannel) {
      return;
    }
    //
    // Get what we will need for the handler
    let channelMessages =
      await this.cheekiScheduleChannelObject.messages.fetch();
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

  async handleCheekiScheduleReactionAdd(user, epochTime) {
    const userWhoReactedID = user.id;

    const c = await getDiscordChannelObject(
      this.client,
      this.confirmScrimChannelName
    );
    await c
      .send(
        `<@${userWhoReactedID}> Wants to scrim on <t:${epochTime}:F> -- confirm <@${this.userToConfirmScrimID}>`
      )
      .then(async (m) => {
        await m.react("✅");
        await m.react("❌");
      });

    await user.send(
      `Your scrim request for <t:${epochTime}:F> vs CHBR is PENDING`
    );
  }

  async handleCheekiConfirmReactionAdd(message, epochTime) {
    //
    //  :step 0:
    //  Get the user object of the person who wants to scrim
    const match = message.message.content.match(/<@(\d+)>/)[1];
    const userWhoWantsToScrim = await getUserObjectByID(this.client, match);

    if (message.emoji.name === "✅") {
      await message.message.delete();
      const teamBreachersRole = await getSpecificRoleByName(
        this.client,
        this.teamBreachersRoleName
      );
      await this.cheekiMatchesChannelObject.send(
        `${teamBreachersRole}\nSCRIM vs TBD @ <t:${epochTime}:F>`
      );
      await userWhoWantsToScrim.send(
        `Your scrim request for <t:${epochTime}:F> vs CHBR has been ACCEPTED`
      );

      //
      //  If this scrim is confirmed, we need to delete the cheeki-schedule message as well
      //
      //  Find the reference of the confirmed match in cheeki-breachality
      const cheekiBreachabilityChannelObject = await getDiscordChannelObject(this.client, 'cheeki-schedule')
      let channelMessages = await cheekiBreachabilityChannelObject.messages.fetch();
      let channelMessage = channelMessages.find(
        (msg) => msg.content.includes(epochTime) && msg.author.bot == true
      );
      if (channelMessage) {
        //
        //  If there is a message with this epoch time, we need to delete it
        try {
          await channelMessage.delete();
        } catch (error) {
          console.log(error);
        }
      }
    }
    if (message.emoji.name === "❌") {
      try {
        await message.message.delete();
        await userWhoWantsToScrim.send(
          `Your scrim request for <t:${epochTime}:F> vs CHBR has been DECLINED`
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  async handleCheekiScheduleReactionRemove(epochTime, messageFromChannel) {
    let reactionCount = null;

    await messageFromChannel.reactions.cache.map(() => {
      reactionCount += 1;
    });

    if (reactionCount <= 0) {
      const cheekiScheduleChannelObject = await getDiscordChannelObject(
        this.client,
        "cheeki-schedule"
      );
      //
      //  :step 4a:
      //  first try to find the message with the epoch time
      let channelMessages = await cheekiScheduleChannelObject.messages.fetch();
      let channelMessage = channelMessages.find(
        (msg) => msg.content.includes(epochTime) && msg.author.bot == true
      );
      if (channelMessage) {
        //
        //  :step 4b:
        //  If there is a message with this epoch time, we need to delete it
        try {
          await channelMessage.delete();
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  async bulkDeleteMessagesInThisChannel(message) {
    let channelName = getDiscordChannelObjectByID(
      this.client,
      message.channelId
    ).name;
    if (this.superPowers.includes(message.author.id)) {
      try {
        await deleteAllMessages(this.client, channelName);
      } catch (error) {
        console.log(error);
      }
    }
  }
}

module.exports = { CheekiMonke };
