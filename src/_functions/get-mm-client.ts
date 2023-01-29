import { env } from "@/env/server.mjs";
import { prisma } from "@/server/db";
import { Client4 } from "@mattermost/client";
import { ConfigItem } from "@prisma/client";
let client: Client4 | null = null;

export async function getClient(): Promise<[Client4, null] | [null, Error]> {
    if (client === null) {
        try {
            const [mmToken, mmBotId] = await prisma.$transaction([
                prisma?.config.findFirst({
                    where: {
                        type: ConfigItem.MM_TOKEN,
                    },
                }),
                prisma.config.findFirst({
                    where: {
                        type: ConfigItem.MM_BOT_ID,
                    },
                }),
            ]);

            if (!mmToken || !mmBotId) {
                console.error("MM token or bot id not found");
                return [null, new Error("MM token or bot id not found")];
            }

            client = new Client4();
            client.setUrl(env.MATTERMOST_URL);
            client.setToken(mmToken.value);
            client.setUserId(mmBotId.value);
        } catch (e) {
            console.error("failed to fetch MM token or bot id", e);
            return [null, e as Error];
        }
    }

    return [client, null];
}
