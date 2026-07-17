from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, Image, HRFlowable
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from pathlib import Path

ROOT = Path('/Users/sanjaygunabalan2626gmail.com/Documents/Ayurvedic /Ayurvedic /ayurvedic')
OUT = ROOT / 'output/pdf/kerala-ayurvedic-new-booking-trial-guide.pdf'
LOGO = ROOT / 'public/kerala-logo.png'
OUT.parent.mkdir(parents=True, exist_ok=True)

MAROON = colors.HexColor('#6E1023')
GOLD = colors.HexColor('#D4AF37')
CREAM = colors.HexColor('#F7F2E8')
DARK = colors.HexColor('#1F1F1F')
GREEN = colors.HexColor('#2E7D32')
RED = colors.HexColor('#B42318')
GREY = colors.HexColor('#667085')
LIGHT_RED = colors.HexColor('#FEF3F2')
LIGHT_GREEN = colors.HexColor('#ECFDF3')

font_regular = '/System/Library/Fonts/Supplemental/Arial.ttf'
font_bold = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
if Path(font_regular).exists():
    pdfmetrics.registerFont(TTFont('KAL', font_regular))
    pdfmetrics.registerFont(TTFont('KAL-Bold', font_bold))
else:
    font_regular, font_bold = 'Helvetica', 'Helvetica-Bold'
    # Built-ins do not need registration.

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleK', fontName='KAL-Bold', fontSize=25, leading=29, textColor=MAROON, spaceAfter=8))
styles.add(ParagraphStyle(name='SubTitleK', fontName='KAL', fontSize=11.5, leading=17, textColor=GREY, spaceAfter=12))
styles.add(ParagraphStyle(name='H1K', fontName='KAL-Bold', fontSize=18, leading=22, textColor=MAROON, spaceAfter=9))
styles.add(ParagraphStyle(name='H2K', fontName='KAL-Bold', fontSize=12.5, leading=16, textColor=MAROON, spaceBefore=6, spaceAfter=5))
styles.add(ParagraphStyle(name='BodyK', fontName='KAL', fontSize=9.6, leading=14, textColor=DARK, spaceAfter=5))
styles.add(ParagraphStyle(name='SmallK', fontName='KAL', fontSize=8.2, leading=11.5, textColor=GREY))
styles.add(ParagraphStyle(name='WhiteK', fontName='KAL-Bold', fontSize=10, leading=13, textColor=colors.white, alignment=TA_CENTER))
styles.add(ParagraphStyle(name='HeaderCell', fontName='KAL-Bold', fontSize=8.7, leading=11, textColor=colors.white, alignment=TA_LEFT))
styles.add(ParagraphStyle(name='CardTitle', fontName='KAL-Bold', fontSize=10.2, leading=13, textColor=MAROON, spaceAfter=3))
styles.add(ParagraphStyle(name='CardBody', fontName='KAL', fontSize=8.7, leading=12.3, textColor=DARK))
styles.add(ParagraphStyle(name='FlowBody', fontName='KAL', fontSize=8.7, leading=12.3, textColor=DARK, alignment=TA_CENTER))
styles.add(ParagraphStyle(name='Checklist', fontName='KAL', fontSize=9, leading=13, leftIndent=14, firstLineIndent=-14, textColor=DARK, spaceAfter=4))
styles.add(ParagraphStyle(name='Callout', fontName='KAL', fontSize=9, leading=13, textColor=DARK))

def footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(colors.HexColor('#E7D9BE'))
    canvas.line(18*mm, 14*mm, w-18*mm, 14*mm)
    canvas.setFont('KAL', 7.5)
    canvas.setFillColor(GREY)
    canvas.drawString(18*mm, 9.5*mm, 'Kerala Ayurvedic Lifestyle | New Booking System Trial Guide')
    canvas.drawRightString(w-18*mm, 9.5*mm, f'Page {doc.page}')
    canvas.restoreState()

doc = BaseDocTemplate(str(OUT), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm,
                      topMargin=17*mm, bottomMargin=20*mm, title='New Booking System Trial Guide',
                      author='Kerala Ayurvedic Lifestyle')
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='main')
doc.addPageTemplates([PageTemplate(id='all', frames=[frame], onPage=footer)])

