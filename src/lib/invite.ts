import { createServerFn } from "@tanstack/react-start";

export const sendInvite = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { email: string; role: "admin" | "editor" | "viewer" } }) => {
    const res = await fetch("https://api.clerk.com/v1/invitations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: data.email,
        public_metadata: { role: data.role },
        redirect_url: `${process.env.VITE_APP_URL ?? "http://localhost:3000"}/admin`,
      }),
    });
    if (!res.ok) {
      const err = await res.json() as { errors?: { message: string }[] };
      throw new Error(err.errors?.[0]?.message ?? "Failed to send invite");
    }
    return { ok: true };
  });
