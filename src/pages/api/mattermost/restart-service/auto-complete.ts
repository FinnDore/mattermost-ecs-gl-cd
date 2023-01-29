import { env } from "@/env/server.mjs";
import { to } from "@/utils/to";
import { commandScore } from "@/_functions/comand-score";
import {
    ECSClient,
    ListServicesCommand,
    UpdateServiceCommand,
} from "@aws-sdk/client-ecs";
import type {
    AppCallResponse,
    AppLookupResponse,
} from "@mattermost/types/lib/apps";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

let currentServices: { displayName: string; arn: string }[] | null = null;
const updateTime = new Date();

const requestSchema = z.object({
    query: z.string().optional().default(""),
});

const autoComplete = async (
    req: NextApiRequest,
    res: NextApiResponse<AppCallResponse<AppLookupResponse>>
) => {
    const parseResult = requestSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({
            type: "error",
            text: "Invalid request body",
        });
    }

    const { query } = parseResult.data;
    // Swr this only once we have a list of services
    if (updateTime < new Date()) {
        if (currentServices === null) {
            await updateServices();
        } else {
            void updateServices();
        }
    }

    const services = currentServices ?? [];
    const scores: Record<string, number> = {};
    services.forEach(
        (service) =>
            (scores[service.arn] = commandScore(query, service.displayName))
    );

    const sorted = services.sort(
        (a, b) => (scores[a.arn] ?? 0) - (scores[b.arn] ?? 0)
    );
    res.json({
        type: "ok",
        data: {
            items: sorted.map((x) => ({ label: x.arn, value: x.displayName })),
        },
    });
};

export default autoComplete;

async function updateServices() {
    const [services, error] = await getServices();
    if (error)
        return console.error("Failed to fetch the list of ecs services", error);
    currentServices = services.map((service) => ({
        displayName: service.split("/").pop() ?? "Unknown Service",
        arn: service,
    }));
    updateTime.setMinutes(updateTime.getMinutes() + 1);
}

async function getServices() {
    const client = new ECSClient({ region: env.AWS_REGION });
    return await to(
        (async () => {
            const services = [];
            while (true) {
                const command = new ListServicesCommand({
                    cluster: env.AWS_CLUSTER_ID,
                    maxResults: 100,
                });

                const res = await client.send(command);
                if (res.serviceArns) services.push(...res.serviceArns);
                if (!res.nextToken) break;
            }
            return services;
        })()
    );
}

async function forceNewDeployment({
    cluster,
    serviceName,
    region,
}: {
    cluster: string;
    serviceName: string;
    region: string;
}) {
    const client = new ECSClient({ region });
    return await to(
        (async () => {
            const command = new UpdateServiceCommand({
                cluster,
                service: serviceName,
                forceNewDeployment: true,
            });

            return await client.send(command);
        })()
    );
}
