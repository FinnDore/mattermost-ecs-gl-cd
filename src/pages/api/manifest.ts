import type { AppManifest } from "@mattermost/types/apps";
import { Locations, Permission } from "@mattermost/types/apps";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "src/env/server.mjs";

const manifest = (
    _req: NextApiRequest,
    res: NextApiResponse<
        AppManifest & {
            app_type: "http";
            http: {
                root_url: string;
                use_jwt: boolean;
            };
            on_install: string;
        }
    >
) =>
    res.json({
        app_id: "t3-mattermost",
        display_name: "T3 Mattermost",
        version: "0.0.0",
        description: "Starter app written using the t3 stack",
        icon: "t3.png",
        requested_locations: [
            Locations.PostMenu,
            Locations.ChannelHeader,
            Locations.Command,
            Locations.InPost,
        ],
        requested_permissions: [Permission.ActAsUser, Permission.ActAsBot],
        homepage_url: env.BASE_URL,
        on_install: "/api/mattermost/on-install",
        app_type: "http",
        http: {
            root_url: env.BASE_URL,
            use_jwt: true,
        },
    });

export default manifest;
