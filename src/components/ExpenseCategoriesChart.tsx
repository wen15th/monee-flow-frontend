import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const data = [
    { name: "Food", value: 400 },
    { name: "Transport", value: 300 },
    { name: "Entertainment", value: 200 },
    { name: "Shopping", value: 150 },
    { name: "Other", value: 100 },
];

const COLORS = ["#E57373", "#81C784", "#64B5F6", "#FFD54F", "#BA68C8"];

const ExpenseCategoriesChart = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">
            <p className="text-sm font-medium text-gray-500 mb-4">Expense Categories</p>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            style={{
                                fontSize: 14
                            }}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                        >
                            {data.map((_, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ExpenseCategoriesChart;