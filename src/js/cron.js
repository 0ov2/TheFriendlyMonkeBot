//
//  :packages:
const spacetime = require("spacetime");
const schedule = require("node-schedule");

//
//  :code:
const { getDiscordChannelObject, getSpecificRoleByName, deleteAllMessages } = require("./util");

const setUpAvailabilityCronJobs = async (client) => {
  const channleObject = getDiscordChannelObject(client, "cheeki-breachability");
  const role = getSpecificRoleByName(client, "team-breachers");

  //  OP availability
  schedule.scheduleJob("0 18 * * 0", async () => {
    // 0 18 * * 0
    //
    //  :step 0:
    //  delete the previous avabilability messages
    await deleteAllMessages(client, "cheeki-breachability")
    
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
    await channleObject.send(
      "<@&" + role + ">"
    );
    channleObject.send(`============================================\n<t:${epochArray[0].epoch}:F>`);
    channleObject.send(`============================================\n<t:${epochArray[1].epoch}:F>`);
    channleObject.send(`============================================\n<t:${epochArray[2].epoch}:F>`);
    channleObject.send(`============================================\n<t:${epochArray[3].epoch}:F>`);
    channleObject.send(`============================================\n<t:${epochArray[4].epoch}:F>`);
    channleObject.send(`============================================\n<t:${epochArray[5].epoch}:F>`);
    channleObject.send(`============================================\n<t:${epochArray[6].epoch}:F>`);
  });
};

module.exports = { setUpAvailabilityCronJobs };
