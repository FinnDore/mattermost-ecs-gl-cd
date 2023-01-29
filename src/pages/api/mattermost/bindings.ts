import type { AppBinding, AppCallResponse } from "@mattermost/types/lib/apps";
import type { NextApiRequest, NextApiResponse } from "next";

const bindings = (
    req: NextApiRequest,
    res: NextApiResponse<AppCallResponse<AppBinding[]>>
) => {
    res.json({
        type: "ok",
        data: [
            {
                app_id: "t3-mattermost",
                label: "T3 Mattermost",
                location: "/command",
                bindings: [
                    {
                        app_id: "t3-mattermost",
                        label: "restart",
                        description: "Restarts an ecs service",
                        form: {
                            title: "Select a service to restart",
                            icon: "icon-info.png",
                            submit: {
                                path: "/api/mattermost/restart-service",
                            },
                            fields: [
                                {
                                    name: "service",
                                    type: "dynamic_select",
                                    label: "Service",
                                    lookup: {
                                        path: "/api/mattermost/restart-service/auto-complete",
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    });
};

export default bindings;
