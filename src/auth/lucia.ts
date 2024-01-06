import { planetscale } from "@lucia-auth/adapter-mysql";
import { connect } from "@planetscale/database";

import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";
import { github } from "@lucia-auth/oauth/providers";

const config = {
  url: process.env["DATABASE_URL"] || "mysql://user:pass@host",
  fetch: (url: string, init: any) => {
    delete (init as any)["cache"]; // Remove cache header
    return fetch(url, init);
  },
};

const connection = connect(config);

// expect error (see next section)
export const auth = lucia({
  env: "DEV", // if deployed to HTTPS
  middleware: nextjs_future(), // NOT nextjs()
  sessionCookie: {
    expires: false, // only for projects deployed to the edge
  },
  adapter: planetscale(connection, {
    user: "User",
    key: "user_key",
    session: "user_session",
  }),
  getUserAttributes: (data) => {
    return {
      githubUsername: data.username,
      username: data.username,
    };
  },
});
export const githubAuth = github(auth, {
	clientId: process.env.GITHUB_CLIENT_ID ?? "",
	clientSecret: process.env.GITHUB_CLIENT_SECRET ?? ""
});

export type Auth = typeof auth;