def badge(text, bg=MAROON, width=42*mm):
    t = Table([[Paragraph(text, styles['WhiteK'])]], colWidths=[width], rowHeights=[9*mm])
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),bg),('VALIGN',(0,0),(-1,-1),'MIDDLE'),
                           ('BOX',(0,0),(-1,-1),0,bg),('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4)]))
    return t

def callout(title, body, tone='gold'):
    bg, border = (CREAM, GOLD) if tone == 'gold' else ((LIGHT_GREEN, GREEN) if tone == 'green' else (LIGHT_RED, RED))
    content = Paragraph(f'<b>{title}</b><br/>{body}', styles['Callout'])
    t = Table([[content]], colWidths=[doc.width], style=[
        ('BACKGROUND',(0,0),(-1,-1),bg), ('BOX',(0,0),(-1,-1),1,border),
        ('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),
        ('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)])
    return t

def flow(items):
    cells=[]
    for i,item in enumerate(items):
        cells.append(Paragraph(f'<b>{i+1}</b><br/>{item}', styles['FlowBody']))
        if i < len(items)-1:
            cells.append(Paragraph('<b>&gt;</b>', styles['CardTitle']))
    widths=[]
    block=(doc.width-(len(items)-1)*8*mm)/len(items)
    for i in range(len(cells)):
        widths.append(block if i%2==0 else 8*mm)
    t=Table([cells], colWidths=widths, rowHeights=[24*mm])
    cmds=[]
    for i in range(0,len(cells),2):
        cmds += [('BACKGROUND',(i,0),(i,0),CREAM),('BOX',(i,0),(i,0),0.8,GOLD),('VALIGN',(i,0),(i,0),'MIDDLE'),('ALIGN',(i,0),(i,0),'CENTER')]
    cmds += [('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE')]
    t.setStyle(TableStyle(cmds))
    return t

def checklist(items):
    return [Paragraph(f'<font color="#D4AF37">&#9633;</font>&nbsp;&nbsp;{x}', styles['Checklist']) for x in items]

def role_table(rows):
    data=[[Paragraph('Role / area',styles['HeaderCell']),Paragraph('What to try',styles['HeaderCell']),Paragraph('Expected result',styles['HeaderCell'])]]
    for a,b,c in rows:
        data.append([Paragraph(a,styles['CardTitle']),Paragraph(b,styles['CardBody']),Paragraph(c,styles['CardBody'])])
    t=Table(data,colWidths=[31*mm,67*mm,77*mm],repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),MAROON),('TEXTCOLOR',(0,0),(-1,0),colors.white),
        ('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#DDCFB4')),('VALIGN',(0,0),(-1,-1),'TOP'),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,CREAM]),
        ('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),
        ('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    return t

story=[]
if LOGO.exists():
    story.append(Image(str(LOGO), width=33*mm, height=33*mm, hAlign='LEFT'))
story += [Spacer(1,5*mm), badge('TRIAL GUIDE', GOLD, 38*mm), Spacer(1,5*mm),
          Paragraph('New Booking System', styles['TitleK']),
          Paragraph('A practical guide for clinic staff and testers | 17 July 2026', styles['SubTitleK']),
          HRFlowable(width='100%', thickness=1.2, color=GOLD, spaceBefore=2, spaceAfter=12),
          Paragraph('What has changed', styles['H1K']),
          Paragraph('The online booking journey now follows the clinic-approved flow: customers choose one real slot, treatments go straight to payment, and free consultations confirm immediately. Therapist selection is handled internally after payment - never by the customer.', styles['BodyK']),
          Spacer(1,3*mm), flow(['Choose one slot','Pay online<br/>(treatment only)','Booking confirmed','Clinic assigns therapist']),
          Spacer(1,6*mm), callout('Important before testing payments', 'The website code and production build pass locally, but the configured staging database is still missing the atomic payment-confirmation RPC. Treatment checkout can be reviewed, but a successful end-to-end payment must not be signed off until the approved staging migration is applied.', 'red'),
          Spacer(1,5*mm), Paragraph('Quick summary', styles['H2K'])]
story += checklist([
    '<b>Treatments:</b> one slot, FPX/card checkout, confirmation after successful payment.',
    '<b>Free consultation:</b> one 30-minute Vaidya slot, immediate confirmation, no payment.',
    '<b>Therapists:</b> assigned internally after payment according to gender and availability.',
    '<b>Dashboards:</b> focus on confirmed bookings, unassigned treatments, today\'s visits, and clinical clearance.',
    '<b>Removed:</b> online approval, alternate-slot requests, customer therapist selection, mock admin appointments, and active Cal.com actions.'
])

story += [PageBreak(), Paragraph('1. Test the customer journey', styles['H1K']),
          Paragraph('Use dedicated test names and contact details. Do not use real payment credentials.', styles['SubTitleK']),
          Paragraph('A. Paid treatment booking', styles['H2K'])]
story += checklist([
    'Open the treatment booking page and select a treatment.',
    'Choose gender and exactly <b>one</b> available date and time.',
    'Complete the customer and health information, then accept the policies.',
    'Confirm the main button says <b>Continue to payment</b>.',
    'Confirm the checkout offers FPX and card only when that method is enabled.',
    'Confirm the booking status uses <b>Slot selected > Payment > Confirmation</b>.',
    'Confirm there is no approval step, alternate time, or customer therapist picker.'
])
story += [Spacer(1,3*mm), callout('Expected treatment result', 'Before payment: awaiting payment with a visible hold countdown. After a valid sandbox payment and the required RPC migration: confirmed, with the therapist still unassigned until clinic staff selects one.', 'green'),
          Spacer(1,5*mm), Paragraph('B. Free consultation', styles['H2K'])]
story += checklist([
    'Choose <b>Free Consultation</b>.',
    'Select one available Vaidya slot.',
    'Confirm the slot is always treated as a 30-minute consultation.',
    'Confirm the button says <b>Confirm free consultation</b>.',
    'Submit and confirm the booking opens its confirmed status page immediately.',
    'Check that the page and notification copy contain no payment or therapist-assignment wording.'
])
story += [Spacer(1,3*mm), callout('Expected consultation result', 'The consultation is confirmed immediately with the Vaidya. After an attended consultation, a doctor or admin records the outcome and can clear the customer to book the recommended treatment.', 'green'),
          Spacer(1,5*mm), Paragraph('C. Customer account', styles['H2K'])]
story += checklist([
    'Open the customer appointment list and the next-appointment card.',
    'Confirm <b>Pay now</b> appears only for a treatment awaiting payment.',
    'Confirm other appointments use <b>View booking</b>.',
    'Confirm no Cal.com reschedule/cancel links or customer therapist-selection actions appear.',
    'For a confirmed unassigned treatment, confirm the page explains that the clinic will assign the appropriate therapist.'
])

story += [PageBreak(), Paragraph('2. Test the clinic dashboards', styles['H1K']),
          Paragraph('Use the correct role account for each test. Doctor-only accounts should continue to see redacted customer contact information.', styles['SubTitleK']),
          role_table([
              ('Front desk', 'Open Needs therapist, Today, Confirmed, Awaiting payment, and Schedule. Assign a therapist to a paid confirmed treatment.', 'Unassigned treatments are prominent. Assignment keeps the booking confirmed and places it on the therapist schedule.'),
              ('Front desk visit', 'Try checking in or starting a confirmed treatment before assigning a therapist, then repeat after assignment.', 'Before assignment: blocked. After valid assignment: allowed.'),
              ('Doctor', 'Open Overview, Schedule, Calendar, Patients, and Consultations. Visit the old /doctor/requests URL.', 'No Requests navigation or approval counter. The old URL redirects to the doctor overview.'),
              ('Doctor clearance', 'Open a past, attended consultation and record the outcome. Try the same as front desk.', 'Doctor/admin can clear eligible consultations. Front desk cannot perform clinical clearance.'),
              ('Admin', 'Open Overview and Appointments. Review Today, Needs therapist, and Awaiting payment.', 'Only real appointment data is shown; no demo fallback. Commerce modules stay hidden while disabled.'),
              ('Admin detail', 'Open an appointment and review available actions and status information.', 'No Cal.com sync panel, manual Cal.com warning, or obsolete approval-first workflow.'),
          ]),
          Spacer(1,7*mm), Paragraph('Assignment rules to verify', styles['H2K'])]
story += checklist([
    'The therapist matches the patient gender policy.',
    'The therapist is working and is not on leave or blocked.',
    'The therapist is not already booked for an overlapping appointment.',
    'Reassigning does not change the appointment from confirmed to another status.',
    'The red unassigned warning disappears only after a valid therapist is assigned.'
])
story += [Spacer(1,4*mm), callout('Do not accept a visual-only success', 'A treatment must remain impossible to check in or start without an assigned therapist. This rule is enforced in both the screen actions and the server-side booking logic.', 'gold')]

story += [PageBreak(), Paragraph('3. Trial checklist and issue reporting', styles['H1K']),
          Paragraph('Run the most important paths on both a mobile-sized screen (about 390 px wide) and a desktop screen (about 1440 px wide).', styles['SubTitleK']),
          Paragraph('Minimum sign-off checklist', styles['H2K'])]
story += checklist([
    'Treatment: one slot -> checkout -> payment -> confirmation.',
    'Consultation: one 30-minute slot -> immediate confirmation without payment.',
    'Customer account: correct status actions and no Cal.com/customer therapist selection.',
    'Front desk: unassigned queue -> assign -> therapist schedule -> check in.',
    'Doctor: no request approval page; notes, assignment, and eligible clearance work.',
    'Admin: real data only; Needs therapist and Today are the main appointment views.',
    'Cleared consultation: signed customer link -> treatment booking -> checkout.',
    'Hold expiry: unpaid slot eventually becomes available again.',
    'Group booking: every guest retains their chosen slot and is assigned individually.'
])
story += [Spacer(1,5*mm), Paragraph('When reporting a problem', styles['H2K']),
          Paragraph('Send the following so the issue can be reproduced quickly:', styles['BodyK'])]
story += checklist([
    'Your role (customer, front desk, doctor, or admin).',
    'The page URL and approximate time of the test.',
    'The booking ID or test customer name - never send passwords or payment credentials.',
    'What you clicked, what you expected, and what happened instead.',
    'A screenshot showing the full screen and any error message.',
    'Whether the issue occurred on mobile or desktop and which browser you used.'
])
story += [Spacer(1,5*mm), callout('Current readiness', 'Automated tests: 202 passed. TypeScript: passed. Production build: passed. Active Cal.com scan: passed. Staging payment confirmation: blocked until the atomic payment-confirmation RPC migration is explicitly approved and applied.', 'gold'),
          Spacer(1,7*mm), Paragraph('Please treat this as a trial build, not production approval.', styles['H2K']),
          Paragraph('No production deployment, live database migration, or real payment was performed as part of this work.', styles['BodyK'])]

doc.build(story)
print(OUT)
