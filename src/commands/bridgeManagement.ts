import { CreateMessageOptions, Message } from "oceanic.js";
import { bot } from "..";
import { Command } from "../utils/types";
import { psqlClient } from "../utils/database";
import { bridgedChannels } from "../modules/bridge";

async function bridgeHandler(
    ctx: Message | any,
    args: string[]
): Promise<string | CreateMessageOptions> {
    const msg = ctx as Message;
    if (msg.author.id !== "886685857560539176" && msg.guild.ownerID !== msg.author.id)
        return "This command can only be ran by the bot owner or the server owner";
    await psqlClient.query("INSERT INTO botguilds VALUES ($1, $2)", [msg.channelID, msg.guildID]);
    bridgedChannels.push({
        guildID: msg.guildID,
        channelID: msg.channelID
    });
    return "Added channel!";
}

async function unbridgeHandler(
    ctx: Message | any,
    args: string[]
): Promise<string | CreateMessageOptions> {
    const msg = ctx as Message;
    if (msg.author.id !== "886685857560539176" && msg.guild.ownerID !== msg.author.id)
        return "This command can only be ran by the bot owner or the server owner";
    await psqlClient.query("DELETE FROM botguilds WHERE channel_id=$1", [msg.channelID]);
    bridgedChannels.splice(
        bridgedChannels.indexOf({
            guildID: msg.guildID,
            channelID: msg.channelID
        }),
        1
    );
    return "Removed channel!";
}

export const bridge: Command = {
    name: "bridge",
    description: "Run this in the channel that you want to bridge to nin0chat",
    permission: "anyone",
    usage: "bridge",
    platform: "discord",
    aliases: ["br"],
    handler: bridgeHandler
};

export const unbridge: Command = {
    name: "unbridge",
    description: "Run this in the channel that you want to remove the bridge to",
    permission: "anyone",
    usage: "unbridge",
    platform: "discord",
    aliases: ["ubr"],
    handler: unbridgeHandler
};
