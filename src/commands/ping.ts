import { CreateMessageOptions, Message } from "oceanic.js";
import { bot } from "..";
import { Command } from "../utils/types";

function handler(ctx: Message | any, args: string[]): string | CreateMessageOptions {
    return "Pong!";
}

export const ping: Command = {
    name: "ping",
    description: "pong",
    permission: "anyone",
    usage: "ping",
    platform: "any",
    aliases: ["p"],
    handler
};
