'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type GuideItem = {
  id: string
  title: string
  summary: string
  path?: string
  what: string
  how?: string[]
  tips?: string[]
}

type GuideCategory = {
  id: string
  label: string
  icon: string
  items: GuideItem[]
}

const GUIDE: GuideCategory[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '▦',
    items: [
      {
        id: 'dash-overview',
        title: 'Daily Overview',
        summary: 'Live stats for today — appointments, queue, staff, hours',
        path: '/admin/dashboard',
        what: 'The Dashboard is your first stop every morning. It shows four live stat cards at the top: how many appointments are booked today and how many have checked in, how many walk-in customers are currently waiting in the queue, how many staff members are clocked in right now and for how long, and total staff hours worked this pay week (Sunday through Saturday).\n\nBelow the cards you\'ll see today\'s full appointment list on the left — each one with a Check In button — and on the right a live view of clocked-in staff and the current queue count.',
        how: [
          'Visit /admin/dashboard (or tap Dashboard in the sidebar)',
          'Read the four stat cards at the top for an instant pulse on the day',
          'Tap any stat card to jump directly to that section for more detail',
          'Use the Check In button next to an appointment name when the customer arrives',
          'The Staff On Clock section shows each employee\'s name and how long they\'ve been clocked in',
        ],
        tips: [
          'The dashboard does not auto-refresh — reload the page to see the latest data',
          'Week Hours counts Sun–Sat, resetting each Sunday morning',
          'Tapping the Queue count card takes you directly to the live queue page',
        ],
      },
    ],
  },

  {
    id: 'appointments',
    label: 'Appointments',
    icon: '◈',
    items: [
      {
        id: 'appt-view',
        title: 'Viewing Appointments',
        summary: 'Browse all bookings by date — upcoming and checked in',
        path: '/admin/appointments',
        what: 'The Appointments page shows all bookings for a selected date. Appointments are split into two groups: Upcoming (customers who haven\'t arrived yet) and Checked In (customers who have been marked as arrived). Each card shows the customer\'s name, appointment time, service, phone number, and any notes they left when booking.',
        how: [
          'Go to Admin → Appointments',
          'The date picker defaults to today — tap it to jump to any other date',
          'Tap the Today button (appears when you\'ve moved to another date) to snap back',
          'The formatted date (e.g. "Monday, June 3") is shown to the right of the picker as a quick reference',
          'Upcoming appointments are shown first, checked-in appointments appear below in a dimmed, strikethrough style',
        ],
        tips: [
          'Phone numbers are shown on each card — tap to call directly on mobile',
          'Notes from the customer\'s booking appear in italic text on the card',
          'If a date has no appointments, you\'ll see an empty state message',
        ],
      },
      {
        id: 'appt-add',
        title: 'Adding an Appointment',
        summary: 'Manually book a customer from the admin panel',
        path: '/admin/appointments',
        what: 'You can add appointments directly from the admin panel without going through the public booking flow. This is useful when customers call in, walk in and want a future appointment, or when you need to block off a time slot.',
        how: [
          'Tap the + New Appointment button (top right of the page)',
          'A form slides down — fill in the customer\'s full name (required)',
          'Add their email and phone number (optional but useful for follow-up)',
          'Select the service from the grouped dropdown — services are organized by category (Manicures, Pedicures, etc.)',
          'Set the date and time for the appointment',
          'Add any internal notes (allergies, preferences, special instructions)',
          'Tap Add Appointment to save',
          'The form clears automatically so you can add another right away',
          'Tap Cancel to close the form without saving',
        ],
        tips: [
          'The date in the form defaults to today, but you can set it to any future date',
          'If a customer doesn\'t have an email or phone, leave those fields blank — they\'re optional',
          'The appointment will appear on whichever date you set, not necessarily the date you\'re currently viewing',
        ],
      },
      {
        id: 'appt-checkin',
        title: 'Checking In a Customer',
        summary: 'Mark a customer as arrived when they walk through the door',
        path: '/admin/appointments',
        what: 'When a customer arrives for their appointment, you mark them as checked in. This moves them from the Upcoming section to the Checked In section and tracks that they showed up.',
        how: [
          'Find the customer\'s appointment card in the Upcoming section',
          'Tap the Check In button on the right side of their card',
          'The card moves to the Checked In section, shown with a strikethrough and ✓ Done badge',
          'You can also check in customers from the Dashboard without navigating to the Appointments page',
        ],
        tips: [
          'Check-in is currently one-way — there\'s no "undo" button, but the delete option remains available',
          'Checked-in appointments are dimmed at 50% opacity so you can focus on who hasn\'t arrived yet',
          'No-shows can be tracked in the Queue → History tab for past dates',
        ],
      },
      {
        id: 'appt-delete',
        title: 'Deleting an Appointment',
        summary: 'Remove a cancelled or duplicate booking',
        path: '/admin/appointments',
        what: 'If a customer cancels or an appointment was entered by mistake, you can delete it. Deletion is permanent — there is no trash or undo.',
        how: [
          'Find the appointment in the Upcoming section',
          'Tap the Delete button (red text, right side of the card)',
          'The appointment is removed immediately from the list',
        ],
        tips: [
          'Only Upcoming appointments have a Delete button — Checked In appointments can\'t be deleted',
          'There is no confirmation dialog — the deletion happens instantly',
          'If you delete by accident, you\'ll need to re-add the appointment manually',
        ],
      },
    ],
  },

  {
    id: 'customers',
    label: 'Customers',
    icon: '◉',
    items: [
      {
        id: 'cust-search',
        title: 'Searching Customers',
        summary: 'Find any customer by name, email, or phone number',
        path: '/admin/customers',
        what: 'The Customers page is your full phonebook — every person who has ever booked an appointment appears here. The list is sorted alphabetically and shows each customer\'s last service, last visit date, and total number of visits.',
        how: [
          'Go to Admin → Customers',
          'Type in the search box at the top — it filters in real time',
          'Search works on name, email address, and phone number',
          'The count next to the search box shows how many results match',
          'Clear the search box to see all customers again',
        ],
        tips: [
          'Customers only appear here if they provided an email address when booking — phone-only bookings may not show',
          'The visit count is based on all appointments in the system, not just paid ones',
          'The list loads all customers at once — no pagination, so search is the fastest way to find someone',
        ],
      },
      {
        id: 'cust-detail',
        title: 'Viewing Customer Details',
        summary: 'See contact info, visit history, and staff notes for any customer',
        path: '/admin/customers',
        what: 'Tap any customer card to expand their full profile. Inside you\'ll see their contact information with one-tap action buttons, your staff\'s internal notes about them, and their complete visit history.',
        how: [
          'Tap a customer\'s card — it expands with a gold border',
          'Tap again to collapse',
          'The Email button opens your email app with their address pre-filled',
          'The Call button dials their phone number directly (works on mobile/tablet)',
          'The Text button opens a text message to their number',
          'Scroll down within the expanded card to see visit history',
        ],
        tips: [
          'Contact buttons only appear if the customer provided that info when booking',
          'Visit history shows most recent first',
          'Each visit shows the service name, date, time (if recorded), and any notes from their booking',
          'A ✓ next to a visit means the customer checked in for that appointment',
        ],
      },
      {
        id: 'cust-notes',
        title: 'Staff Notes',
        summary: 'Add private internal notes about a customer — they never see these',
        path: '/admin/customers',
        what: 'Staff Notes are internal memos attached to a customer\'s profile. Use them to remember preferences, allergies, past issues, special requests, or anything else your team should know. Customers never see these notes.',
        how: [
          'Expand a customer\'s card',
          'Find the Staff Notes section (above the visit history)',
          'Type your note in the text box',
          'Press Enter or tap the Add button',
          'The note appears immediately with the staff member\'s name and timestamp',
          'To delete a note, tap the ✕ on the right side of the note',
        ],
        tips: [
          'Notes show who added them and when — great for accountability',
          'There\'s no edit button — to correct a note, delete it and add a new one',
          'Notes are visible to all staff with phonebook access, not just admins',
          'Examples: "Prefers no gel topcoat", "Allergic to acrylic powder", "VIP — always greet by name"',
        ],
      },
    ],
  },

  {
    id: 'staff',
    label: 'Staff & Hours',
    icon: '◎',
    items: [
      {
        id: 'staff-hours',
        title: 'Viewing Staff Hours',
        summary: 'See how many hours each employee has worked',
        path: '/admin/staff',
        what: 'The Staff page shows a summary of hours worked for every active employee. You can view by This Week (Sun–Sat), This Month, or Past Year. Each employee row shows their total hours and a count of clock-in entries.',
        how: [
          'Go to Admin → Staff',
          'Use the range buttons at the top to switch between This Week, This Month, or Past Year',
          'Each employee card shows their name, role, and total hours',
          'Tap an employee card to expand it',
          'When expanded on Month or Year view, you\'ll see a Week-by-Week breakdown',
          'Below the breakdown is a detailed log of every individual clock-in and clock-out entry',
          'The Grand Total at the bottom shows combined hours for all employees in the selected range',
        ],
        tips: [
          'This Week always refers to the current Sun–Sat pay week, resetting each Sunday',
          'If an employee forgot to clock out, their entry will show no clock-out time — the auto clock-out at 7 PM handles this',
          'Use Past Year view to see historical patterns by week',
        ],
      },
      {
        id: 'staff-add',
        title: 'Adding a New Employee',
        summary: 'Create a login for a new team member',
        path: '/admin/staff',
        what: 'When you hire someone new, you create their employee profile from this page. They\'ll use their name and PIN to log into the staff portal.',
        how: [
          'Scroll to the bottom of the Staff page',
          'Tap + Add New Employee',
          'Enter their full name exactly as you want it to appear on the login screen',
          'Enter a 4-digit PIN — make sure it\'s something they can remember',
          'Set their Role: Staff (regular employee) or Admin (can access this admin panel)',
          'Tap Create Employee',
          'They can now log in at /employee using their name and PIN',
        ],
        tips: [
          'PINs are stored securely — you can\'t look up an existing PIN, only create a new employee or have them reset it',
          'Only give Admin role to people you trust with full business access',
          'The employee\'s name appears on the login screen list, so use their real first name or the name your customers know them by',
          'New employees won\'t appear on the hours list until they clock in for the first time',
        ],
      },
      {
        id: 'staff-deactivate',
        title: 'Deactivating an Employee',
        summary: 'Remove access for a former employee without deleting their records',
        path: '/admin/staff',
        what: 'When an employee leaves, you deactivate their account. This removes them from the login screen immediately so they can\'t clock in, but preserves all of their historical hours and records.',
        how: [
          'Find the employee on the Staff page',
          'Tap the red Deactivate button on the right side of their card',
          'They\'re removed from the list immediately',
          'Their historical entries are still in the database for records',
        ],
        tips: [
          'Deactivation cannot be undone from the admin panel — contact your developer to reactivate',
          'You cannot deactivate yourself (the currently logged-in admin)',
          'Deactivated employees disappear from the PIN login screen right away',
          'Their clock-in history remains for payroll records even after deactivation',
        ],
      },
    ],
  },

  {
    id: 'queue',
    label: 'Walk-In Queue',
    icon: '◇',
    items: [
      {
        id: 'queue-live',
        title: 'Live Queue',
        summary: 'See who\'s waiting right now and mark them served',
        path: '/admin/queue',
        what: 'The Live Queue tab shows every walk-in customer who checked in at the kiosk and is currently waiting. Each card shows their name, requested service, any notes they entered, how long ago they checked in, and their current wait time.',
        how: [
          'Go to Admin → Queue → Live Queue tab',
          'The queue is numbered — the person at the top has been waiting longest',
          'Each card shows the customer\'s name, service, and wait time',
          'When a technician is ready for them, tap Served ✓ on their card',
          'They\'re removed from the queue immediately',
          'The queue auto-refreshes every 30 seconds — or tap Refresh in the top right to update instantly',
        ],
        tips: [
          'Staff can also mark customers served from the Staff → Check-In page',
          'Walk-in check-in is separate from booked appointments — they use the /checkin kiosk',
          'If the queue shows "All clear", no one is currently waiting',
        ],
      },
      {
        id: 'queue-history',
        title: 'Queue History',
        summary: 'Review past walk-ins, wait times, and no-show appointments',
        path: '/admin/queue',
        what: 'The History tab shows a full record of any past date — all walk-ins who were served, their wait times, and all scheduled appointments for that day with showed-up vs. no-show status.',
        how: [
          'Go to Admin → Queue → History tab',
          'Use the date picker to select any past date (defaults to today)',
          'Tap Today to snap back to today\'s date',
          'Three stat cards appear: total walk-ins served, average wait time, and appointments showed vs. total',
          'Walk-In Check-Ins table: lists every walk-in with arrival time, wait time, service, and which staff member served them',
          'Appointment Records table: lists all scheduled appointments with ✓ Showed or ✕ No-Show status',
        ],
        tips: [
          'No-Show detection is automatic for past dates — any unchecked appointment from a past day is flagged red',
          'Average wait time only appears if there were walk-ins that day',
          '"Kiosk" in the Served By column means the customer was marked served without a staff member selected',
        ],
      },
    ],
  },

  {
    id: 'schedule',
    label: 'Schedule',
    icon: '▤',
    items: [
      {
        id: 'sched-view',
        title: 'Viewing the Weekly Schedule',
        summary: 'See all staff shifts for any week in a 7-day grid',
        path: '/admin/schedule',
        what: 'The Schedule page shows a Monday-through-Sunday calendar grid. Each day column displays all shifts scheduled for that day, with the employee\'s name and their start-to-end time. Today\'s column is highlighted in gold.',
        how: [
          'Go to Admin → Schedule',
          'The current week loads by default',
          'Use the ← and → arrows to move backward and forward by week',
          'Tap This Week to return to the current week',
          'Each shift block shows the employee name and hours',
          'Hover over a shift (or long-press on mobile) to reveal the ✕ delete button',
        ],
        tips: [
          'Schedule weeks run Monday–Sunday (different from the pay week which is Sunday–Saturday)',
          'Shifts don\'t auto-populate — you add them manually when you plan the week',
          'Multiple employees can have shifts on the same day — they stack in the same column',
        ],
      },
      {
        id: 'sched-add',
        title: 'Adding a Shift',
        summary: 'Schedule a staff member for a specific date and time',
        path: '/admin/schedule',
        what: 'You add shifts one at a time. Each shift is tied to a specific employee, date, and start-to-end time.',
        how: [
          'Scroll to the bottom of the Schedule page',
          'Tap + Add Shift',
          'Select the employee from the dropdown (shows all active staff)',
          'Pick the date for the shift',
          'Set the start time and end time',
          'Add optional notes (e.g. "Opening shift", "Short day")',
          'Tap Add Shift',
          'The shift appears on the calendar grid immediately',
        ],
        tips: [
          'You can add shifts for any date — past, present, or future',
          'Start and end time are required — there\'s no all-day option',
          'Notes appear in small text below the time on the shift block',
        ],
      },
      {
        id: 'sched-links',
        title: 'Schedule Share Links',
        summary: 'Send employees a link to view their own schedule',
        path: '/admin/schedule',
        what: 'Each employee has a personal schedule link that shows only their shifts. You can send this link to them so they can check their schedule from their phone without needing to log in.',
        how: [
          'Scroll to the Schedule Links section at the bottom of the page',
          'Find the employee\'s name',
          'Tap Copy next to their name',
          'The link is copied to your clipboard — paste it into a text message or email to send to them',
          'Their link looks like: yoursitename.com/schedule/[their-id]',
        ],
        tips: [
          'The link is public — anyone with the link can view that employee\'s schedule, so don\'t post it publicly',
          'Employees can bookmark their own link for quick access',
          'The link always shows the current week and can be navigated forward/backward',
        ],
      },
    ],
  },

  {
    id: 'specials',
    label: 'Specials',
    icon: '◆',
    items: [
      {
        id: 'spec-add',
        title: 'Adding a Special',
        summary: 'Create a promotion that appears live on your home page',
        path: '/admin/specials',
        what: 'Specials are promotional cards displayed on your public website\'s home page. When you create one here, it appears on the site immediately. You can have multiple active specials at once.',
        how: [
          'Go to Admin → Specials',
          'Tap + Add Special',
          'Fill in Eyebrow — small label above the title (e.g. "Limited Time", "Spring Offer")',
          'Fill in Title — the main headline (e.g. "Spring Refresh Package")',
          'Fill in Description — 1-2 sentences explaining the offer',
          'Fill in Offer Text — the actual deal in plain terms (e.g. "20% off any full set")',
          'Add a Badge — optional corner label (e.g. "New", "Popular", "Expires Soon")',
          'Set Valid Through date — the expiration date (optional)',
          'Tap Add Special',
          'The special appears on your website home page immediately',
        ],
        tips: [
          'You don\'t have to fill in every field — Title, Description, and Offer Text are the required ones',
          'The Offer Text is what shows in the highlighted gold box on the website card',
          'Valid Through is for display only — it doesn\'t auto-deactivate the special on that date',
        ],
      },
      {
        id: 'spec-manage',
        title: 'Editing & Managing Specials',
        summary: 'Update, hide, or remove existing promotions',
        path: '/admin/specials',
        what: 'Once a special is created, you can edit any of its details, temporarily hide it from the website, or delete it permanently.',
        how: [
          'Go to Admin → Specials — your active and inactive specials are all listed',
          'To edit: tap Edit on the special\'s card. A form appears below the card grid — update any field and tap Update Special',
          'To hide temporarily: tap Deactivate. The card goes to 50% opacity. The special disappears from your website but stays in your list',
          'To show again: tap Activate on a deactivated special',
          'To remove permanently: tap Delete on the special\'s card',
        ],
        tips: [
          'Deactivating is safer than deleting — you can bring it back later (e.g. seasonal promotions)',
          'Inactive specials still show in your admin list but are hidden from customers',
          'There\'s no limit to how many specials you can have — but 2–3 is recommended for a clean website look',
        ],
      },
    ],
  },

  {
    id: 'complaints',
    label: 'Complaints',
    icon: '◌',
    items: [
      {
        id: 'comp-view',
        title: 'Viewing Complaints',
        summary: 'See all customer concerns and filter by status',
        path: '/admin/complaints',
        what: 'The Complaints page lists all feedback submitted by customers at /feedback. Each complaint has a unique ticket number (like RNS-K7MX4Q) that was shown to the customer when they submitted. Complaints are categorized as Open, In Progress, or Resolved.',
        how: [
          'Go to Admin → Complaints',
          'Use the filter tabs at the top: All, Open, In Progress, Resolved — each shows a count',
          'Each card shows the ticket number, status badge, customer name, which employee the complaint involves, when it was submitted, and the follow-up due date',
          'Red Overdue badge appears when a follow-up due date has passed',
          'Amber Due Soon badge appears when the due date is within 2 days',
          'Tap any card to expand the full complaint detail',
        ],
        tips: [
          'Start with the Open tab each morning to catch new submissions',
          'The ticket number matches what the customer was shown — they may reference it when calling',
          'Complaints are sorted newest first within each filter',
        ],
      },
      {
        id: 'comp-manage',
        title: 'Managing a Complaint',
        summary: 'Review, respond, set follow-up dates, and resolve complaints',
        path: '/admin/complaints',
        what: 'Each expanded complaint gives you the full picture and all the tools to manage the resolution. You can contact the customer directly, update the status, set a follow-up due date, and add internal notes.',
        how: [
          'Tap a complaint card to expand it',
          'Customer Contact section: tap Email to compose an email to them, tap Call to dial their number',
          'Read the full Complaint text in the highlighted box',
          'Check Visit Details: date, time, which provider, and which service',
          'Change the Status dropdown: Open → In Progress → Resolved',
          'Set a Follow-Up Due Date so you don\'t forget to follow up',
          'Add Internal Notes — your personal record of what steps were taken (customer never sees this)',
          'Tap Save Changes to apply status, due date, and notes together',
          'Or tap Mark Resolved ✓ to close the complaint instantly with one tap',
        ],
        tips: [
          'Setting a due date creates the Overdue/Due Soon alerts on the card — use this to stay accountable',
          'Resolving a complaint logs the exact date and time of resolution',
          'Internal notes are your paper trail — document every call or action you take',
          'If a customer didn\'t provide contact info, check if they left a phone number and call them',
        ],
      },
    ],
  },

  {
    id: 'settings',
    label: 'Settings',
    icon: '◈',
    items: [
      {
        id: 'set-contact',
        title: 'Contact & Location',
        summary: 'Update your phone number, email, and address',
        path: '/admin/settings',
        what: 'The Contact and Location sections let you update the business\'s primary phone number, email address, and physical address. These values are stored in your database.',
        how: [
          'Go to Admin → Settings',
          'Find the Contact section — edit the Phone and Email fields',
          'Find the Location section — edit the Address field',
          'Tap Save under each section after making changes',
          'A "Saved." confirmation appears in gold when successful',
        ],
        tips: [
          'Each section saves independently — you only need to tap Save for the section you changed',
          'Changes are stored in the database but currently display on the admin panel only. Contact your developer to wire these to the public site header/footer',
        ],
      },
      {
        id: 'set-hours',
        title: 'Business Hours',
        summary: 'Update your displayed operating hours',
        path: '/admin/settings',
        what: 'The Hours section stores your operating hours as text strings — one for Mon–Sat and one for the Sunday note.',
        how: [
          'Go to Admin → Settings',
          'Find the Hours section',
          'Edit the Mon–Sat Hours field (e.g. "Monday – Saturday: 10:00 AM – 7:00 PM")',
          'Edit the Sunday Hours / Note field (e.g. "Sunday: By Appointment Only")',
          'Tap Save under the Hours section',
        ],
        tips: [
          'These are free-text fields — write them exactly as you want them to appear',
          'If your hours change seasonally, just update the text and save',
        ],
      },
      {
        id: 'set-social',
        title: 'Social Media Links',
        summary: 'Update your Instagram, Facebook, and Google links',
        path: '/admin/settings',
        what: 'The Social section stores your social media profile URLs. These can be linked from your website footer and contact page.',
        how: [
          'Go to Admin → Settings',
          'Find the Social Links section',
          'Paste your full URL for Instagram, Facebook, and/or Google Business',
          'Tap Save under the Social section',
        ],
        tips: [
          'Use the full URL including https:// (e.g. https://www.instagram.com/royalty_nailsspa)',
          'If you don\'t have a Facebook or Google page, leave those fields as # or blank',
        ],
      },
    ],
  },

  {
    id: 'website',
    label: 'Public Website',
    icon: '◎',
    items: [
      {
        id: 'web-booking',
        title: 'Online Booking (/book)',
        summary: 'How customers book and pay online',
        what: 'Your public booking page at /book walks customers through a multi-step flow: they pick a service, choose a date and time, enter their contact info, and pay via Square. After successful payment, they see a confirmation page with a link to add the appointment to their Google Calendar or iPhone calendar. You receive an email notification for every new booking.',
        tips: [
          'Bookings go directly into your Appointments page in the admin panel',
          'If a customer has trouble booking, they can call in and you can add the appointment manually',
          'The calendar download on the confirmation page creates a reminder for the customer',
          'Payment is processed through Square — funds land in your Square account per your payout schedule',
        ],
      },
      {
        id: 'web-walkin',
        title: 'Walk-In Kiosk (/checkin)',
        summary: 'The tablet check-in screen for walk-in customers',
        what: 'Set up a tablet or iPad at your front desk and open /checkin in the browser. Walk-in customers enter their name, select a service from the dropdown, add optional notes, and tap Check In. They\'re added to the live queue in real time.',
        how: [
          'Open a tablet or iPad and navigate to your website /checkin',
          'Leave it on this page — bookmark it for easy access',
          'Customers self-serve: name → service → tap Check In',
          'They\'re instantly added to the queue visible at Admin → Queue and Staff → Check-In',
          'Staff mark them served when their service is complete',
        ],
        tips: [
          'Consider enabling guided access on the iPad to lock it to just that page',
          'The service list on the kiosk pulls from your full service menu',
          'Customers don\'t need to log in or provide an email for walk-in check-in',
        ],
      },
      {
        id: 'web-feedback',
        title: 'Feedback Form (/feedback)',
        summary: 'Where customers submit concerns and receive a ticket number',
        what: 'The /feedback page is a professional complaint form for customers. After submitting, they receive a unique ticket number (like RNS-K7MX4Q) displayed on screen. Their submission appears in your Admin → Complaints page immediately.',
        tips: [
          'Consider adding a link to /feedback on your receipts or in your confirmation emails',
          'The ticket number allows customers to reference their submission when calling you',
          'You\'ll see a badge count on the Complaints tab when new complaints are unresolved',
        ],
      },
    ],
  },

  {
    id: 'automated',
    label: 'Automated Features',
    icon: '▤',
    items: [
      {
        id: 'auto-reminder',
        title: 'Daily Appointment Reminder',
        summary: 'Email sent to you every day at 1 PM with today\'s bookings',
        what: 'Every day at 1:00 PM, the system automatically sends an email to the business with a list of all appointments scheduled for that day. This includes customer names, services, times, and contact info — so you\'re always prepared for the day ahead without having to check the admin panel.',
        tips: [
          'This runs automatically — no action needed',
          'The email goes to the address configured in your environment settings',
          'If you don\'t receive it, check your spam folder or contact your developer',
          'You can also view today\'s appointments any time in Admin → Appointments',
        ],
      },
      {
        id: 'auto-clockout',
        title: 'Auto Clock-Out at 7 PM',
        summary: 'Staff who forget to clock out are automatically clocked out',
        what: 'Every day at 7:00 PM, the system checks for any employees still clocked in and automatically clocks them out. Their entry is marked with a note: "Auto clock-out at 7:00 PM." This prevents hours from accumulating overnight if someone forgets to clock out at the end of their shift.',
        tips: [
          'This runs automatically — no action needed',
          'Auto clock-out entries are marked in the system so you can identify them in the hours log',
          'If an employee regularly gets auto-clocked out, remind them to clock out manually before leaving',
          '7 PM covers both CDT (summer) and CST (winter) closing times',
        ],
      },
    ],
  },
]

