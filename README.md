# Property Warehouse — Frontend (Next.js)

The Next.js rebuild of the Property Warehouse site, agreed in the 15 Sep 2026 meeting:
frontend in Next.js deployed on Vercel, backend hosted in the cloud (Render + Supabase).

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Environment variables

Set these in `.env.local` locally, and in **Vercel → Project → Settings → Environment Variables** for production.

| Variable | Purpose |
|---|---|
| `API_PROXY_TARGET` | Backend URL. `proxy.ts` forwards every `/api/*` request to it, so the browser never makes cross-origin calls. Defaults to the Render backend. |
| `NEXT_PUBLIC_PW_WHATSAPP_NUMBER` | **Required before launch.** The team's WhatsApp business number (digits only, e.g. `2348012345678`). Every enquiry button on the site opens a chat with this number. |

## Product decisions reflected in the code

- **One enquiry channel: WhatsApp to the team** (MoM 15 Sep 2026, Item 4). Enquiry buttons never link to a
  landlord's own number; they go to the team, with the listing reference in the message. See `app/lib/contact.ts`.
- **Heat map is "coming soon"** (MoM 15 Sep 2026, Item 1). `/heatmap` is a placeholder until real search and
  enquiry data exist.
- **Open access, no premium tier at launch** (MoM 15 Sep 2026, Item 2). There are no upgrade or paywall prompts.
- **No fabricated data** (MoM 31 Jul 2026, issue #2). Dashboards and marketing pages show only real data from
  the API, or an honest empty or "coming soon" state.
- **Fees:** the copy avoids promising "zero fees" because of the agreed agent fee on successful rentals. The final
  public wording of that fee is still for the committee to decide.

`legacy-source/` holds the previous vanilla HTML/CSS/JS site for reference only. It is not served.
