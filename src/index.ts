import "dotenv/config.js";
import { ActivityTypes, ButtonStyles, Client, ComponentTypes } from "oceanic.js";
import { ping } from "./commands/ping";
import { Command, IncomingPayload } from "./utils/types";
import { bridgedChannels, handleIncomingMessage, setLastBridgedChannel } from "./modules/bridge";
import { sendMessage, sendPayload } from "./utils/nin0chat";
import { handleNin0ChatCommand } from "./modules/chatCommandHandler";
import { initIPC, ipc } from "./utils/ipc";
import { kill } from "./commands/kill";
import { help } from "./commands/help";
import { sql } from "./commands/sql";
import { restart } from "./commands/restart";
import { psqlClient } from "./utils/database";
import { bridge, unbridge } from "./commands/bridgeManagement";

export const commands = [bridge, help, kill, ping, restart, sql, unbridge];

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
    //ws = new WebSocket("ws://localhost:8928");
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
                handleNin0ChatCommand(message.d.content, message.d.userInfo);
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

bot.on("ready", async () => {
    console.log(`Connected as ${bot.user.tag}!`);
    connectToWS();
    const channels = await psqlClient.query("SELECT * FROM botguilds");
    channels.rows.forEach((c) => {
        bridgedChannels.push({
            guildID: c.guild_id,
            channelID: c.channel_id
        });
    });
    console.log("Loaded channels:", bridgedChannels);
});
bot.once("ready", async () => {
    await bot.editStatus("online", [
        {
            type: ActivityTypes.CUSTOM,
            name: "@ for info ~ https://chat.nin0.dev",
            state: "@ for info ~ https://chat.nin0.dev"
        }
    ]);
});

bot.on("messageCreate", async (e) => {
    if (e.content.replace(" ", "") === `<@${bot.user.id}>`)
        await e.channel.createMessage({
            embeds: [
                {
                    title: "nin0chat",
                    description:
                        "The chat app of all time, on Discord. `@nin0chatbot help` to see all commands.\n\n**Would like to add this channel to the bridge?**\nRun `@nin0chatbot bridge` to add the channel, or `@nin0chatbot unbridge` to remove it.\n*You need to own the server to do this.*",
                    color: 4431352
                }
            ],
            components: [
                {
                    type: ComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: ComponentTypes.BUTTON,
                            style: ButtonStyles.LINK,
                            label: "Open nin0chat",
                            url: "https://chat.nin0.dev"
                        },
                        {
                            type: ComponentTypes.BUTTON,
                            style: ButtonStyles.LINK,
                            label: "Support/community server",
                            url: "https://discord.gg/8kUQNnSuxy"
                        }
                    ]
                }
            ],
            messageReference: {
                messageID: e.id,
                channelID: e.channelID,
                guildID: e.guildID
            }
        });
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
        if (targetCommand.platform === "nin0chat") return;
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
        const thingToReplyTo = await targetCommand.handler(e, commandString);
        try {
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
        } catch {
            await e.channel.createMessage({
                content: "This command can only be used in servers"
            });
        }
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

process.on("uncaughtException", (e) => {
    connectToWS();
    console.error(e);
});

process.on("unhandledRejection", (e) => {
    console.error(e);
});

initIPC();

bot.connect();
