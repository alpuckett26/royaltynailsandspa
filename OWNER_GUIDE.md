# Royalty Nails & Spa — Owner's Guide

---

## Quick Reference: Where to Go for What

| I need to… | Go to |
|---|---|
| See what's happening today | Admin → Dashboard |
| Add a walk-in appointment | Admin → Appointments → + New Appointment |
| Check who's waiting | Admin → Queue |
| Look up a customer | Admin → Customers |
| See staff hours for payroll | Admin → Staff → This Month |
| Add a new employee | Admin → Staff → + Add New Employee |
| Remove a former employee | Admin → Staff → Deactivate |
| Create a promotion | Admin → Specials → + Add Special |
| See customer complaints | Admin → Complaints |
| Update your phone number | Admin → Settings → Contact |
| Add a shift to the schedule | Admin → Schedule → + Add Shift |

---

## Your Public Website

### Home Page (/)
Your main page. Shows your brand, service highlights, current specials, testimonials, and FAQ. Updates automatically when you change Specials in the admin panel.

### Services & Pricing (/packages)
Full menu with all categories: Manicures, Pedicures, Signature Combinations, Acrylics, Facials, and Waxing. Prices and package details are all listed. Contact your developer to add or change services.

### Contact Page (/contact)
Shows your phone number, address, hours, and a contact form.

### Book Appointment (/book)
Customers book and pay online. Flow: pick a service → pick a date and time → enter contact info → pay via Square. After booking they get a confirmation page with Google Calendar and iCal download links. You receive an email notification for every new booking.

### Walk-In Kiosk (/checkin)
Set up a tablet at your front desk. Walk-in customers enter their name, pick a service, and tap Submit. They go into your live queue. Manage the queue at Admin → Queue.

### Feedback Form (/feedback)
Customers submit concerns here. They receive a unique ticket number (like RNS-K7MX4Q) on screen after submitting. Their complaint appears in Admin → Complaints immediately.

---

## Admin Panel — Your Control Center

Access at /admin — only visible to accounts with the Admin role.

Log in the same way as staff (PIN at /employee). Because you have the admin role, you'll automatically land in the admin panel.

---

### Dashboard (/admin/dashboard)

Your at-a-glance view of the business right now.

**Four stat cards:**
- Appointments Today — how many booked, how many checked in
- Walk-In Queue — how many customers waiting
- Clocked In — which staff are on the clock and for how long
- Week Hours — total staff hours Sun–Sat this pay week

**Two-column view below:**
- Left: today's full appointment list with Check In buttons
- Right: clocked-in staff with elapsed time + queue count

**How to use:**
1. Visit /admin/dashboard or tap Dashboard in the sidebar
2. Read the four stat cards for an instant pulse on the day
3. Tap any stat card to jump directly to that section
4. Use the Check In button next to an appointment when the customer arrives

**Tips:**
- The dashboard does not auto-refresh — reload the page to see the latest data
- Week Hours resets every Sunday morning

---

### Appointments (/admin/appointments)

View and manage all booked appointments by date.

**Viewing appointments:**
- Appointments split into Upcoming (not yet arrived) and Checked In (arrived)
- Each card shows name, time, service, phone number, and notes
- Date picker defaults to today — change it to view any date
- Tap Today button to snap back to the current date

**Adding a new appointment manually:**
1. Tap + New Appointment (top right)
2. Enter the customer's full name (required)
3. Add email and phone (optional)
4. Select the service from the grouped dropdown
5. Set the date and time
6. Add any notes (allergies, preferences, etc.)
7. Tap Add Appointment

**Checking in a customer:**
1. Find their card in the Upcoming section
2. Tap Check In
3. Card moves to Checked In with a ✓ Done badge

**Deleting an appointment:**
1. Find the appointment in the Upcoming section
2. Tap Delete (red text, right side)
3. Removed immediately — no undo

