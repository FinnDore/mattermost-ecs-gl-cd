import { prisma } from "@/server/db";
import type { AppCallResponse } from "@mattermost/types/lib/apps";
import { ConfigItem } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const schema = z.object({
    context: z.object({
        bot_access_token: z.string().length(26),
        bot_user_id: z.string().length(26),
    }),
});

const onInstall = async (
    req: NextApiRequest,
    res: NextApiResponse<AppCallResponse>
) => {
    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
        console.error("onInstall body invalid", parseResult.error);
        return res.status(400).json({
            type: "error",
            text: "invalid body",
        });
    }

    const { context } = parseResult.data;
    await prisma.$transaction([
        prisma.config.upsert({
            where: {
                type: ConfigItem.MM_TOKEN,
            },
            update: {
                value: context.bot_access_token,
            },
            create: {
                type: ConfigItem.MM_TOKEN,
                value: context.bot_user_id,
            },
        }),
        prisma.config.upsert({
            where: {
                type: ConfigItem.MM_BOT_ID,
            },
            update: {
                value: context.bot_user_id,
            },
            create: {
                type: ConfigItem.MM_BOT_ID,
                value: context.bot_user_id,
            },
        }),
    ]);

    res.json({
        type: "ok",
    });
};

export default onInstall;
