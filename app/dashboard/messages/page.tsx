import { teamWhatsAppHref } from "../../lib/contact";
import { DashboardCard, DashboardPage } from "../../components/dashboard-page";

/* WhatsApp is the single messaging channel at launch (MoM 15 Sep 2026, Item 4), so there is
   no in-site inbox. This page points people to it instead of showing sample conversations. */
export default function MessagesPage() {
    return (
        <DashboardPage eyebrow="Communication" title="Messages">
            <DashboardCard>
                <p>
                    All conversations happen on WhatsApp with the Property Warehouse team. Our assistant answers
                    general questions instantly, and a member of the team takes over for anything else.
                </p>
                <a
                    href={teamWhatsAppHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex rounded-lg bg-[#25D366] px-4 py-2 text-[12px] font-extrabold text-white"
                >
                    Open WhatsApp chat
                </a>
            </DashboardCard>
        </DashboardPage>
    );
}
