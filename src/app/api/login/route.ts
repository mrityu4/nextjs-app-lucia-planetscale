import { auth } from "@/auth/lucia";
import { LuciaError } from "lucia";
import * as context from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
export const runtime = "edge";

export const POST = async (request: NextRequest) => {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();
  if (session) redirect("/");

  //turnstile logic
  const formData = await request.formData();
  const token = formData.get("cf-turnstile-response") as string;
  const ip = request.headers.get("CF-Connecting-IP");

  if (!token || !ip)
    return NextResponse.json(
      {
        error:
          "Missing fields for turnstile validation! This is an error on our side, we are working on fixing it.",
      },
      { status: 400 }
    );

  // Validate the token by calling the "/siteverify" API.
  let turnstileformData = new FormData();
  turnstileformData.append("secret", process.env.TURNSTILE_SECRET_KEY ?? "");
  turnstileformData.append("response", token);
  turnstileformData.append("remoteip", ip);

  const result = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      body: turnstileformData,
      method: "POST",
      cache: "no-store",
    }
  );

  const outcome = await result.json();
  if (!outcome.success) {
    return NextResponse.json(
      {
        error:
          "The provided Turnstile token was not valid! \n" +
          JSON.stringify(outcome),
      },
      { status: 400 }
    );
  }

  //login logic begins here
  const username = formData.get("username");
  const password = formData.get("password");
  // basic check
  if (
    typeof username !== "string" ||
    username.length < 1 ||
    username.length > 31
  ) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }
  if (
    typeof password !== "string" ||
    password.length < 1 ||
    password.length > 255
  ) {
    return NextResponse.json({ error: "Invalid password" }, { status: 400 });
  }

  try {
    // find user by key
    // and validate password
    const key = await auth.useKey("username", username.toLowerCase(), password);
    const session = await auth.createSession({
      userId: key.userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(request.method, context);
    authRequest.setSession(session);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/", // redirect to profile page
      },
    });
  } catch (e) {
    if (
      e instanceof LuciaError &&
      (e.message === "AUTH_INVALID_KEY_ID" ||
        e.message === "AUTH_INVALID_PASSWORD")
    ) {
      // user does not exist or invalid password
      return NextResponse.json(
        { error: "Incorrect username or password" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
