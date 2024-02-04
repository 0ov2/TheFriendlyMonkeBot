//
//  :code:
const {
  getDiscordChannelObject,
  getSpecificRoleByName,
  deleteAllMessages,
  getDiscordChannelObjectByID,
  getUserObjectByID,
  hasUserReactedMoreThenOnce,
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
    this.superPowers = [
      "259466508814516224",
      "206848734867226634",
      "156861171062931456",
    ];
    this.captainIDMapping = {
      "640090857147596810": "BLAZE",
      "559803574784098306": "TBD",
      "941846059834044487": "French Resistance",
      "476820745113042955": "Nexus",
      "510476673146421258": "RCL",
      "780046286388461568": ".COM"
    };
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
    if (messageFromChannel.content.includes("<C>")) {
      return;
    }
    //
    // Get what we will need for the handler
    const cheekiScheduleChannelObject = await getDiscordChannelObject(
      this.client,
      "cheeki-schedule"
    );
    let channelMessages =
      await cheekiScheduleChannelObject.messages.fetch();
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
        await cheekiScheduleChannelObject.send(
          `====================================\n<t:${epochTime}:F>`
        );
      }
    }
  }

  async handleCheekiScheduleReactionAdd(message, user, epochTime) {
    const userWhoReactedID = user.id;
    // await hasUserReactedMoreThenOnce(this.client, message, userWhoReactedID)
    // return
    /*
    const hasUserReactedMoreThenOnce = await hasUSerReactedMoreThenOnce(this.client, message, userWhoReactedID)
    if (hasUserReactedMoreThenOnce) {
      return
    }
    */
    if (userWhoReactedID && !this.captainIDMapping[userWhoReactedID]){
      return
    }
    if (
      message.message.author.id !== "1200907442087788686" ||
      message.message.author.id !== "1182020808219033740"
    ) {
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
  }

  async handleCheekiConfirmReactionAdd(message, epochTime) {
    const regex = /<@(\d+)>/;
    let matched = message.message.content.match(regex);
    let vs = null;
    if (matched && matched[1]) {
      vs = this.captainIDMapping[matched[1]] || "TBD";
    }

    if (message.emoji.name === "❓") {
      return;
    }
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
        `${teamBreachersRole}\nSCRIM vs ${vs} @ <t:${epochTime}:F>`
      );
      await userWhoWantsToScrim.send(
        `Your scrim request for <t:${epochTime}:F> vs CHBR has been ACCEPTED`
      );
      await this.confirmMatch(message, epochTime);

      //
      //  If this scrim is confirmed, we need to delete the cheeki-schedule message as well
      //
      //  Find the reference of the confirmed match in cheeki-breachality
      const cheekiBreachabilityChannelObject = await getDiscordChannelObject(
        this.client,
        "cheeki-schedule"
      );
      let channelMessages =
        await cheekiBreachabilityChannelObject.messages.fetch();
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

    if (reactionCount < 5) {
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

  async testWeHaveWhatWeNeed(message) {
    let channelObject = getDiscordChannelObjectByID(
      this.client,
      message.channelId
    );

    if (channelObject && this.superPowers.includes(message.author.id)) {
      await channelObject.send("YES I AM HEHE").then(async (m) => {
        await m.react("❓");
      });
    }
  }

  async deleteTestMessage(message, user) {
    try {
      if (this.superPowers.includes(user.id)) {
        await message.message.delete();
        let channelObject = getDiscordChannelObjectByID(
          this.client,
          message.message.channelId
        );
        let channelMessages = await channelObject.messages.fetch();
        let channelMessage = channelMessages.find(
          (msg) =>
            msg.content.includes("!areyoualive") && msg.author.bot == false
        );

        if (channelMessage) {
          await channelMessage.delete();
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async confirmMatch(message, epochTime) {
    try {
      if ((!this.superPowers.includes(message?.author?.id) || !this.superPowers.includes(message?.message?.author?.id)) ) {
        if (message.message?.author?.bot === false) {
          return;
        }
      }
      let numberString = null;
      //
      //  If we already have an epoch, we can update the known message
      if (epochTime) {
        const ChannelObject = await getDiscordChannelObject(
          this.client,
          "cheeki-breachability"
        );
        let channelMessages =
          await ChannelObject.messages.fetch();
        let channelMessage = channelMessages.find(
          (msg) => msg.content.includes(epochTime) && msg.author.bot == true
        );

        if (channelMessage) {
          channelMessage.edit(`${channelMessage.content} <C>`);
        }

        return;
      }

      if (this.superPowers.includes(message.author.id)) {
        //
        //  :step 1:
        //  extract the message ID from the message
        const regex = /!cmatch (\d+)/;
        const match = message.content.match(regex);

        if (match) {
          numberString = match[1];
        } else {
          return;
        }

        //
        //  :step 2:
        //  find the message with the message ID
        message.channel.messages.fetch(numberString).then((message) => {
          //
          //  :step 3:
          //  Edit the message to include <c>
          if (message.content.includes("<c>")) {
            return;
          }
          message.edit(`${message.content} <C>`);
        });

        //
        //  :step 4:
        //  Delete the command message
        await message.delete();

        return;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = { CheekiMonke };
