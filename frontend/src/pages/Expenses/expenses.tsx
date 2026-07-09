import { DollarSign, TrendingUp, TrendingDown, ChartColumnIncreasing } from "lucide-react";
import InfoBox from "../../components/infobox";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from "react";
import "./expenses.css";

interface Transaction {
    transactionId: number;
    transactionValue: number;
    transactionCategory: string;
    transactionCreated: string;
    lastModified: string | null;
    description: string | null;
    isDeleted: boolean;
    customerId: number | null;
    customer: null;
}

interface ChartDataPoint {
    period: string;
    revenue: number;
    expenses: number;
}

type TimePeriod = "weeks" | "months";

export default function Expenses() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("weeks");
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/transactions");
            const data: Transaction[] = await response.json();
            setTransactions(data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        if (transactions.length > 0) {
            const aggregatedData = aggregateTransactions(transactions, timePeriod);
            setChartData(aggregatedData);
        }
    }, [transactions, timePeriod]);

    const aggregateTransactions = (transactions: Transaction[], period: TimePeriod): ChartDataPoint[] => {
        const grouped: { [key: string]: { revenue: number; expenses: number } } = {};
        const now = new Date();

        transactions.forEach((transaction) => {
            const date = new Date(transaction.transactionCreated);
            
            // Only include transactions from the last 5 periods
            const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            
            if (period === "weeks" && daysDiff > 35) return;
            if (period === "months" && daysDiff > 150) return;

            let periodKey: string;

            if (period === "weeks") {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                periodKey = `Week ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
            } else {
                periodKey = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
            }

            if (!grouped[periodKey]) {
                grouped[periodKey] = { revenue: 0, expenses: 0 };
            }

            // Categorize based on transactionCategory
            if (transaction.transactionCategory === "Sale" || 
                transaction.transactionCategory === "Stringjob") {
                grouped[periodKey].revenue += transaction.transactionValue;

            } else if (transaction.transactionCategory === "OperationalCost") {
                grouped[periodKey].expenses += Math.abs(transaction.transactionValue);
            }
        });

        // Convert to array and sort chronologically
        return Object.entries(grouped)
            .map(([period, values]) => ({
                period,
                revenue: Math.round(values.revenue * 100) / 100,
                expenses: Math.round(values.expenses * 100) / 100,
            }))
            .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime())
            .slice(-5); // Get last 5 periods
    };

    // InfoBox value calculations
    const now = new Date();

    const currentMonthTransactions = transactions.filter((transaction) => {
        const date = new Date(transaction.transactionCreated);

        return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        );
    });

    const monthlyRevenue = currentMonthTransactions
        .filter(
            (t) =>
                t.transactionCategory === "Sale" ||
                t.transactionCategory === "Stringjob"
        )
        .reduce((sum, t) => sum + t.transactionValue, 0);

    const monthlyExpenses = currentMonthTransactions
        .filter((t) => t.transactionCategory === "OperationalCost")
        .reduce((sum, t) => sum + Math.abs(t.transactionValue), 0);

    const monthlyProfit = monthlyRevenue - monthlyExpenses;

    const monthlyProfitMargin =
        monthlyRevenue > 0
            ? (monthlyProfit / monthlyRevenue) * 100
            : 0;

    return (
        <div className="expensesPageContainer">
            <div className="pageHeader">
                <h2>Customer Management</h2>
                <span>Track all customer history and relationships</span>
                <hr />
            </div>
            <div className="expensesPageDashboardGrid">
                <InfoBox
                    icon={TrendingUp}
                    metric=""
                    info="Monthly Revenue"
                    value={`$${monthlyRevenue.toFixed(2)}`}
                />
                <InfoBox
                    icon={TrendingDown}
                    metric=""
                    info="Monthly Expenses"
                    value={`$${monthlyExpenses.toFixed(2)}`}
                    classname="text-red"
                />

                <InfoBox
                    icon={DollarSign}
                    metric=""
                    info="Monthly Net Profit"
                    value={`$${monthlyProfit.toFixed(2)}`}
                    classname={monthlyProfit >= 0 ? "text-green" : "text-red"}
                />

                <InfoBox
                    icon={ChartColumnIncreasing}
                    metric=""
                    info="Monthly Profit Margin"
                    value={`${monthlyProfitMargin.toFixed(2)}%`}
                    classname={monthlyProfitMargin >= 0 ? "text-green" : "text-red"}
                />
            </div>
            <div className="expensesGraphWrapper">
                <div className="expensesGraphHeader">
                    <h3 className="expensesGraphTitle">Revenue vs Expenses</h3>
                    <div className="expensesGraphTimePeriodToggle">
                        <button
                            className={`expensesGraphToggleButton ${timePeriod === "weeks" ? "expensesGraphToggleButtonActive" : ""}`}
                            onClick={() => setTimePeriod("weeks")}
                        >
                            5 Weeks
                        </button>
                        <button
                            className={`expensesGraphToggleButton ${timePeriod === "months" ? "expensesGraphToggleButtonActive" : ""}`}
                            onClick={() => setTimePeriod("months")}
                        >
                            5 Months
                        </button>
                    </div>
                </div>
                {loading ? (
                    <div className="expensesGraphLoadingState">Loading transactions...</div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 0,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis width={60} />
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            <Legend />
                            <Bar
                                dataKey="revenue"
                                fill="#7c3aed"
                                name="Revenue"
                                radius={[10, 10, 0, 0]}
                            />
                            <Bar
                                dataKey="expenses"
                                fill="#cd3e33"
                                name="Expenses"
                                radius={[10, 10, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="expensesGraphEmptyState">No transactions found</div>
                )}
            </div>
        </div>
    );
}