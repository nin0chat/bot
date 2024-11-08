import { bot, ws } from "..";
import { Role } from "../utils/types";
import { IncomingPayload } from "../utils/types";
import { messageMetaMap } from "./bridgeMetaContext";

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
            if (!(message.d.userInfo.bridgeMetadata.from as string).includes(c.channelID)) {
                const m = await bot.rest.channels.createMessage(c.channelID, {
                    content: `-# \`${message.d.type !== 4 ? getRoleEmoji(message.d.userInfo.roles) : `🌉`}\` **<${message.d.userInfo.username}>**\n${message.d.content.replace("-#", "\\-#")}`
                });
                messageMetaMap.set(m.id, {
                    messageID: message.d.id,
                    userID: message.d.userInfo.id,
                    bridgeMeta: message.d.type === 4 ? message.d.userInfo.bridgeMetadata.from : null
                });
            }
        } catch {
            const m = await bot.rest.channels.createMessage(c.channelID, {
                content: `-# \`${message.d.type !== 4 ? getRoleEmoji(message.d.userInfo.roles) : `🌉`}\` **<${message.d.userInfo.username}>**\n${message.d.content.replace("-#", "\\-#")}`
            });
            messageMetaMap.set(m.id, {
                messageID: message.d.id,
                userID: message.d.userInfo.id,
                bridgeMeta: message.d.type === 4 ? message.d.userInfo.bridgeMetadata.from : null
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
