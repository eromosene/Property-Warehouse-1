import { DashboardCard, DashboardPage } from "../../components/dashboard-page";

/* Payment tracking (MoM 31 Jul 2026, item 19) has no backend yet — this replaces three
   invented "Paid" rent records with an honest placeholder. */
export default function PaymentsPage() {
    return (
        <DashboardPage eyebrow="Finance" title="Payments">
            <DashboardCard>
                Rent payment tracking and reminders are coming soon. Once available, you will see your payment
                history and upcoming due dates here.
            </DashboardCard>
        </DashboardPage>
    );
}
