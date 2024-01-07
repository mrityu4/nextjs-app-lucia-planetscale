import Script from "next/script";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section>{children}</section>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" />
    </>
  );
}
