import { Calendar, Filter } from "lucide-react";
import ExpenseCategoriesChart from "../components/ExpenseCategoriesChart";

const Dashboard = ()=> {
    return (
        <>
            <div className="container max-w-3xl pb-10 mx-auto">
                {/* Title & Filtering */}
                <div className="flex my-10 justify-between">
                    {/* Overview */}
                    <div className="flex flex-col items-start">
                        <h2 className="text-2xl font-semibold">Overview</h2>
                        <p className="text-sm font-medium text-[#717182]">November 2024 Lalalalala!!!</p>
                    </div>
                    {/* Filtering */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            aria-label="Select month"
                            onClick={() => {/* TODO */}}
                        >
                            <Calendar className="h-4 w-4" />
                            <span>This Month</span>
                        </button>

                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            aria-label="Open filters"
                            onClick={() => {/* TODO */}}
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filter</span>
                        </button>

                        {/*<button*/}
                        {/*    type="button"*/}
                        {/*    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"*/}
                        {/*    aria-label="Export"*/}
                        {/*    onClick={() => /!* TODO: Trigger export modal*!/}*/}
                        {/*>*/}
                        {/*    <Download className="h-4 w-4" />*/}
                        {/*    <span>Export</span>*/}
                        {/*</button>*/}
                    </div>
                </div>

                {/* Total Expenses */}
                <div className="flex my-10">
                    <div className="bg-white border border-gray-200 rounded-xl py-6 shadow-sm w-full max-w-xs">
                        <p className="text-sm font-medium text-gray-500 mb-2">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-600 mb-1">$6,123.45</p>
                        <p className="text-sm text-gray-400">↓ 2.1% from last month</p>
                    </div>
                </div>

                {/* Expense Categories Pie Chart */}
                <ExpenseCategoriesChart />
            </div>
        </>
    );
}

export default Dashboard;