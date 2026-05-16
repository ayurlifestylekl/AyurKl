export function ticketReplyEmail(input: {
  firstName: string
  ticketSubject: string
  preview: string
  href: string
}) {
  const greeting = `Hi ${input.firstName},`
  return {
    subject: `New reply: ${input.ticketSubject}`,
    text: `${greeting}\n\nVaidya has replied to your conversation: "${input.ticketSubject}"\n\n${input.preview}\n\nRead the full reply: ${input.href}\n\nWith warmth,\nKerala Ayurvedic Lifestyle`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1e3d32">
  <h1 style="font-family:'Helvetica Neue',sans-serif;font-size:22px;font-weight:700;margin:0 0 16px">New reply from Vaidya</h1>
  <p style="line-height:1.65">${greeting}</p>
  <p style="line-height:1.65">Vaidya has replied to your conversation: <em>"${input.ticketSubject}"</em></p>
  <blockquote style="margin:24px 0;padding:18px 20px;border-left:3px solid #D4A373;background:#FAF6EE;color:#1e3d32;line-height:1.65;font-style:italic">
    ${input.preview}
  </blockquote>
  <p><a href="${input.href}" style="display:inline-block;background:#2F5D50;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:700">Read full reply</a></p>
  <p style="margin-top:32px;color:#666">With warmth,<br/>Kerala Ayurvedic Lifestyle</p>
</div>`,
  }
}
