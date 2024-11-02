import { CreateMessageOptions, Message } from "oceanic.js";
import { bot, commands } from "..";
import { Command } from "../utils/types";

async function handler(ctx: Message | any, args: string[]): Promise<string | CreateMessageOptions> {
    let helpMessage = "***Command list***\n";
    commands.forEach((c) => {
        helpMessage += `${c.permission === "team" ? "🔨 " : c.permission === "mod" ? "🛡️ " : ""}${c.platform === "discord" ? "(Discord only) " : c.platform === "nin0chat" ? "(nin0chat only) " : ""}**${c.name} (${c.aliases.join(", ")})** ~ ${c.description}\n`;
    });
    return helpMessage;
}

export const help: Command = {
    name: "help",
    description: "Does stuff idk",
    permission: "anyone",
    usage: "help",
    platform: "any",
    aliases: ["h", "?"],
    handler
};
