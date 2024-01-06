import { auth } from "@/auth/lucia";
import Form from "@/components/form";
import * as context from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
export const runtime = 'edge'
const Page = async () => {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();
  if (session) redirect("/");

  return (
    <>
      <h1>Sign in</h1>
      <Form action="/api/login">
        <label htmlFor="username">Username</label>
        <input name="username" id="username" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <input type="submit" />
      </Form>
      <Link href="/signup">Create an account</Link>
    </>
  );
};

export default Page;
