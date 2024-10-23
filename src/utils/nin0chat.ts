import { ws } from "..";

export function sendPayload(op: number, d: any) {
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
    color: string = "",
    fromName: string = ""
) {
    sendPayload(0, {
        content,
        bridgeMetadata: bridge && {
            username,
            color,
            from: `nin0chatbot, from ${fromName}`
        }
    });
}
