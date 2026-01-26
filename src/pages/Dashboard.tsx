import { useEffect, useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCurrency } from "../context/CurrencyContext";
import { Calendar, Filter, Check } from "lucide-react";
import ExpenseCategoriesChart from "../components/ExpenseCategoriesChart";
import { getCurrentMonthRange } from "../utils/date";

type Category = {
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
    // Transactions state
    const [transactions, setTransactions] = useState<TransactionsResponse | null>(null);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    // Local filter form state
    const [localFilters, setLocalFilters] = useState<FilterParams>({
        start_date: "",
        end_date: "",
        min_amount_out: "",
        max_amount_out: "",
    });
    const filterPanelRef = useRef<HTMLDivElement>(null);

    const { accessToken } = useAuth();
    // Overview: Month
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
    });

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
                    `http://localhost:8000/summary?${params.toString()}`,
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
                // Amount range filters disabled for now
                // if (filterParams.min_amount_out) {
                //     params.append("min_amount_out", filterParams.min_amount_out);
                // }
                // if (filterParams.max_amount_out) {
                //     params.append("max_amount_out", filterParams.max_amount_out);
                // }
                // Add pagination params
                params.append("page", currentPage.toString());
                params.append("page_size", pageSize.toString());
                params.append("display_currency", displayCurrency);
                const res = await fetch(
                    `http://localhost:8000/transactions?${params.toString()}`,
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
    }, [filterParams, currentPage, pageSize, accessToken, displayCurrency]);

    // Sync local filters with filter params when opening the panel
    useEffect(() => {
        if (isFilterOpen) {
            setLocalFilters({
                start_date: filterParams.start_date || "",
                end_date: filterParams.end_date || "",
                min_amount_out: filterParams.min_amount_out || "",
                max_amount_out: filterParams.max_amount_out || "",
            });
        }
    }, [isFilterOpen]);

    // Close filter panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                filterPanelRef.current &&
                !filterPanelRef.current.contains(event.target as Node) &&
                isFilterOpen
            ) {
                setIsFilterOpen(false);
            }
        };

        if (isFilterOpen) {
            // Use setTimeout to avoid closing immediately when clicking the button
            setTimeout(() => {
                document.addEventListener("mousedown", handleClickOutside);
            }, 0);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isFilterOpen]);

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

    const handleApplyFilters = () => {
        setFilterParams({
            start_date: localFilters.start_date,
            end_date: localFilters.end_date,
            // min_amount_out and max_amount_out disabled for now
        });
        setIsFilterOpen(false);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleClearFilters = () => {
        // Clear filters in panel only (don't apply yet)
        const currentMonthRange = getCurrentMonthRange();
        setLocalFilters(currentMonthRange);
        // Keep panel open - only close on Apply
        // filterParams will be updated when Apply is clicked
    };

    const handleAmountInputChange = (field: "min_amount_out" | "max_amount_out", value: string) => {
        // Only allow integers (remove non-digit characters)
        const intValue = value.replace(/\D/g, "");
        setLocalFilters((prev) => ({
            ...prev,
            [field]: intValue,
        }));
    };

    if (loading) {
        return <div className="p-10">Loading dashboard...</div>;
    }

    if (!summary?.expenses) {
        return <div className="p-10 text-gray-400">No expense data</div>;
    }

    // Check if there are no records (total is 0 or categories are empty)
    const hasNoRecords = summary.expenses.total === 0 || 
                        (summary.expenses.categories && summary.expenses.categories.length === 0);

    // Check if custom filters are applied (not default This Month)
    const hasCustomFilters = () => {
        const currentMonthRange = getCurrentMonthRange();
        const hasAmountFilters = !!filterParams.min_amount_out || !!filterParams.max_amount_out;
        const hasCustomDateRange = filterParams.start_date !== currentMonthRange.start_date || 
                                   filterParams.end_date !== currentMonthRange.end_date;
        return hasAmountFilters || hasCustomDateRange;
    };

    const isFilterActive = hasCustomFilters();
    const isThisMonthActive = !isFilterActive;

    // Render filter buttons section (reused in both cases)
    const renderFilterSection = () => (
        <div className="flex flex-wrap gap-2 relative">
            <button
                type="button"
                className={`inline-flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors ${
                    isThisMonthActive
                        ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100 font-semibold"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-label="Select month"
                onClick={() => {
                    const range = getCurrentMonthRange();
                    setFilterParams(range);
                    setLocalFilters((prev) => ({
                        ...prev,
                        ...range,
                    }));
                    setCurrentPage(1); // Reset to first page when changing filters
                }}
            >
                <Calendar className="h-4 w-4" />
                <span>This Month</span>
                {isThisMonthActive && <Check className="h-4 w-4" />}
            </button>

            <div className="relative inline-flex" ref={filterPanelRef}>
                <button
                    type="button"
                    className={`inline-flex items-center gap-2 rounded-lg border text-sm font-medium transition-colors ${
                        isFilterActive
                            ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100 font-semibold"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-label="Open filters"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    {isFilterActive && <Check className="h-4 w-4" />}
                </button>

                {/* Filter Panel */}
                {isFilterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Filters</h3>
                            
                            {/* Date Range */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Date Range</label>
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={localFilters.start_date || ""}
                                            onChange={(e) =>
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    start_date: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={localFilters.end_date || ""}
                                            onChange={(e) =>
                                                setLocalFilters((prev) => ({
                                                    ...prev,
                                                    end_date: e.target.value,
                                                }))
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Amount Range (disabled for now)
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Amount Range ({displayCurrency})
                                </label>
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Min Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                                                {displayCurrency}
                                            </span>
                                            <input
                                                type="text"
                                                value={localFilters.min_amount_out || ""}
                                                onChange={(e) =>
                                                    handleAmountInputChange("min_amount_out", e.target.value)
                                                }
                                                placeholder="0"
                                                className="w-full rounded-lg border border-gray-300 pl-14 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Max Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                                                {displayCurrency}
                                            </span>
                                            <input
                                                type="text"
                                                value={localFilters.max_amount_out || ""}
                                                onChange={(e) =>
                                                    handleAmountInputChange("max_amount_out", e.target.value)
                                                }
                                                placeholder="0"
                                                className="w-full rounded-lg border border-gray-300 pl-14 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            */}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApplyFilters}
                                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            <div className="container max-w-5xl pb-10 mx-auto">
                {/* Title & Filtering */}
                <div className="flex my-10 justify-between">
                    {/* Overview */}
                    <div className="flex flex-col items-start">
                        <h2 className="text-2xl font-semibold">Overview</h2>
                        <p className="text-sm font-medium text-[#717182]">{formattedDate}</p>
                    </div>
                    {/* Filtering */}
                    {renderFilterSection()}
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
                            {/* Total Expenses */}
                            <div className="bg-white border border-gray-200 rounded-xl py-6 shadow-sm w-full md:w-[260px] md:shrink-0">
                                <p className="text-sm font-medium text-gray-500 mb-2">Total Expenses</p>
                                <p className="text-2xl font-bold text-red-600 mb-1">
                                    {formatMoneyFromMinor(summary.expenses.total)}
                                </p>
                                {/* <p className="text-sm text-gray-400">↓ x.x% from last month</p> */}
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
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-red-600">
                                                    {formatMoneyFromMinor(transaction.converted_amount)}
                                                    {/* {parseFloat(transaction.amount).toLocaleString("en-CA", {
                                                        style: "currency",
                                                        currency: summary?.currency || "CAD",
                                                    })} */}
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