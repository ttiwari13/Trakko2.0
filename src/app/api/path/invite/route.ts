import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const {email, inviteLink } = await req.json();
  if (!email || !inviteLink) {
    return NextResponse.json({ error: "Missing email or invite link" }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  try {
    await resend.emails.send({
      from: "Trakko <onboarding@resend.dev>",
      to: email,
      subject: "You've been invited to a path on Trakko",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1d4ed8;">You've been invited! 🎉</h2>
          <p style="color: #374151;">Someone invited you to join their path on <strong>Trakko</strong>.</p>
          <a
            href="${inviteLink}"
            style="
              display: inline-block;
              margin-top: 16px;
              padding: 12px 24px;
              background-color: #2563eb;
              color: white;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
            "
          >
            Join the Path
          </a>
          <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
            If you didn't expect this invite, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}