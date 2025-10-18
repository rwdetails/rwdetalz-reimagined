# EmailJS Configuration Guide for RWDetailz

## Quick Setup (5 minutes)

### 1. Create EmailJS Account
- Go to https://www.emailjs.com
- Sign up with Google or email
- Verify your email address

### 2. Add Email Service
- Click "Email Services" in dashboard
- Click "Add New Service"
- Select "Gmail" (or your preferred email provider)
- Connect your rwdetailz@gmail.com account
- Note the **Service ID** (e.g., "service_abc123")

### 3. Create Email Templates

#### Template 1: Client Confirmation
- Click "Email Templates" → "Create New Template"
- Name: "RWDetailz Booking Confirmation"
- Subject: `✅ Booking Confirmed - {{booking_id}}`
- Content:
```html
Hi {{to_name}},

Thanks for booking with RWDetailz!

📅 Date: {{date}}
🕒 Time: {{time}}
🧼 Services: {{services}}
📍 Address: {{address}}
📘 Booking ID: {{booking_id}}
💰 Total: {{total}}

We'll see you soon — your surfaces are about to shine!

– Rakeem & Wood @ RWDetailz
📧 rwdetailz@gmail.com | 📞 (954) 865-6205
```
- Note the **Template ID** (e.g., "template_client123")

#### Template 2: Owner Notification
- Create another template
- Name: "RWDetailz New Booking Alert"
- Subject: `🆕 New Booking - {{booking_id}}`
- Content:
```html
📥 New booking received!

Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}
Address: {{address}}
Date & Time: {{date}} @ {{time}}
Services: {{services}}
Special Instructions: {{instructions}}
Booking ID: {{booking_id}}
Total: {{total}}
Source: {{source}}
```
- Note the **Template ID** (e.g., "template_owner456")

#### Template 3: Careers Application (Optional)
- Create one more template for job applications
- Name: "RWDetailz Job Application"
- Subject: `💼 New Application - {{position}}`
- Use similar format with career-specific fields

### 4. Get Your Public Key
- Click on "Account" → "General"
- Find your **Public Key** (e.g., "abc123def456")

### 5. Update the Code

Open `/src/components/BookingForm.tsx` and replace:

**Line 94:** Replace `YOUR_SERVICE_ID` with your Service ID
**Line 95:** Replace `YOUR_CLIENT_TEMPLATE_ID` with Template 1 ID
**Line 102:** Replace `YOUR_PUBLIC_KEY` with your Public Key
**Line 108:** Replace `YOUR_OWNER_TEMPLATE_ID` with Template 2 ID
**Line 117:** Replace `YOUR_PUBLIC_KEY` with your Public Key (same as line 102)

Open `/src/components/Careers.tsx` and replace the same values around lines 37-47.

### 6. Test Your Setup
1. Run `npm run dev`
2. Navigate to the "Book Now" tab
3. Fill out the booking form
4. Submit and check both email inboxes

## Example Configuration

```typescript
// BookingForm.tsx - Line 94-117
await emailjs.send(
  "service_abc123",              // Your Service ID
  "template_client123",          // Your Client Template ID
  { /* template variables */ },
  "abc123def456"                 // Your Public Key
);

await emailjs.send(
  "service_abc123",              // Same Service ID
  "template_owner456",           // Your Owner Template ID
  { /* template variables */ },
  "abc123def456"                 // Same Public Key
);
```

## Troubleshooting

**Emails not sending?**
- Check that Service ID, Template IDs, and Public Key are correct
- Verify email service is connected in EmailJS dashboard
- Check browser console for error messages
- Ensure template variables match exactly

**Wrong information in emails?**
- Double-check template variable names (case-sensitive)
- Verify all variables in template match the code

**Monthly limit reached?**
- Free tier: 200 emails/month
- Upgrade to paid plan for more emails

## Support
- EmailJS docs: https://www.emailjs.com/docs
- Need help? Contact: rwdetailz@gmail.com
