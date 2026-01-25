"use client";

import { useState, useMemo } from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerCard } from "./customer-card";
import { cn } from "@/lib/utils";

type Customer = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    status: "active" | "lead" | "passive";
    image_url: string | null;
    created_at: string;
};

type CustomerListClientProps = {
    customers: Customer[];
};

export function CustomerListClient({ customers }: CustomerListClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Filter customers based on search query
    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) return customers;

        const query = searchQuery.toLowerCase();
        return customers.filter(
            (customer) =>
                customer.name?.toLowerCase().includes(query) ||
                customer.email?.toLowerCase().includes(query) ||
                customer.phone?.toLowerCase().includes(query) ||
                customer.company?.toLowerCase().includes(query)
        );
    }, [customers, searchQuery]);

    return (
        <div className="space-y-4">
            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Müşteri ara (isim, email, telefon, şirket)..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-1 border rounded-lg p-1">
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="gap-2"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        <span className="hidden sm:inline">Kart</span>
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="gap-2"
                    >
                        <List className="h-4 w-4" />
                        <span className="hidden sm:inline">Liste</span>
                    </Button>
                </div>
            </div>

            {/* Results count */}
            {searchQuery && (
                <p className="text-sm text-muted-foreground">
                    {filteredCustomers.length} sonuç bulundu
                </p>
            )}

            {/* Customer List/Grid */}
            {filteredCustomers.length === 0 ? (
                <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                    <p>
                        {searchQuery
                            ? "Arama kriterlerine uygun müşteri bulunamadı."
                            : "Henüz müşteri eklenmemiş."}
                    </p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCustomers.map((customer) => (
                        <CustomerCard key={customer.id} customer={customer} />
                    ))}
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">İsim</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">
                                        Şirket
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">
                                        Telefon
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredCustomers.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => (window.location.href = `/customers/${customer.id}`)}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium">{customer.name}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                                            {customer.company || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                                            {customer.email || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                                            {customer.phone || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                                    customer.status === "active"
                                                        ? "bg-green-500/10 text-green-500"
                                                        : customer.status === "passive"
                                                            ? "bg-gray-500/10 text-gray-500"
                                                            : "bg-blue-500/10 text-blue-500"
                                                )}
                                            >
                                                {customer.status === "active"
                                                    ? "Aktif"
                                                    : customer.status === "passive"
                                                        ? "Pasif"
                                                        : "Potansiyel"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
