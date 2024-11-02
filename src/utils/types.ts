import { CreateMessageOptions, Message } from "oceanic.js";

type CommandHandler = (ctx: Message, args: string[]) => Promise<string | CreateMessageOptions>;

export enum Role {
    Guest = 1 << 0,
    User = 1 << 1,
    Bot = 1 << 2,
    System = 1 << 3,
    Mod = 1 << 4,
    Admin = 1 << 5
}

export type Command = {
    name: string;
    description: string;
    aliases?: string[];
    permission: "anyone" | "mod" | "team";
    usage: string;
    platform: "nin0chat" | "discord" | "any";
    handler: CommandHandler;
};

export type IncomingPayload = {
    op: number;
    d: any;
};
