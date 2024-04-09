//
//  :packages:
const spacetime = require("spacetime");
const schedule = require("node-schedule");

//
//  :code:
const {
  getDiscordChannelObject,
  getSpecificRoleByName,
  deleteAllMessages,
} = require("./util");

const setUpAvailabilityCronJobs = async (client) => {
  const channleObject = getDiscordChannelObject(client, "cheeki-breachability");
  const role = getSpecificRoleByName(client, "team-breachers");

  //  OP availability
  schedule.scheduleJob("0 11 * * 0", async () => {
    // 0 18 * * 0
    //
    //  :step 0:
    //  delete the previous avabilability messages
    await deleteAllMessages(client, "cheeki-breachability");
    await deleteAllMessages(client, "cheeki-schedule");

    //
    //  :step 1:
    //  get all epoch times for the week
    let epochArray = [];
    let spaceTimeDate = spacetime().time("7:00pm").goto("Europe/London");

    for (let i = 1; i < 8; i++) {
      let date = spaceTimeDate.add(i, "day");
      epochArray.push({ epoch: date.epoch / 1000, day: date.format("day") });
    }

    //
    //  :step 2:
    //  build and send the availability message with local time syntax <t: :t>
    await channleObject.send("<@&" + role + ">");
    channleObject.send(
      `====================================\n<t:${epochArray[0].epoch}:F>`
    );
    channleObject.send(
      `====================================\n<t:${epochArray[1].epoch}:F>`
    );
    channleObject.send(
      `====================================\n<t:${epochArray[2].epoch}:F>`
    );
    channleObject.send(
      `====================================\n<t:${epochArray[3].epoch}:F>`
    );
    channleObject.send(
      `====================================\n<t:${epochArray[4].epoch}:F>`
    );
    channleObject.send(
      `====================================\n<t:${epochArray[5].epoch}:F>`
    );
    channleObject.send(
      `====================================\n<t:${epochArray[6].epoch}:F>`
    );
  });
};

const manualPostAv = async (client) => {
  const channleObject = getDiscordChannelObject(client, "cheeki-breachability");
  const role = getSpecificRoleByName(client, "team-breachers");

  //  :step 0:
  //  delete the previous avabilability messages
  await deleteAllMessages(client, "cheeki-breachability");
  await deleteAllMessages(client, "cheeki-schedule");

  //
  //  :step 1:
  //  get all epoch times for the week
  let epochArray = [];
  let spaceTimeDate = spacetime().time("7:00pm").goto("Europe/London");

  for (let i = 1; i < 8; i++) {
    let date = spaceTimeDate.add(i, "day");
    epochArray.push({ epoch: (date.epoch / 1000) - 3600, day: date.format("day") });
  }


  //
  //  :step 2:
  //  build and send the availability message with local time syntax <t: :t>
  await channleObject.send("<@&" + role + ">");
  channleObject.send(
    `====================================\n<t:${epochArray[0].epoch}:F>`
  );
  channleObject.send(
    `====================================\n<t:${epochArray[1].epoch}:F>`
  );
  channleObject.send(
    `====================================\n<t:${epochArray[2].epoch}:F>`
  );
  channleObject.send(
    `====================================\n<t:${epochArray[3].epoch}:F>`
  );
  channleObject.send(
    `====================================\n<t:${epochArray[4].epoch}:F>`
  );
  channleObject.send(
    `====================================\n<t:${epochArray[5].epoch}:F>`
  );
};

const deleteOldScheduleMessages = async (client) => { // * * * * *  // 10 19 * * *
  schedule.scheduleJob("10 19 * * *", async () => {
    try {
      const scheduleChannelObject = getDiscordChannelObject(
        client,
        "cheeki-schedule"
      );
      if (!scheduleChannelObject) {
        return;
      }
      const messages = await scheduleChannelObject.messages.fetch();
      const currentTime = Date.now();
  
      messages.forEach((message) => {
        if (!message.author.bot) {return}
        const epochTimeMatches = message.content.match(/\d{10,}/g);
        if (epochTimeMatches) {
          epochTimeMatches.forEach((match) => {
            const messageDate = new Date(parseInt(match) * 1000);
  
            if (messageDate.getTime() < currentTime) {
              message
                .delete()
                .catch(console.error);
            }
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  })
}

module.exports = { setUpAvailabilityCronJobs, manualPostAv, deleteOldScheduleMessages };
