import { useEffect, useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
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
    currency: string;
};

type FilterParams = {
    start_date?: string;
    end_date?: string;
    min_amount_out?: string;
    max_amount_out?: string;
};

const Dashboard = ()=> {

    const [summary, setSummary] = useState<SummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    // Filter params - initialize with current month
    const [filterParams, setFilterParams] = useState<FilterParams>(() => getCurrentMonthRange());
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

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                // Only include non-empty filter params
                const params = new URLSearchParams();
                Object.entries(filterParams).forEach(([key, value]) => {
                    if (value) {
                        params.append(key, value);
                    }
                });
                
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

        fetchSummary();
    }, [filterParams, accessToken]);

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

    const handleApplyFilters = () => {
        setFilterParams(localFilters);
        setIsFilterOpen(false);
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

                            {/* Amount Range */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Amount Range (CAD)</label>
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Min Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">CAD</span>
                                            <input
                                                type="text"
                                                value={localFilters.min_amount_out || ""}
                                                onChange={(e) => handleAmountInputChange("min_amount_out", e.target.value)}
                                                placeholder="0"
                                                className="w-full rounded-lg border border-gray-300 pl-14 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Max Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">CAD</span>
                                            <input
                                                type="text"
                                                value={localFilters.max_amount_out || ""}
                                                onChange={(e) => handleAmountInputChange("max_amount_out", e.target.value)}
                                                placeholder="0"
                                                className="w-full rounded-lg border border-gray-300 pl-14 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

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
            <div className="container max-w-3xl pb-10 mx-auto">
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
                        {/* Total Expenses */}
                        <div className="flex my-10">
                            <div className="bg-white border border-gray-200 rounded-xl py-6 shadow-sm w-full max-w-xs">
                                <p className="text-sm font-medium text-gray-500 mb-2">Total Expenses</p>
                                <p className="text-2xl font-bold text-red-600 mb-1">
                                    {summary.expenses.total.toLocaleString("en-CA", {
                                        style: "currency",
                                        currency: summary.currency,
                                    })}
                                </p>
                                <p className="text-sm text-gray-400">↓ x.x% from last month</p>
                            </div>
                        </div>

                        {/* Expense Categories Pie Chart */}
                        <ExpenseCategoriesChart
                            categories={summary.expenses.categories}
                        />
                    </>
                )}
            </div>
        </>
    );
}

export default Dashboard;