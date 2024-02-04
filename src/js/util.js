const getDiscordChannelObject = (client, channelName) => {
    const channelObject = client.channels.cache.find(channel => channel.name === channelName)
    return channelObject ? channelObject : console.log("Cannot find channel: ", channelName)
}

const getDiscordChannelObjectByID = (client, id) => {
    const channelObject = client.channels.cache.find(channel => channel.id === id)

    return channelObject ? channelObject : console.log("Cannot find channel: ", id)
}

const getSpecificRoleByName = (client, roleName) => {
    const guildID = client.guilds.cache.firstKey()
    const role = client.guilds.cache.get(guildID).roles.cache.find(role => role.name === roleName)

    return role ? role : console.log(`role ${roleName} not found`)
}

const deleteAllMessages = async (client, channelName) => {
    try {
        const channel = getDiscordChannelObject(client, channelName)
        await channel.bulkDelete(100);
    } catch (error) {
        console.log(error);
    }
}

const getUserObjectByID = async (client, id) => {
    return await client.users.fetch(id) || null
}

const hasUserReactedMoreThenOnce = async (client, message, userID) => {
    message.message.reactions.cache.forEach(async(reaction) => {
        const reactionUsers = await reaction.users.fetch();

        
        // console.log(reactionUsers);
    });
    // return true
}

module.exports = {getDiscordChannelObject, getSpecificRoleByName, deleteAllMessages, getDiscordChannelObjectByID, getUserObjectByID, hasUserReactedMoreThenOnce}