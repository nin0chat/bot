import { CreateMessageOptions, Message } from "oceanic.js";
import { bot } from "..";
import { Command } from "../utils/types";
import { psqlClient } from "../utils/database";

async function handler(ctx: Message | any, args: string[]): Promise<string | CreateMessageOptions> {
    process.exit(1);
}

export const restart: Command = {
    name: "restart",
    description: "restart",
    permission: "team",
    usage: "restart",
    platform: "any",
    aliases: ["r"],
    handler
};