**Tips:**
- Phone numbers on each card are tappable on mobile to call directly
- Checked-in appointments dim to 50% so you can focus on who hasn't arrived
- Only Upcoming appointments can be deleted

---

### Customers (/admin/customers)

Your full customer phonebook — everyone who has ever booked.

**Searching:**
- Type in the search box — filters in real time
- Search works on name, email address, and phone number
- Clear the search to see all customers

**Viewing a customer's profile:**
1. Tap any customer card to expand
2. Email / Call / Text buttons appear for one-tap contact
3. Staff Notes section shows internal memos (customer never sees these)
4. Visit History shows every appointment with date, service, and time

**Adding a staff note:**
1. Expand the customer's card
2. Type in the note box under Staff Notes
3. Press Enter or tap Add
4. The note saves with your name and timestamp

**Deleting a note:**
- Tap the ✕ on the right side of any note

**Tips:**
- Notes are visible to all staff, not just admins
- Use notes for: allergies, preferences, VIP status, past issues
- Visit history shows most recent appointment first

---

### Staff & Hours (/admin/staff)

Manage employees and review hours worked.

**Viewing hours:**
1. Go to Admin → Staff
2. Use the range buttons: This Week / This Month / Past Year
3. Each employee card shows total hours and entry count
4. Tap an employee card to expand it
5. Month or Year view shows a Week-by-Week breakdown
6. Below that is a full log of every clock-in and clock-out
7. Grand Total at the bottom shows combined hours for all staff

**Adding a new employee:**
1. Scroll to the bottom of the Staff page
2. Tap + Add New Employee
3. Enter their full name
4. Enter a 4-digit PIN they'll use to log in
5. Set their Role: Staff (regular) or Admin (full admin access)
6. Tap Create Employee
7. They can now log in at /employee

**Deactivating an employee:**
1. Find them in the Staff list
2. Tap the red Deactivate button
3. They're removed from the login screen immediately
4. Their hour history is preserved for records

**Tips:**
- This Week is always Sun–Sat, resetting each Sunday
- Auto clock-out at 7 PM handles staff who forget to clock out
- Only give Admin role to people you trust with full business access
- You cannot deactivate your own account

---

### Walk-In Queue (/admin/queue)

**Live Queue tab:**
- Shows every walk-in currently waiting
- Listed in order — first in, first served
- Each card shows name, service, notes, and wait time
- Tap Served ✓ when a technician takes them
- Auto-refreshes every 30 seconds
- Tap Refresh in top right to update instantly

**History tab:**
1. Use the date picker to select any past date
2. Three stat cards appear: walk-ins served, average wait time, appointments ratio
3. Walk-In table: lists all served walk-ins with arrival time, wait time, who served them
4. Appointment Records table: shows all bookings with ✓ Showed or ✕ No-Show status

**Tips:**
- No-Show status is automatic — any unchecked past appointment is flagged red
- Walk-in check-in is separate from booked appointments
- Staff can also mark customers served from Staff → Check-In

---

### Schedule (/admin/schedule)

Weekly Mon–Sun shift calendar for all staff.

**Viewing the schedule:**
- Current week loads by default
- Use ← → arrows to move by week
- Tap This Week to return to current week
- Today's column is highlighted in gold
- Each shift block shows employee name and hours

**Adding a shift:**
1. Scroll to the bottom and tap + Add Shift
2. Select the employee from the dropdown
3. Pick the date
4. Set start time and end time
5. Add optional notes (e.g. "Opening shift")
6. Tap Add Shift

**Deleting a shift:**
- Hover over a shift block and tap the ✕ that appears

**Schedule share links:**
1. Scroll to Schedule Links at the bottom
2. Find the employee's name
3. Tap Copy
4. Paste the link into a text or email to send to them
5. They can view their own shifts without logging in

**Tips:**
- Schedule week is Mon–Sun (different from pay week which is Sun–Sat)
- Shifts must be added manually — they don't populate automatically
- Multiple employees can be scheduled on the same day

---

### Specials (/admin/specials)

