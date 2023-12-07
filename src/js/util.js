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
    const channel = getDiscordChannelObject(client, channelName)
    await channel.bulkDelete(100);
}

module.exports = {getDiscordChannelObject, getSpecificRoleByName, deleteAllMessages, getDiscordChannelObjectByID}