import { commands } from "..";
import { sendMessage } from "../utils/nin0chat";
import { Command, Role } from "../utils/types";

export async function handleNin0ChatCommand(content: string, author: any) {
    if (content.startsWith("/")) {
        const commandString = content.substring(`/`.length).split(" ");
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
        if (targetCommand.platform === "discord") return;
        switch (targetCommand.permission) {
            case "anyone": {
                break;
            }
            case "mod": {
                if (!(author.roles & Role.Mod || author.roles & Role.Admin))
                    return sendMessage("You can't use this command!");
                break;
            }
            case "team": {
                if (!(author.roles & Role.Mod || author.roles & Role.Admin))
                    return sendMessage("You can't use this command!");
                break;
            }
        }
        commandString.shift();
        const thingToReplyTo = await targetCommand.handler(author, commandString);
        sendMessage(thingToReplyTo as string);
    }
}
