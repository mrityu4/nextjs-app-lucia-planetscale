import { auth } from "@/auth/lucia";
import * as context from "next/headers";
import { redirect } from "next/navigation";

import Form from "@/components/form";
export const runtime = 'edge'
const Page = async () => {
	const authRequest = auth.handleRequest("GET", context);
	const session = await authRequest.validate();
	if (!session) redirect("/login");
	return (
		<>
			<h1>Profile</h1>
			<p>User id: {session.user.userId}</p>
			<p>Username: {session.user.username}</p>
			<Form action="/api/logout">
				<input type="submit" value="Sign out" />
			</Form>
		</>
	);
};

export default Page;
