import { DashboardCard, DashboardPage } from "../../components/dashboard-page";

/* There is no review system yet; the previous page showed a made-up "4.8 / 5 from 32 reviews". */
export default function ReviewsPage() {
    return (
        <DashboardPage eyebrow="Landlord dashboard" title="Reviews">
            <DashboardCard>
                Tenant reviews are coming soon. Once tenants can review their rental experience, your rating will
                appear here.
            </DashboardCard>
        </DashboardPage>
    );
}
