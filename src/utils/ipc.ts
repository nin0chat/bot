import { bot } from "..";
import { psqlClient } from "./database";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pgIPC = require("pg-ipc");

export let ipc;

export function initIPC() {
    ipc = new pgIPC(psqlClient);
    ipc.on("createDiscordMessage", (e) => {
        bot.rest.channels.createMessage(e.payload.channel, { content: e.payload.content });
    });
}
