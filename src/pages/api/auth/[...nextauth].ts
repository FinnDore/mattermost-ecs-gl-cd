import NextAuth, { type NextAuthOptions } from "next-auth";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { MattermostProvider } from "../../../auth/mattermost-provider";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db";

const providers = [];
if (env.MATTERMOST_CLIENT_ID && env.MATTERMOST_CLIENT_SECRET) {
    providers.push(
        MattermostProvider({
            issuer: env.MATTERMOST_URL,
            clientId: env.MATTERMOST_CLIENT_ID,
            clientSecret: env.MATTERMOST_CLIENT_SECRET,
        })
    );
} else {
    console.log(
        "No Mattermost client id supplied or mattermost client secret. Not setting up the Mattermost provider"
    );
}

export const authOptions: NextAuthOptions = {
    // Include user.id on session
    callbacks: {
        session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        },
    },
    // Configure one or more authentication providers
    adapter: PrismaAdapter(prisma),
    providers: [
        ...providers,
        /**
         * ...add more providers here
         *
         * Most other providers require a bit more work than the Discord provider.
         * For example, the GitHub provider requires you to add the
         * `refresh_token_expires_in` field to the Account model. Refer to the
         * NextAuth.js docs for the provider you want to use. Example:
         * @see https://next-auth.js.org/providers/github
         */
    ],
};

export default NextAuth(authOptions);
