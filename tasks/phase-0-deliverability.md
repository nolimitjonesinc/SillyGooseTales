# Phase 0 — Deliverability Infrastructure

**Goal:** A test email lands in Gmail Primary from your custom domain before any code is written.
**RULE:** Phase 1 does not start until every task in this file is checked.

---

## Tasks

- [ ] Register domain for Story Drop (storydrop.com or storydrop.email — check availability)
- [ ] Create Resend account at resend.com
- [ ] Add custom sending domain in Resend: `mail.[yourdomain].com`
- [ ] Publish SPF record on sending domain
- [ ] Publish DKIM record (2048-bit) on sending domain
- [ ] Publish DMARC record on sending domain (start with `p=none`)
- [ ] Register domain in Google Postmaster Tools
- [ ] Register Yahoo Postmaster / Feedback Loop
- [ ] Send test email from Resend with sender name `Maya at Story Drop` — white background, Georgia serif body, no images
- [ ] Confirm test email lands in Gmail Primary (not Promotions) — test from personal Gmail account
- [ ] Confirm test email lands in Outlook inbox — test from personal Outlook/Hotmail account
- [ ] Revise financial model: run numbers at 5% paid conversion (not 15%) and $9.99/month — confirm this motivates you before Phase 1

---

## Done When

Every box is checked. The test email is sitting in Gmail Primary right now.
