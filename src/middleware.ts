import * as jose from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "./env/server.mjs";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function middleware(req: NextRequest) {
    const theJwt = req.headers
        .get("mattermost-app-authorization")
        ?.replace("Bearer ", "");

    if (!theJwt) {
        return NextResponse.json(
            {
                type: "error",
                text: "No JWT provided",
            },
            { status: 401 }
        );
    }
    try {
        await jose.jwtVerify(theJwt, secret);
    } catch (e) {
        console.error("JWT verification failed", e);
        return NextResponse.json(
            {
                type: "error",
                text: "JWT verification failed",
            },
            { status: 401 }
        );
    }
}

export const config = { matcher: "/api/mattermost/:path*" };
