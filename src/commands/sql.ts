import { CreateMessageOptions, Message } from "oceanic.js";
import { bot } from "..";
import { Command } from "../utils/types";
import { psqlClient } from "../utils/database";

async function handler(ctx: Message | any, args: string[]): Promise<string | CreateMessageOptions> {
    const query = await psqlClient.query(args.join(" "));
    return JSON.stringify({rows: query.rows});
}

export const sql: Command = {
    name: "sql",
    description: "Run beautiful SQL code",
    permission: "team",
    usage: "sql [query]",
    platform: "any",
    aliases: ["db"],
    handler
};
