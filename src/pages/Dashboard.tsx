import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCurrency } from "../context/CurrencyContext";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import ExpenseCategoriesChart from "../components/ExpenseCategoriesChart";
import { getCurrentMonthRange } from "../utils/date";

type Category = {
    id: number;
    category: string;
    amount: number;
    percentage: number;
};

type SummaryResponse = {
    expenses: {
        total: number;
        categories: Category[];
    };
    display_currency: string;
};


type FilterParams = {
    start_date?: string;
    end_date?: string;
    category_id?: string;
    min_amount_out?: string;
    max_amount_out?: string;
};

const DASHBOARD_FILTERS_STORAGE_KEY = "mf_dashboard_filters";

const isValidFilterParams = (v: unknown): v is FilterParams => {
    if (!v || typeof v !== "object") return false;
    const obj = v as Record<string, unknown>;
    const isStrOrUndef = (x: unknown) => x === undefined || typeof x === "string";
    return (
        isStrOrUndef(obj.start_date) &&
        isStrOrUndef(obj.end_date) &&
        isStrOrUndef(obj.min_amount_out) &&
        isStrOrUndef(obj.max_amount_out)
    );
};

type Transaction = {
    id: number;
    user_id: string;
    tx_date: string;
    description: string;
    category_id: number;
    category_name: string;
    amount: string; // original amount (minor units) in transaction currency
    converted_amount: number; // converted amount (minor units) in display_currency
    statement_id: number;
    status: number;
    created_at: string;
    updated_at: string;
};

type TransactionsResponse = {
    items: Transaction[];
    total: number;
    page: number;
    page_size: number;
};

