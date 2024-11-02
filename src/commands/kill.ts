import { CreateMessageOptions, Message } from "oceanic.js";
import { bot } from "..";
import { Command } from "../utils/types";
import { ipc } from "../utils/ipc";

async function handler(ctx: Message | any, args: string[]): Promise<string | CreateMessageOptions> {
    ipc.notify("kill", {
        target: args[0]
    });
    return `Killing user ${args[0]}...`;
}

export const kill: Command = {
    name: "kill",
    description: "Forcibly disconnect a user from the Gateway",
    permission: "mod",
    usage: "kill <idOrUsername>",
    platform: "any",
    aliases: ["k"],
    handler
};
