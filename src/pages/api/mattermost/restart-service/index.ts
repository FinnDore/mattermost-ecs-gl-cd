import { env } from "@/env/server.mjs";
import { to } from "@/utils/to";
import { ECSClient, UpdateServiceCommand } from "@aws-sdk/client-ecs";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const restartSchema = z.object({
    values: z.object({
        service: z.object({
            value: z.string(),
        }),
    }),
});

export const restartService = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const parseResult = restartSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({
            type: "error",
            text: "Invalid request body",
        });
    }

    const serviceName = parseResult.data.values.service.value;
    const [result, error] = await forceNewDeployment({ serviceName });
    if (error) {
        return res.status(500).json({
            type: "error",
            text: error.message,
        });
    }
    res.json({
        type: "ok",
        text: "Service restarted",
    });
    console.log(result, error);
};

export default restartService;

async function forceNewDeployment({ serviceName }: { serviceName: string }) {
    const client = new ECSClient({ region: env.AWS_REGION });
    return await to(
        (async () => {
            const command = new UpdateServiceCommand({
                cluster: env.AWS_CLUSTER_ID,
                service: serviceName,
                forceNewDeployment: true,
            });

            return await client.send(command);
        })()
    );
}
