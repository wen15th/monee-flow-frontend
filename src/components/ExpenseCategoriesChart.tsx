type Category = {
    category: string;
    amount: number;
    percentage: number;
};

type Props = {
    categories: Category[];
};

import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

// const data = [
//     { name: "Food", value: 400 },
//     { name: "Transport", value: 300 },
//     { name: "Entertainment", value: 200 },
//     { name: "Shopping", value: 150 },
//     { name: "Other", value: 100 },
// ];

const COLORS = ["#E57373", "#81C784", "#64B5F6", "#FFD54F", "#BA68C8"];

const ExpenseCategoriesChart = ({ categories }: Props) => {
    const data = categories.map((item) => ({
        name: item.category,
        value: item.amount,
        percentage: item.percentage,
    }));

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


// import { useEffect, useState } from "react";
// import { useAuth } from "../hooks/useAuth";
// import {
//     PieChart,
//     Pie,
//     Cell,
//     ResponsiveContainer,
//     Tooltip,
// } from "recharts";
//
// const COLORS = ["#E57373", "#81C784", "#64B5F6", "#FFD54F", "#BA68C8"];
//
// const ExpenseCategoriesChart = () => {
//     const [data, setData] = useState<PieDataItem[]>([]);
//     const [loading, setLoading] = useState(true);
//     const { accessToken } = useAuth();
//
//     useEffect(() => {
//         const fetchSummary = async () => {
//             try {
//                 const res = await fetch(
//                     `http://localhost:8000/summary`,
//                     {
//                         method: "GET",
//                         headers: {
//                             Authorization: `Bearer ${accessToken}`
//                         },
//                     }
//                 );
//                 const json: SummaryResponse = await res.json();
//
//                 const categories = json.expenses?.categories ?? [];
//
//                 // 👉 转成 PieChart 需要的结构
//                 const pieData: PieDataItem[] = categories.map((item) => ({
//                     name: item.category,
//                     value: item.amount,
//                     percentage: item.percentage,
//                 }));
//
//                 setData(pieData);
//             } catch (err) {
//                 console.error("Failed to load summary", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchSummary();
//     }, []);
//
//     if (loading) {
//         return <div className="p-6">Loading...</div>;
//     }
//
//     return (
//         <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full">
//             <p className="text-sm font-medium text-gray-500 mb-4">
//                 Expense Categories
//             </p>
//
//             <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                          <Pie
//                              data={data}
//                              cx="50%"
//                              cy="50%"
//                              labelLine={true}
//                              style={{
//                                  fontSize: 14
//                              }}
//                              outerRadius={80}
//                              fill="#8884d8"
//                              dataKey="value"
//                              label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
//                          >
//                             {data.map((_, index) => (
//                                 <Cell
//                                     key={index}
//                                     fill={COLORS[index % COLORS.length]}
//                                 />
//                             ))}
//                         </Pie>
//                         <Tooltip
//                             formatter={(value: number) =>
//                                 value.toLocaleString("en-CA", {
//                                     style: "currency",
//                                     currency: "CAD",
//                                 })
//                             }
//                         />
//                     </PieChart>
//                 </ResponsiveContainer>
//             </div>
//         </div>
//     );
// };
//
// export default ExpenseCategoriesChart;
