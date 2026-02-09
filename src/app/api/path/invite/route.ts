import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, inviteLink } = await req.json();

  if (!email || !inviteLink) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  await resend.emails.send({
    from: "Trakko <onboarding@resend.dev>",
    to: email,
    subject: "You’ve been invited to a path",
    html: `
      <p>You’ve been invited to join a path.</p>
      <p>
        <a href="${inviteLink}">
          Click here to join
        </a>
      </p>
    `,
  });

  return NextResponse.json({ success: true });
}
