export type Listing = {
    id: string;
    title: string;
    area: string;
    lga: string;
    address: string;
    type: string;
    rentPerYear: number;
    totalMoveIn: number;
    cautionFee: number;
    serviceCharge: number;
    beds: number;
    baths: number;
    amenities: string[];
    description: string;
    images: string[];
    views: number;
    isVerified: boolean;
    isMonthly: boolean;
    landlordName: string;
    landlordPhone: string;
    landlordWhatsApp: string;
    createdAt?: string;
};

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://property-warehouse-1.onrender.com";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("pw_token") : null;
    const response = await fetch(`${API_BASE}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init?.headers ?? {}) } });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error ?? "Request failed");
    return data as T;
}

export const naira = (value: number) => `₦${Number(value).toLocaleString("en-NG")}`;
