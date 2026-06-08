import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { authUserId, adminEmail } = await req.json()

  if (!authUserId) {
    return NextResponse.json({ error: 'authUserId required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: adminEmail,
  })

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Failed to generate link' }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'Honed Ops <contact@honedops.com>',
    to: adminEmail,
    subject: 'Reset your dashboard password',
    html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:32px 16px;background:#F5F5F5;font-family:-apple-system,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;">
    <div style="background:#0D0D0D;padding:20px 32px;">
      <p style="margin:0;color:white;font-size:18px;font-weight:700;">Honed Ops</p>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 12px;font-size:20px;color:#0D0D0D;">Reset your password</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#4A4A4A;line-height:1.6;">
        Click the button below to reset your dashboard password. This link expires in 24 hours.
      </p>
      <a href="${data.properties.action_link}"
        style="display:block;background:#8B2FC9;color:white;text-align:center;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;">
        Reset Password →
      </a>
      <p style="margin:24px 0 0;font-size:12px;color:#9CA3AF;">
        If you didn't request this, ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`,
  })

  return NextResponse.json({ success: true })
}