Promotions that appear live on your website homepage.

**Adding a special:**
1. Tap + Add Special
2. Fill in:
   - Eyebrow — small label above title (e.g. "Limited Time")
   - Title — main headline (e.g. "Spring Refresh Package") *required*
   - Description — 1–2 sentences *required*
   - Offer Text — the actual deal (e.g. "20% off any full set") *required*
   - Badge — corner label (e.g. "New", "Popular") *optional*
   - Valid Through — expiration date *optional*
3. Tap Add Special
4. It appears on your website immediately

**Managing existing specials:**
- Edit: tap Edit → change any field → tap Update Special
- Hide from website: tap Deactivate (special stays in your list but disappears from the site)
- Show again: tap Activate on a deactivated special
- Remove permanently: tap Delete

**Tips:**
- Deactivating is safer than deleting — you can reactivate seasonal promos later
- Valid Through is display only — it does not auto-remove the special on that date
- 2–3 active specials is recommended for a clean website look

---

### Complaints (/admin/complaints)

All feedback submitted by customers at /feedback.

**Viewing complaints:**
- Filter tabs: All / Open / In Progress / Resolved (each shows a count)
- Each card shows: ticket number, status, customer name, which employee, when submitted, follow-up due date
- Red Overdue badge: due date has passed
- Amber Due Soon badge: due date is within 2 days
- Tap a card to expand the full complaint

**Managing a complaint:**
1. Expand the complaint card
2. Tap Email or Call to contact the customer directly
3. Read the full complaint text in the highlighted box
4. Review visit details: date, time, provider, service
5. Change the Status: Open → In Progress → Resolved
6. Set a Follow-Up Due Date (creates overdue alerts)
7. Add Internal Notes — your record of what actions were taken
8. Tap Save Changes
9. Or tap Mark Resolved ✓ to close it immediately

**Tips:**
- Start with the Open tab each morning to catch new submissions
- Customers may reference their ticket number when calling
- Internal notes are never visible to customers
- Setting a due date keeps you accountable — the card will show Overdue if you miss it
- Resolved complaints log the exact date and time of resolution

---

### Settings (/admin/settings)

Edit your business information. Each section saves independently.

**Contact section:**
- Phone number
- Email address
- Tap Save under Contact after editing

**Location section:**
- Street address
- Tap Save under Location after editing

**Hours section:**
- Mon–Sat Hours (free text, e.g. "Monday – Saturday: 10:00 AM – 7:00 PM")
- Sunday Hours / Note (e.g. "Sunday: By Appointment Only")
- Tap Save under Hours after editing

**Social Links section:**
- Instagram URL
- Facebook URL
- Google Business URL
- Tap Save under Social after editing

**Tips:**
- A "Saved." message in gold confirms your change went through
- Only edit the section you changed — each section has its own Save button
- Use full URLs including https:// for social links

---

## How-To Guide (Interactive)

Visit /admin/guide for the interactive version of this guide built into the admin panel. Tap any feature on the left and a full explanation appears on the right — including step-by-step instructions and tips.

---

## Automated Features (No Action Needed)

| Feature | When | What it does |
|---|---|---|
| Daily appointment reminder | Every day at 1:00 PM | Emails you today's full appointment list with customer contact info |
| Auto clock-out | Every day at 7:00 PM | Clocks out any staff who forgot to clock out — prevents runaway hours |
| Specials sync | Instantly | When you add/edit/deactivate a special in the admin panel, your website updates |

---

## Staff Portal (What Your Employees See)

Staff log in at /employee using their name and PIN. They can:
- Clock in and clock out from their dashboard
- View today's appointments
- Look up customers (phonebook)
- Manage the walk-in queue
- View their schedule
- Add notes to customer profiles

Staff do NOT have access to the admin panel, hours for other employees, payroll data, or business settings — unless you give them the Admin role.

---

*This guide covers the full system as built. For technical changes (adding services, changing pricing, modifying the website layout), contact your developer.*
