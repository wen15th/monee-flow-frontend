type Category = {
    category: string;
    amount: number;
    percentage: number;
};

type Props = {
    categories: Category[];
    currency: "USD" | "CAD" | "CNY";
    total?: number;
};

type ActiveShapeProps = {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
};

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";

const COLORS = [
    "#F87171", // red-400
    "#FB923C", // orange-400
    "#FBBF24", // amber-400
    "#A3E635", // lime-400
    "#34D399", // emerald-400
    "#22D3EE", // cyan-400
    "#818CF8", // indigo-400
    "#F472B6", // pink-400
    "#A78BFA", // violet-400
    "#60A5FA", // blue-400
];

const ExpenseCategoriesChart = ({ categories, currency, total }: Props) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const data = categories.map((item) => ({
        name: item.category,
        value: item.amount,
        percentage: item.percentage,
    }));

    const computedTotal = total ?? categories.reduce((sum, c) => sum + c.amount, 0);

    const formatAmount = (minor: number) =>
        new Intl.NumberFormat("en", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(minor / 100);

    // Render active (hovered) slice slightly expanded
    const renderActiveShape = (props: ActiveShapeProps) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props as ActiveShapeProps;
        return (
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius - 2}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
        );
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">By category</h3>
                <span className="text-sm text-gray-500 border border-gray-200 rounded-full px-3 py-1">
                    {categories.length} categories
                </span>
            </div>

            {/* Chart + Legend */}
            <div className="flex items-center">
                <div className="relative w-64 h-64 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={75}
                                outerRadius={115}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                                activeIndex={activeIndex ?? undefined}
                                activeShape={renderActiveShape}
                                isAnimationActive={false}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={COLORS[index % COLORS.length]}
                                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                                        style={{ transition: "opacity 0.2s ease" }}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        {activeIndex !== null ? (
                            <>
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate max-w-[120px] text-center">
                                    {data[activeIndex].name}
                                </span>
                                <span className="text-xl font-bold text-gray-900">
                                    {formatAmount(data[activeIndex].value)}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                    {data[activeIndex].percentage.toFixed(1)}%
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                    Total
                                </span>
                                <span className="text-xl font-bold text-gray-900">
                                    {formatAmount(computedTotal)}
                                </span>
                                <span className="text-[11px] text-gray-400">this month</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 space-y-3 p-6">
                    {data.map((item, index) => (
                        <div
                            key={item.name}
                            className="flex items-center gap-3 cursor-pointer rounded-lg px-2 py-1 -mx-2 transition-all duration-200"
                            style={{
                                opacity: activeIndex === null || activeIndex === index ? 1 : 0.3,
                                backgroundColor: activeIndex === index ? "#f9fafb" : "transparent",
                            }}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {/* Color dot */}
                            <span
                                className="w-3 h-3 rounded-sm shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            {/* Category name */}
                            <span className="text-sm text-gray-800 flex-1 truncate text-left">
                                {item.name}
                            </span>
                            {/* Percentage */}
                            <span className="text-sm text-gray-400 w-14 text-right">
                                {item.percentage.toFixed(1)}%
                            </span>
                            {/* Amount */}
                            <span className="text-sm font-semibold text-gray-900 w-24 text-right">
                                {formatAmount(item.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExpenseCategoriesChart;