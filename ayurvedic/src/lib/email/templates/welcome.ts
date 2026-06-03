export function welcomeEmail(input: { firstName: string }) {
  const greeting = `Hello ${input.firstName},`
  return {
    subject: 'Welcome to Kerala Ayurvedic Lifestyle',
    text: `${greeting}\n\nThank you for joining us. Your Vaidya will reach out within 24 hours to begin your wellness journey.\n\nVisit your dashboard: https://keralaayurvedic.my/account/dashboard\n\nWith warmth,\nVaidya Akhil & the Kerala Ayurvedic team`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#163F33">
  <h1 style="font-family:'Helvetica Neue',sans-serif;font-size:22px;font-weight:700;margin:0 0 16px">Welcome to Kerala Ayurvedic Lifestyle</h1>
  <p style="line-height:1.65">${greeting}</p>
  <p style="line-height:1.65">Thank you for joining us. Your Vaidya will reach out within 24 hours to begin your wellness journey.</p>
  <p style="margin-top:24px"><a href="https://keralaayurvedic.my/account/dashboard" style="display:inline-block;background:#1E5B4B;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:700">Open your dashboard</a></p>
  <p style="margin-top:32px;color:#666">With warmth,<br/>Vaidya Akhil &amp; the Kerala Ayurvedic team</p>
</div>`,
  }
}
