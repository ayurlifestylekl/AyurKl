export function appointmentConfirmationEmail(input: {
  firstName: string
  treatmentName: string
  whenLocal: string
  doctorName: string
  href: string
}) {
  const greeting = `Hi ${input.firstName},`
  return {
    subject: `${input.treatmentName} confirmed — ${input.whenLocal}`,
    text: `${greeting}\n\nYour appointment is confirmed.\n\n  ${input.treatmentName}\n  ${input.whenLocal}\n  with ${input.doctorName}\n\nManage or reschedule: ${input.href}\n\nWith warmth,\nKerala Ayurvedic Lifestyle`,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#163F33">
  <h1 style="font-family:'Helvetica Neue',sans-serif;font-size:22px;font-weight:700;margin:0 0 16px">Appointment confirmed</h1>
  <p style="line-height:1.65">${greeting}</p>
  <p style="line-height:1.65">We're looking forward to seeing you.</p>
  <div style="margin:24px 0;padding:18px 20px;border:1px solid rgba(22, 63, 51,0.1);border-radius:18px;background:#F7F2E8">
    <p style="margin:0;font-weight:700;font-size:16px">${input.treatmentName}</p>
    <p style="margin:6px 0 0;color:#163F33">${input.whenLocal}</p>
    <p style="margin:6px 0 0;color:#666">with ${input.doctorName}</p>
  </div>
  <p><a href="${input.href}" style="display:inline-block;background:#1E5B4B;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:700">Manage booking</a></p>
  <p style="margin-top:32px;color:#666">With warmth,<br/>Kerala Ayurvedic Lifestyle</p>
</div>`,
  }
}