const Dashboard = ()=> {
    const { currency: displayCurrency } = useCurrency();
    const [summary, setSummary] = useState<SummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    // Filter params - initialize with current month or restore from localStorage
    const [filterParams, setFilterParams] = useState<FilterParams>(() => {
        try {
            const raw = localStorage.getItem(DASHBOARD_FILTERS_STORAGE_KEY);
            if (!raw) return getCurrentMonthRange();
            const parsed = JSON.parse(raw);
            if (isValidFilterParams(parsed)) return parsed;
            return getCurrentMonthRange();
        } catch {
            return getCurrentMonthRange();
        }
    });
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(() => {
        const s = filterParams.start_date;
        return s ? parseInt(s.slice(0, 4)) : new Date().getFullYear();
    });
    const monthPickerRef = useRef<HTMLDivElement>(null);
    // Transaction state
    const [transactions, setTransactions] = useState<TransactionsResponse | null>(null);

    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { accessToken } = useAuth();

    const minorToMajor = (minor: number) => minor / 100;

    const formatMoneyFromMinor = (minor: number) =>
        minorToMajor(minor).toLocaleString("en-CA", {
            style: "currency",
            currency: displayCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                // Only include non-empty date filter params (amount filters disabled for now)
                const params = new URLSearchParams();
                if (filterParams.start_date) params.append("start_date", filterParams.start_date);
                if (filterParams.end_date) params.append("end_date", filterParams.end_date);
                params.append("display_currency", displayCurrency);
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/summary?${params.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                    }
                );
                const data: SummaryResponse = await res.json();
                setSummary(data);
            } catch (e) {
                console.error("Failed to load summary", e);
            } finally {
                setLoading(false);
            }
        };

        if (accessToken) {
            fetchSummary();
        }
    }, [filterParams, accessToken, displayCurrency]);

    // Fetch transactions
    useEffect(() => {
        const fetchTransactions = async () => {
            setTransactionsLoading(true);
            try {
                const params = new URLSearchParams();
                // Add filter params
                if (filterParams.start_date) {
                    params.append("start_date", filterParams.start_date);
                }
                if (filterParams.end_date) {
                    params.append("end_date", filterParams.end_date);
                }
                // Add category filter
                if (selectedCategoryId) {
                    params.append("category_id", selectedCategoryId);
                }
                // Add pagination params
                params.append("page", currentPage.toString());
                params.append("page_size", pageSize.toString());
                params.append("display_currency", displayCurrency);
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/transactions?${params.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                    }
                );
                const data: TransactionsResponse = await res.json();
                setTransactions(data);
            } catch (e) {
                console.error("Failed to load transactions", e);
            } finally {
                setTransactionsLoading(false);
            }
        };

        if (accessToken) {
            fetchTransactions();
        }
    }, [filterParams, selectedCategoryId, currentPage, pageSize, accessToken, displayCurrency]);

    useEffect(() => {
        if (!isMonthPickerOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(e.target as Node)) {
                setIsMonthPickerOpen(false);
            }
        };
        setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMonthPickerOpen]);

    // Persist applied filters so refresh keeps the current selection
    useEffect(() => {
        try {
            localStorage.setItem(
                DASHBOARD_FILTERS_STORAGE_KEY,
                JSON.stringify(filterParams)
            );
        } catch {
            // ignore
        }
    }, [filterParams]);

    if (loading) {
        return <div className="p-10">Loading dashboard...</div>;
    }

    if (!summary?.expenses) {
        return <div className="p-10 text-gray-400">No expense data</div>;
    }

    // Check if there are no records (total is 0 or categories are empty)
    const hasNoRecords = summary.expenses.total === 0 || 
                        (summary.expenses.categories && summary.expenses.categories.length === 0);

    return (
        <>
            <div className="container max-w-5xl pb-10 mx-auto">
                {/* Title & Filtering */}
                <div className="flex my-10 justify-between items-center">
                    {/* Overview */}
                    <div className="flex flex-col items-start">
                        <h2 className="font-display text-2xl font-semibold">Overview</h2>
                        <p className="text-sm font-medium text-[#717182]">
                            {filterParams.start_date
                                ? new Date(filterParams.start_date + "T00:00:00").toLocaleDateString("en-CA", { year: "numeric", month: "long" })
                                : new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long" })}
                        </p>
                    </div>
                    {/* Month picker */}
                    <div className="relative" ref={monthPickerRef}>
                        <button
                            type="button"
                            onClick={() => {
                                const y = filterParams.start_date ? parseInt(filterParams.start_date.slice(0, 4)) : new Date().getFullYear();
                                setPickerYear(y);
                                setIsMonthPickerOpen((o) => !o);
                            }}
                            className="h-9 flex items-center !rounded-full border border-border bg-surface pl-5 pr-7 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:border-border-2 focus:outline-none focus:ring-2 focus:ring-accent-soft transition-all cursor-pointer"
                        >
                            {filterParams.start_date
                                ? new Date(filterParams.start_date + "T00:00:00").toLocaleDateString("en-CA", { year: "numeric", month: "short" })
                                : new Date().toLocaleDateString("en-CA", { year: "numeric", month: "short" })}
                        </button>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-2">
                            <ChevronDown className="h-3.5 w-3.5" />
                        </span>

                        {isMonthPickerOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-2xl shadow-lg z-20 p-3">
                                {/* Year nav */}
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <button
                                        type="button"
                                        onClick={() => setPickerYear((y) => y - 1)}
                                        className="p-1 rounded-md hover:bg-surface-2 text-ink-2 transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm font-semibold text-ink">{pickerYear}</span>
                                    <button
                                        type="button"
                                        onClick={() => setPickerYear((y) => y + 1)}
                                        className="p-1 rounded-md hover:bg-surface-2 text-ink-2 transition-colors"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                                {/* Month grid */}
                                <div className="grid grid-cols-3 gap-1">
                                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((name, i) => {
                                        const ym = `${pickerYear}-${String(i + 1).padStart(2, "0")}`;
                                        const isSelected = ym === filterParams.start_date?.slice(0, 7);
                                        return (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => {
                                                    const start = new Date(pickerYear, i, 1);
                                                    const end = new Date(pickerYear, i + 1, 0);
                                                    const fmt = (d: Date) => d.toISOString().split("T")[0];
                                                    setFilterParams({ start_date: fmt(start), end_date: fmt(end) });
                                                    setSelectedCategoryId("");
                                                    setCurrentPage(1);
                                                    setIsMonthPickerOpen(false);
                                                }}
                                                className={`rounded-lg py-1.5 text-sm font-medium transition-colors ${
                                                    isSelected
                                                        ? "bg-accent text-white"
                                                        : "text-ink-2 hover:bg-surface-2"
                                                }`}
                                            >
                                                {name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {hasNoRecords ? (
                    /* No records message */
                    <div className="flex items-center justify-center py-20">
                        <p className="text-gray-500 text-lg">No records found matching your filters 🔍</p>
                    </div>
                ) : (
                    <>
                        {/* Total Expenses + Expense Categories */}
                        <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
                            <div className="mf-card p-7">
                                <p className="mf-card-title mb-3">You've Spent</p>
                                <p className="font-display text-[44px] font-bold tracking-tight text-ink leading-tight">
                                    {formatMoneyFromMinor(summary.expenses.total)}
                                </p>
                            </div>

                            {/* Expense Categories Pie Chart */}
                            <div className="min-w-0">
                                <ExpenseCategoriesChart 
                                    categories={summary.expenses.categories}
                                    currency={displayCurrency}
                                />
                            </div>
                        </div>

                        
                    </>
                )}

                {/* Transactions */}
                <div className="mt-10">
                    {/* <h2 className="text-2xl font-semibold mb-4">Transactions</h2> */}
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-2xl font-semibold">Transactions</h2>
                    </div>
                    
                    {/* Page size selector */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Show</label>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1); // Reset to first page when changing page size
                                }}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-sm text-gray-600">per page</span>
                        </div>
                        <div className="relative flex items-center gap-2">
                            <select
                                value={selectedCategoryId}
                                onChange={(e) => {
                                    setSelectedCategoryId(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="
                                    h-9 rounded-full border border-border bg-surface
                                    px-3 pr-7 text-sm font-medium text-ink-2 text-center
                                    hover:bg-surface-2 hover:border-border-2
                                    focus:outline-none focus:ring-2 focus:ring-accent-soft focus:border-accent
                                    appearance-none transition-all cursor-pointer
                                "
                            >
                                <option value="">All Categories</option>
                                {summary.expenses.categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.category}
                                    </option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-2">
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    {transactionsLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <p className="text-gray-500">Loading transactions...</p>
                        </div>
                    ) : transactions && transactions.items.length > 0 ? (
                        <>
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transactions.items.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-left whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(transaction.tx_date).toLocaleDateString("en-CA")}
                                                </td>
                                                <td className="px-4 py-3 text-left whitespace-nowrap text-sm text-gray-900">
                                                    {transaction.category_name}
                                                </td>
                                                <td className="px-4 py-3 text-left text-sm text-gray-900">
                                                    {transaction.description}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold">
                                                    {formatMoneyFromMinor(transaction.converted_amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {transactions.total > 0 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, transactions.total)} of {transactions.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                            disabled={currentPage * pageSize >= transactions.total}
                                            className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg py-10">
                            <p className="text-center text-gray-500">No transactions found</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Dashboard;