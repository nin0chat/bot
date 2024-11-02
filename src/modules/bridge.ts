import { bot, ws } from "..";
import { Role } from "../utils/types";
import { IncomingPayload } from "../utils/types";

export const bridgedChannels: { channelID: string; guildID: string }[] = [];

let lastBridgedChannel = "";

export function setLastBridgedChannel(id: string) {
    lastBridgedChannel = id;
}

export async function handleIncomingMessage(message: IncomingPayload) {
    if (message.d.userInfo.roles & Role.Bot && !(message.d.userInfo.roles & Role.Admin)) return;
    if (message.d.userInfo.roles & Role.System && !(message.d.userInfo.roles & Role.Admin)) return;

    for (const c of bridgedChannels) {
        try {
            if (!(message.d.userInfo.bridgeMetadata.from as string).includes(c.channelID))
                bot.rest.channels.createMessage(c.channelID, {
                    content: `\` ${message.d.type !== 4 ? getRoleEmoji(message.d.userInfo.roles) : `🌉`} \` **<${message.d.userInfo.username}>** ${message.d.content}\n${message.d.type === 4 ? `-# Bridged by ${message.d.userInfo.bridgeMetadata.from}` : ""}`
                });
        } catch {
            bot.rest.channels.createMessage(c.channelID, {
                content: `\` ${message.d.type !== 4 ? getRoleEmoji(message.d.userInfo.roles) : `🌉`} \` **<${message.d.userInfo.username}>** ${message.d.content}\n${message.d.type === 4 ? `-# Bridged by ${message.d.userInfo.bridgeMetadata.from}` : ""}`
            });
        }
    }
}

function getRoleEmoji(roles: number): string {
    if (roles & Role.Bot) return "🤖";
    if (roles & Role.System) return "🔧";
    if (roles & Role.Admin) return "👑";
    if (roles & Role.Mod) return "🛡️";
    if (roles & Role.Guest) return "🔰";
    if (roles & Role.User) return "👤";
}
