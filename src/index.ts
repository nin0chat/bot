import "dotenv/config.js";
import { Client } from "oceanic.js";
import { ping } from "./commands/ping";
import { Command } from "./utils/types";
import { bridgedChannels, connectToWS, sendMessage } from "./modules/bridge";

export const bot = new Client({
    auth: process.env.BOT_AUTH,
    allowedMentions: {
        users: false,
        repliedUser: false,
        everyone: false,
        roles: false
    },
    gateway: { intents: ["ALL"] }
});

const commands = [ping];

bot.on("ready", () => {
    console.log(`Connected as ${bot.user.tag}!`);
    connectToWS();
});

bot.on("messageCreate", async (e) => {
    if (e.content.startsWith(`<@${bot.user.id}> `)) {
        const commandString = e.content.substring(`<@${bot.user.id}> `.length).split(" ");
        let targetCommand: Command;
        for (const command of commands) {
            if (command.name === commandString[0]) {
                targetCommand = command;
                break;
            }
            if (command.aliases) {
                for (const alias of command.aliases) {
                    if (alias === commandString[0]) targetCommand = command;
                }
            }
        }
        if (!targetCommand) return;
        switch (targetCommand.permission) {
            case "anyone": {
                break;
            }
            case "mod": {
                const member = await bot.rest.guilds.getMember("1298332865939116104", e.author.id);
                if (
                    !member.roles.includes("1298341992689963088") &&
                    !member.roles.includes("1298333970177593416")
                )
                    return e.createReaction("💢");
                break;
            }
            case "team": {
                const member = await bot.rest.guilds.getMember("1298332865939116104", e.author.id);
                if (!member.roles.includes("1298333970177593416")) return e.createReaction("💢");
                break;
            }
        }
        commandString.shift();
        const thingToReplyTo = targetCommand.handler(e, commandString);
        await e.channel.createMessage(
            typeof thingToReplyTo === "string"
                ? {
                      content: thingToReplyTo,
                      messageReference: {
                          messageID: e.id,
                          channelID: e.channel.id,
                          guildID: e.guild.id
                      }
                  }
                : (() => {
                      const obj = thingToReplyTo;
                      obj.messageReference = {
                          messageID: e.id,
                          channelID: e.channel.id,
                          guildID: e.guild.id
                      };
                      return obj;
                  })()
        );
    }
    if (!bridgedChannels.includes(e.channel.id)) return;
    if (e.author.bot) return;
    sendMessage(e.content, true, e.author.tag);
});

bot.connect();
