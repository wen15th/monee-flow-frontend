type Category = {
    category: string;
    amount: number;
    percentage: number;
};

type Props = {
    categories: Category[];
    currency: "USD" | "CAD" | "CNY";
};

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

const COLORS = ["#E57373", "#81C784", "#64B5F6", "#FFD54F", "#BA68C8"];

const ExpenseCategoriesChart = ({ categories, currency }: Props) => {
    const data = categories.map((item) => ({
        name: item.category,
        value: item.amount,
        percentage: item.percentage,
    }));

    const formatAmount = (minor: number) =>
        new Intl.NumberFormat("en", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(minor / 100);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">
            <p className="text-sm font-medium text-gray-500 mb-4">Expense Categories</p>
            <div className="h-64 flex justify-center">
                <ResponsiveContainer width="80%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={{ stroke: "#999", strokeWidth: 1 }}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ cx, cy, midAngle, outerRadius, name, percent, index }) => {
                                const pct = `${((percent as number) * 100).toFixed(0)}%`;

                                // Place label slightly outside the slice to avoid being too close to the pie
                                const RADIAN = Math.PI / 180;
                                const radius = (outerRadius as number) + 34;
                                const x = (cx as number) + radius * Math.cos(-((midAngle as number) || 0) * RADIAN);
                                const y = (cy as number) + radius * Math.sin(-((midAngle as number) || 0) * RADIAN);

                                const fill = COLORS[(index as number) % COLORS.length];
                                const anchor = x > (cx as number) ? "start" : "end";

                                return (
                                    <text
                                        x={x}
                                        y={y}
                                        textAnchor={anchor}
                                        dominantBaseline="central"
                                        fill={fill}
                                        fontSize={14}
                                    >
                                        <tspan x={x} dy="-0.6em">{name}</tspan>
                                        <tspan x={x} dy="1.2em">{pct}</tspan>
                                    </text>
                                );
                            }}
                        >
                            {data.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{ fontSize: 13}}
                            formatter={(value, entry: any) => {
                                const payload = entry?.payload;
                                if (!payload) return value;
                                return `${payload.name} · ${formatAmount(payload.value)}`;
                            }}
                        />
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ExpenseCategoriesChart;