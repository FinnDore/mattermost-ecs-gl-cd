/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
require("dotenv").config();
import { createServer } from "http";
import next from "next";
import { parse } from "url";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const hostname = new URL(process.env.BASE_URL ?? "").hostname;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer((req, res) => {
        if (!req.url) {
            res.statusCode = 500;
            res.end();
            return;
        }

        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(port);

    console.log(
        `> Server listening at http://localhost:${port} as ${
            dev ? "development" : process.env.NODE_ENV
        }`
    );
});
