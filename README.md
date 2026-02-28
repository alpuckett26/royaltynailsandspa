# Royalty Nails & Spa — v2 Website

A luxury, premium redesign of the Royalty Nails & Spa website, built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Fonts | Cormorant Garamond (serif) + Manrope (sans) via `next/font` |

## Design System

- **Background**: Deep charcoal `#0B0F14`
- **Text**: Warm off-white `#F7F3EE`
- **Accent**: Muted gold `#C6A15B` (used sparingly)
- **Borders**: Subtle dark gray `#1E2530`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (fonts, metadata, header/footer)
│   ├── globals.css         # Global styles + CSS variables
│   ├── page.tsx            # Home page (/)
│   ├── packages/page.tsx   # Packages & Pricing (/packages)
│   ├── about/page.tsx      # About (/about)
│   └── contact/page.tsx    # Contact (/contact)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx      # Sticky navigation header
│   │   └── Footer.tsx      # Site footer
│   ├── home/
│   │   ├── Hero.tsx        # Full-viewport hero section
│   │   ├── TrustStrip.tsx  # Trust cues bar
│   │   ├── SignatureOfferings.tsx  # 4 service category cards
│   │   ├── PricingPreview.tsx      # Featured pricing cards
│   │   ├── HowItWorks.tsx  # 3-step process
│   │   ├── Testimonials.tsx # Client reviews
│   │   ├── FAQ.tsx         # Accordion FAQ (8 Q&As)
│   │   └── CTABand.tsx     # Final CTA section
│   ├── packages/
│   │   ├── PackageCard.tsx  # Individual package card
│   │   ├── ComparisonGrid.tsx # Feature comparison table
│   │   └── AddOns.tsx      # Add-on services grid
│   ├── about/
│   │   ├── BrandStory.tsx  # Brand story + stats
│   │   └── Values.tsx      # Brand values + approach
│   ├── contact/
│   │   ├── ContactForm.tsx # Contact form (mailto fallback)
│   │   └── BookingCTA.tsx  # Phone booking + walk-in info
│   └── ui/
│       ├── Button.tsx       # Reusable button (primary/secondary/ghost/gold-outline)
│       ├── SectionHeader.tsx # Eyebrow + title + description
│       └── AnimatedSection.tsx # Framer Motion wrappers
│
└── lib/
    └── content.ts          # ⭐ ALL content data (services, prices, FAQs, etc.)
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Install

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Content Management

All content is centralized in **`src/lib/content.ts`**:

```ts
// Update business info
export const businessInfo = { ... }

// Update service packages (names/prices mirror the live site)
export const serviceCategories = [ ... ]

// Update add-ons, testimonials, FAQs, etc.
export const addOns = [ ... ]
export const testimonials = [ ... ]
export const faqs = [ ... ]
```

To update any package name, price, or description — **only edit `content.ts`**. Both the Home page and Packages page are wired to this single source of truth.

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, trust strip, offerings, pricing preview, how it works, testimonials, FAQ, CTA |
| `/packages` | Full package listing, comparison grid, add-ons, CTA |
| `/about` | Brand story, values, testimonials, CTA |
| `/contact` | Contact form, phone booking, walk-in info, FAQ |

## Contact Form

The contact form uses a **mailto: fallback** — clicking "Send Message" opens the user's default email client pre-populated with their form data. To integrate a backend (e.g., Resend, SendGrid, or a custom API route), replace the `handleSubmit` function in `src/components/contact/ContactForm.tsx`.

## Deployment

Deploy to [Vercel](https://vercel.com) in one click:

1. Push this repo to GitHub
2. Import the repo in Vercel
3. Set framework preset to **Next.js**
4. Deploy — no environment variables needed

Or deploy to any Node.js-compatible host:

```bash
npm run build
npm start
```

---

*Source content mirrored from the live Royalty Nails & Spa website. Package names and prices are used exactly as listed on the original site.*
