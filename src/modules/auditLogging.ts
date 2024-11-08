import { Guild } from "oceanic.js";
import { bot } from "..";
import { psqlClient } from "../utils/database";
import { bridgedChannels } from "./bridge";

export async function configAuditLoggers() {
    bot.on("guildCreate", async (g) => {
        console.log("a");
        const owner = await bot.rest.users.get(g.ownerID);
        await bot.rest.channels.createMessage("1304251188170195046", {
            content: `I have been added to guild ${g.name} with ID of ${g.id}\n-# Owned by ${owner.username} (${owner.id})`
        });
    });
    bot.on("guildDelete", async (g) => {
        await bot.rest.channels.createMessage("1304251188170195046", {
            content: `I have been removed from guild ${(g as Guild).name} with ID of ${g.id}`
        });
        await psqlClient.query("DELETE FROM botguilds WHERE guild_id=$1", [g.id]);
        Object.assign(
            bridgedChannels,
            bridgedChannels.filter((channel) => channel.guildID !== g.id)
        );
    });
}
