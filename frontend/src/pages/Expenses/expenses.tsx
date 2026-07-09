import { DollarSign, TrendingUp, TrendingDown, ChartColumnIncreasing } from "lucide-react";
import InfoBox from "../../components/infobox";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useState, useEffect, useMemo } from "react";
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
}

interface ChartDataPoint {
    period: string;
    revenue: number;
    expenses: number;
}

type TimePeriod = "weeks" | "months";

const round = (n: number) => Math.round(n * 100) / 100;

function startOfWeek(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    d.setDate(d.getDate() + diff);

    return d;
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildBuckets(period: TimePeriod) {
    const buckets: {
        key: number;
        label: string;
        revenue: number;
        expenses: number;
    }[] = [];

    const now = new Date();

    if (period === "weeks") {
        let current = startOfWeek(now);

        current.setDate(current.getDate() - 28);

        for (let i = 0; i < 5; i++) {
            buckets.push({
                key: current.getTime(),
                label: current.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                revenue: 0,
                expenses: 0,
            });

            current = new Date(current);
            current.setDate(current.getDate() + 7);
        }
    } else {
        let current = startOfMonth(now);

        current.setMonth(current.getMonth() - 4);

        for (let i = 0; i < 5; i++) {
            buckets.push({
                key: current.getTime(),
                label: current.toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit",
                }),
                revenue: 0,
                expenses: 0,
            });

            current = new Date(current);
            current.setMonth(current.getMonth() + 1);
        }
    }

    return buckets;
}

function aggregateTransactions(
    transactions: Transaction[],
    period: TimePeriod
): ChartDataPoint[] {

    const buckets = buildBuckets(period);

    const lookup = new Map<number, typeof buckets[number]>();

    buckets.forEach(bucket => lookup.set(bucket.key, bucket));

    transactions
        .filter(t => !t.isDeleted)
        .forEach(transaction => {

            const date = new Date(transaction.transactionCreated);

            let key: number;

            if (period === "weeks") {
                key = startOfWeek(date).getTime();
            } else {
                key = startOfMonth(date).getTime();
            }

            const bucket = lookup.get(key);

            if (!bucket) return;

            switch (transaction.transactionCategory) {

                case "Sale":
                case "Stringjob":
                    bucket.revenue += transaction.transactionValue;
                    break;

                case "OperationalCost":
                    bucket.expenses += Math.abs(transaction.transactionValue);
                    break;
            }

        });

    return buckets.map(bucket => ({
        period: bucket.label,
        revenue: round(bucket.revenue),
        expenses: round(bucket.expenses),
    }));
}

export default function Expenses() {

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("weeks");
    const [loading, setLoading] = useState(true);

    async function fetchTransactions() {

        try {

            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/transactions"
            );

            const data: Transaction[] = await response.json();

            setTransactions(data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        fetchTransactions();

    }, []);

    const chartData = useMemo(() => {

        return aggregateTransactions(transactions, timePeriod);

    }, [transactions, timePeriod]);

    const now = new Date();

    const currentMonthTransactions = useMemo(() => {

        return transactions.filter(t => {

            const d = new Date(t.transactionCreated);

            return (
                !t.isDeleted &&
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear()
            );

        });

    }, [transactions]);
        const monthlyRevenue = useMemo(() => {
        return currentMonthTransactions
            .filter(
                (t) =>
                    t.transactionCategory === "Sale" ||
                    t.transactionCategory === "Stringjob"
            )
            .reduce((sum, t) => sum + t.transactionValue, 0);
    }, [currentMonthTransactions]);

    const monthlyExpenses = useMemo(() => {
        return currentMonthTransactions
            .filter((t) => t.transactionCategory === "OperationalCost")
            .reduce((sum, t) => sum + Math.abs(t.transactionValue), 0);
    }, [currentMonthTransactions]);

    const monthlyProfit = monthlyRevenue - monthlyExpenses;

    const monthlyProfitMargin =
        monthlyRevenue === 0
            ? 0
            : (monthlyProfit / monthlyRevenue) * 100;

    return (
        <div className="expensesPageContainer">
            <div className="pageHeader">
                <h2>Financial Overview</h2>
                <span>Revenue, expenses and profitability</span>
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
                    classname={
                        monthlyProfit >= 0
                            ? "text-green"
                            : "text-red"
                    }
                />

                <InfoBox
                    icon={ChartColumnIncreasing}
                    metric=""
                    info="Monthly Profit Margin"
                    value={`${monthlyProfitMargin.toFixed(2)}%`}
                    classname={
                        monthlyProfitMargin >= 0
                            ? "text-green"
                            : "text-red"
                    }
                />
            </div>

            <div className="expensesGraphWrapper">
                <div className="expensesGraphHeader">
                    <h3 className="expensesGraphTitle">
                        Revenue vs Expenses
                    </h3>

                    <div className="expensesGraphTimePeriodToggle">
                        <button
                            className={
                                timePeriod === "weeks"
                                    ? "expensesGraphToggleButton expensesGraphToggleButtonActive"
                                    : "expensesGraphToggleButton"
                            }
                            onClick={() => setTimePeriod("weeks")}
                        >
                            5 Weeks
                        </button>

                        <button
                            className={
                                timePeriod === "months"
                                    ? "expensesGraphToggleButton expensesGraphToggleButtonActive"
                                    : "expensesGraphToggleButton"
                            }
                            onClick={() => setTimePeriod("months")}
                        >
                            5 Months
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="expensesGraphLoadingState">
                        Loading transactions...
                    </div>
                ) : (
                    <ResponsiveContainer
                        width="100%"
                        height={400}
                    >
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 10,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                dataKey="period"
                            />

                            <YAxis
                                width={70}
                            />

                            <Tooltip
                                formatter={(value: number) =>
                                    `$${value.toFixed(2)}`
                                }
                            />

                            <Legend />

                            <Bar
                                dataKey="revenue"
                                name="Revenue"
                                fill="#7c3aed"
                                radius={[10, 10, 0, 0]}
                            />

                            <Bar
                                dataKey="expenses"
                                name="Expenses"
                                fill="#cd3e33"
                                radius={[10, 10, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}