import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = "Pactum <results@pactum.so>"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function safeSubject(s: string) {
  return s.replace(/[\r\n]/g, " ")
}

export async function sendResultsNotification({
  to,
  candidateName,
  assessmentTitle,
  score,
  shareToken,
}: {
  to: string[]
  candidateName: string
  assessmentTitle: string
  score: number
  shareToken: string
}) {
  if (!to.length || !process.env.RESEND_API_KEY) return

  const shareUrl = `${SITE_URL}/share/${shareToken}`
  const scoreColor = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444"
  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 55 ? "Average" : "Needs work"
  const safeName = esc(candidateName)
  const safeTitle = esc(assessmentTitle)

  await resend.emails.send({
    from: FROM,
    to,
    subject: safeSubject(`${candidateName} scored ${score}/100 on "${assessmentTitle}"`),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f3;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:28px;">
          <span style="font-size:18px;font-weight:900;letter-spacing:-0.04em;color:#000;">Pactum</span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#fff;border-radius:16px;border:1px solid #e0e1e6;overflow:hidden;">

          <!-- Score header -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:28px 28px 20px;border-bottom:1px solid #e0e1e6;">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:20px;">
                      <div style="width:72px;height:72px;border-radius:50%;border:3px solid ${scoreColor};display:flex;align-items:center;justify-content:center;text-align:center;line-height:72px;">
                        <span style="font-size:28px;font-weight:900;color:${scoreColor};letter-spacing:-0.04em;">${score}</span>
                      </div>
                    </td>
                    <td>
                      <p style="margin:0 0 2px;font-size:16px;font-weight:700;color:#1c2024;letter-spacing:-0.01em;">${safeName}</p>
                      <p style="margin:0 0 6px;font-size:13px;color:#60646c;">${safeTitle}</p>
                      <span style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${scoreColor};">${grade}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td style="padding:24px 28px;">
                <p style="margin:0 0 16px;font-size:13px;color:#60646c;line-height:1.5;">
                  The full session replay, score breakdown, and feedback are ready to view.
                </p>
                <a href="${shareUrl}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:10px 20px;border-radius:9999px;">
                  View full results →
                </a>
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding-top:20px;">
          <p style="margin:0;font-size:11px;color:#b0b4ba;">Sent by Pactum · This link is private — only share with people involved in this hire.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
