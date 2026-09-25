export default function LandlordSettingsPage() {
    return <DashboardSection title="Settings" description="Manage your landlord profile, preferences, and dashboard configuration." />;
}

function DashboardSection({ title, description }: { title: string; description: string }) {
    return <main className="mx-auto max-w-7xl px-5 py-12 md:px-12"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#a97e4b]">Landlord dashboard</p><h1 className="mt-2 font-playfair text-5xl font-bold">{title}</h1><p className="mt-4 max-w-xl text-[#5d6876]">{description}</p><section className="mt-8 rounded-xl bg-white p-8 shadow-sm"><p className="font-bold text-[#5d6876]">This workspace is ready for your {title.toLowerCase()}.</p></section></main>;
}
