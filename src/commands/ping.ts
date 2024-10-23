import { CreateMessageOptions, Message } from "oceanic.js";
import { bot } from "..";
import { Command } from "../utils/types";

function handler(ctx: Message, args: string[]): string | CreateMessageOptions {
    return {
        embeds: [
            {
                description: "pong"
            }
        ]
    };
}

export const ping: Command = {
    name: "ping",
    description: "pong",
    permission: "anyone",
    usage: "ping",
    aliases: ["p"],
    handler
};
