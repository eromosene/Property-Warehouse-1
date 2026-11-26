/* Single enquiry channel (MoM 15 Sep 2026, Item 4): every WhatsApp enquiry goes to the
   Property Warehouse team's business number — where the bot answers general questions and
   hands over to a human — never straight to a landlord. Routing through the team keeps every
   enquiry on record and lets the platform track transactions it facilitates.

   Set NEXT_PUBLIC_PW_WHATSAPP_NUMBER (international format, digits only, e.g. 2348012345678)
   in .env.local locally and in the Vercel project settings for production. */
export const TEAM_WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_PW_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

if (!TEAM_WHATSAPP_NUMBER && typeof window !== "undefined") {
    console.warn("NEXT_PUBLIC_PW_WHATSAPP_NUMBER is not set — WhatsApp enquiry links will not reach the team.");
}

type ListingRef = { id: string; title: string; area?: string; address?: string };

/* Builds a wa.me link to the team. When a listing is given, its reference and title are put
   at the top of the message so the team can tell which property the enquiry is about. */
export function teamWhatsAppHref(listing?: ListingRef, extra?: string): string {
    const lines: string[] = [];
    if (listing) {
        lines.push(`Hello Property Warehouse, I'm interested in "${listing.title}"${listing.area ? ` in ${listing.area}` : ""}.`);
        lines.push(`Listing ref: ${listing.id}`);
    } else {
        lines.push("Hello Property Warehouse, I have an enquiry.");
    }
    if (extra && extra.trim()) lines.push("", extra.trim());
    return `https://wa.me/${TEAM_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}
