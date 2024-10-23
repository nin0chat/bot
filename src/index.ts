import "dotenv/config.js";
import { Client } from "oceanic.js";
import { ping } from "./commands/ping";
import { Command, IncomingPayload } from "./utils/types";
import { bridgedChannels, handleIncomingMessage, setLastBridgedChannel } from "./modules/bridge";
import { sendMessage, sendPayload } from "./utils/nin0chat";

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
export let ws: WebSocket;
export function connectToWS() {
    console.log("Connecting to nin0chat");
    ws = new WebSocket("wss://chatws.nin0.dev");
    ws.onopen = () => {
        console.log("Connected to nin0chat, authenticating");
        sendPayload(1, {
            anon: false,
            token: process.env.WS_TOKEN,
            device: "bot"
        });
    };
    ws.onclose = connectToWS;
    ws.onmessage = (msg) => {
        const message: IncomingPayload = JSON.parse(msg.data);
        switch (message.op) {
            case -1: {
                console.error(message.d);
            }
            case 0: {
                handleIncomingMessage(message);
                break;
            }
            case 1: {
                console.log("Authenticated to nin0chat!");
                break;
            }
            case 2: {
                sendPayload(2, {});
                break;
            }
        }
    };
}

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
    let canContinue = false;
    for (const channel of bridgedChannels) {
        if (channel.channelID === e.channel.id) canContinue = true;
    }
    if (!canContinue) return;
    if (e.author.bot) return;
    const member = await bot.rest.guilds.getMember(e.guild.id, e.author.id);
    const topRole =
        member.roles.length > 0
            ? await bot.rest.guilds.getRole(e.guild!.id, member.roles.at(-1)!)
            : undefined;
    sendMessage(
        e.content,
        true,
        e.author.tag,
        topRole ? topRole.color!.toString(16) : "0",
        `${e.guild.name} (${e.channel.id})`
    );
});

bot.connect();