export default function AdminGuidePage() {
  const firstItem = GUIDE[0].items[0]
  const [selected, setSelected] = useState<GuideItem>(firstItem)
  const [openCategory, setOpenCategory] = useState<string>(GUIDE[0].id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold/50 font-sans mb-1">Admin Panel</p>
        <h1 className="font-serif text-3xl text-offwhite">How-To Guide</h1>
        <p className="text-offwhite/30 text-sm font-sans mt-1">Tap any feature on the left to see how it works.</p>
      </div>

      {/* Split screen */}
      <div className="flex gap-0 border border-border/40 rounded-sm overflow-hidden"
           style={{ height: 'calc(100vh - 13rem)', minHeight: '520px' }}>

        {/* ── Left: feature list ── */}
        <div className="w-56 sm:w-64 shrink-0 border-r border-border/40 overflow-y-auto bg-charcoal">
          {GUIDE.map(cat => (
            <div key={cat.id}>
              {/* Category header */}
              <button
                onClick={() => setOpenCategory(openCategory === cat.id ? '' : cat.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 border-b border-border/30 bg-charcoal sticky top-0 z-10 group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gold/40 text-xs leading-none">{cat.icon}</span>
                  <span className="text-[10px] tracking-[0.2em] uppercase font-sans font-medium text-offwhite/50 group-hover:text-offwhite/70 transition-colors duration-150">
                    {cat.label}
                  </span>
                </div>
                <span className={`text-offwhite/20 text-[10px] transition-transform duration-200 ${openCategory === cat.id ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {/* Category items */}
              <AnimatePresence initial={false}>
                {openCategory === cat.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    {cat.items.map(item => {
                      const isActive = selected.id === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelected(item)}
                          className={`w-full text-left px-4 py-3 border-b border-border/20 transition-all duration-150 ${
                            isActive
                              ? 'bg-gold/10 border-l-2 border-l-gold pl-3.5'
                              : 'hover:bg-white/3 border-l-2 border-l-transparent'
                          }`}
                        >
                          <p className={`text-xs font-sans leading-tight ${isActive ? 'text-gold' : 'text-offwhite/70'}`}>
                            {item.title}
                          </p>
                          <p className="text-[10px] font-sans text-offwhite/30 leading-tight mt-0.5 line-clamp-1">
                            {item.summary}
                          </p>
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* ── Right: detail panel ── */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-6 p-6 lg:p-8 h-full"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-serif text-2xl text-offwhite">{selected.title}</h2>
                  <p className="text-sm font-sans text-offwhite/40 mt-1">{selected.summary}</p>
                </div>
                {selected.path && (
                  <a
                    href={selected.path}
                    className="shrink-0 px-4 py-2 border border-gold/30 text-gold text-[10px] tracking-widest uppercase font-sans hover:bg-gold/10 rounded-sm transition-all duration-150"
                  >
                    Open →
                  </a>
                )}
              </div>

              <div className="h-px bg-gradient-to-r from-gold/20 via-gold/10 to-transparent" />

              {/* What it does */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">What it does</p>
                <p className="text-sm font-sans text-offwhite/70 leading-relaxed whitespace-pre-line">
                  {selected.what}
                </p>
              </div>

              {/* How to use */}
              {selected.how && selected.how.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">How to use</p>
                  <div className="flex flex-col gap-2">
                    {selected.how.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="shrink-0 w-5 h-5 rounded-full border border-gold/30 flex items-center justify-center mt-0.5">
                          <span className="font-serif text-[10px] text-gold/70">{i + 1}</span>
                        </span>
                        <p className="text-sm font-sans text-offwhite/65 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {selected.tips && selected.tips.length > 0 && (
                <div className="flex flex-col gap-3 mt-auto pt-4">
                  <div className="h-px bg-border/30" />
                  <p className="text-[10px] tracking-[0.25em] uppercase text-gold/50 font-sans">Tips & notes</p>
                  <div className="flex flex-col gap-2">
                    {selected.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="shrink-0 text-gold/40 text-xs mt-0.5">◆</span>
                        <p className="text-xs font-sans text-offwhite/50 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
