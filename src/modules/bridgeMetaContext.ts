import { ApplicationCommandTypes, InteractionTypes, MessageFlags } from "oceanic.js";
import { bot } from "..";

export let messageMetaMap: Map<
    string,
    {
        messageID: string;
        userID: string;
        bridgeMeta: string;
    }
> = new Map();

export async function setupInteractionListeners() {
    bot.on("interactionCreate", async (i) => {
        if (
            i.type === InteractionTypes.APPLICATION_COMMAND &&
            i.data.type === ApplicationCommandTypes.MESSAGE &&
            i.data.name === "View Message Info"
        ) {
            if (messageMetaMap.has(i.data.target.id))
                await i.createMessage({
                    embeds: [
                        {
                            title: "Message info",
                            color: 0x3692ee,
                            description: `> **ID**: ${messageMetaMap.get(i.data.target.id).messageID}
> **${messageMetaMap.get(i.data.target.id).bridgeMeta !== null ? "Bridge user" : "Author"} ID**: ${messageMetaMap.get(i.data.target.id).userID} 
${messageMetaMap.get(i.data.target.id).bridgeMeta !== null ? `> **Bridged via**: ${messageMetaMap.get(i.data.target.id).bridgeMeta}` : ""}`
                        }
                    ]
                });
            else
                await i.createMessage({
                    content: "Message info isn't available for this message.",
                    flags: MessageFlags.EPHEMERAL
                });
        }
    });
}
