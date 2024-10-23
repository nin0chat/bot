import { bot } from "..";
import { Role } from "../utils/types";
import { IncomingPayload } from "../utils/types";

let ws: WebSocket;

export const bridgedChannels = ["1298338838930001981", "1298664849814851594"];

export function connectToWS() {
    console.log("Connecting to nin0chat");
    ws = new WebSocket("wss://chatws.nin0.dev");
    ws.onopen = () => {
        console.log("Connected to nin0chat, authenticating");
        sendPayload(1, {
            anon: false,
            token: process.env.WS_TOKEN,
            device: "bot"
        });
    };
    ws.onclose = connectToWS;
    ws.onmessage = (msg) => {
        const message: IncomingPayload = JSON.parse(msg.data);
        switch (message.op) {
            case -1: {
                console.error(message.d);
            }
            case 0: {
                if (message.d.userInfo.roles & Role.Bot && !(message.d.userInfo.roles & Role.Admin))
                    return;
                if (
                    message.d.userInfo.roles & Role.System &&
                    !(message.d.userInfo.roles & Role.Admin)
                )
                    return;
                for (const c of bridgedChannels) {
                    if (message.d.userInfo.bridgeMetadata.from === "nin0bot") return;
                    bot.rest.channels.createMessage(c, {
                        content: `\` ${getRoleEmoji(message.d.userInfo.roles)} \` **<${message.d.userInfo.username}>** ${message.d.content}`
                    });
                }
                break;
            }
            case 1: {
                console.log("Authenticated to nin0chat!");
                break;
            }
            case 2: {
                sendPayload(2, {});
                break;
            }
        }
    };
}

function sendPayload(op: number, d: any) {
    ws.send(
        JSON.stringify({
            op,
            d
        })
    );
}

export function sendMessage(
    content: string,
    bridge: boolean = false,
    username: string = "",
    color: string = ""
) {
    sendPayload(0, {
        content,
        bridgeMetadata: bridge
            ? {
                  username,
                  from: "nin0bot"
              }
            : {}
    });
}

function getRoleEmoji(roles: number): string {
    if (roles & Role.Bot) return "🤖";
    if (roles & Role.System) return "🔧";
    if (roles & Role.Admin) return "👑";
    if (roles & Role.Mod) return "🛡️";
    if (roles & Role.Guest) return "👻";
    if (roles & Role.User) return "👤";
}
