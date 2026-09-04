import { DollarSign, TrendingUp, TrendingDown, ChartColumnIncreasing } from "lucide-react";
import NewExpenseForm from "./newOperationalCostForm";
import { useState, useEffect, useMemo } from "react";
import InfoBox from "../../components/infobox";
import { useAuth } from "@clerk/clerk-react";
import "./expenses.css";
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

interface SaleItem {
    productPrice: number;
    productQuantity: number;
    product: {
        productType: string;
    };
}

interface Sale {
    orderId: number;
    createdAt: string;
    orderPrice: number;
    saleItems: SaleItem[];
    customer: {
        customerId: number;
    };
    isDeleted: boolean;
}

interface StringJob {
    orderId: number;
    createdAt: string;
    orderPrice: number;
    isDeleted: boolean;
}
// -----------------------------------------------------

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

                case "ProductAcquisition":
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
    const [sales, setSales] = useState<Sale[]>([]);
    const [stringJobs, setStringJobs] = useState<StringJob[]>([]);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("weeks");
    const [loading, setLoading] = useState(true);

    const { getToken } = useAuth();

    async function fetchTransactions() {

        try {

            const token = await getToken({
                template: "api"
            });

            setLoading(true);

            const [transactionsRes, salesRes, stringJobsRes] = await Promise.all([
                fetch("https://weavercrm.com/api/transactions", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),
                fetch("https://weavercrm.com/api/sales", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),
                fetch("https://weavercrm.com/api/strung", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }),
            ]);

            const [transactionsData, salesData, stringJobsData] = await Promise.all([
                transactionsRes.json(),
                salesRes.json(),
                stringJobsRes.json(),
            ]);

            setTransactions(transactionsData);
            setSales(salesData);
            setStringJobs(stringJobsData);

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
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);

        const salesRevenue = sales
            .filter(s => !s.isDeleted && new Date(s.createdAt) >= start)
            .reduce(
                (sum, sale) =>
                    sum +
                    sale.saleItems.reduce(
                        (itemSum, item) => itemSum + item.productPrice * item.productQuantity,
                        0
                    ),
                0
            );

        const stringRevenue = stringJobs
            .filter(sj => !sj.isDeleted && new Date(sj.createdAt) >= start)
            .reduce((sum, sj) => sum + sj.orderPrice, 0);

        return salesRevenue + stringRevenue;
    }, [sales, stringJobs]);

    const monthlyExpenses = useMemo(() => {
        return currentMonthTransactions
            .filter(
                (t) => 
                    t.transactionCategory === "OperationalCost" ||
                    t.transactionCategory === "ProductAcquisition"
            )
            .reduce((sum, t) => sum + Math.abs(t.transactionValue), 0);
    }, [currentMonthTransactions]);

    const monthlyProfit = monthlyRevenue - monthlyExpenses;

    const monthlyProfitMargin =
        monthlyRevenue === 0
            ? 0
            : (monthlyProfit / monthlyRevenue) * 100;

    const [showNewExpense, setShowNewExpense] = useState<boolean>(false);

    return (
        <div className="expensesPageContainer">
            <div className="pageHeader">
                <h2>Financial Overview</h2>
                <span>Revenue, expenses and profitability at a glance</span>
                <hr />
            </div>

            <div className="expensesPageDashboardGrid">
                <InfoBox
                    icon={TrendingUp}
                    metric=""
                    info="Monthly Revenue"
                    value={`$${monthlyRevenue.toFixed(2)}`}
                    classname=""
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
            
            <div className={`newexpensediv ${showNewExpense ? "open" : ""}`}>
                <NewExpenseForm
                    onCancel={() => setShowNewExpense(prev => !prev)}
                    onTransactionCreated={fetchTransactions}
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

                        <button
                            className="newexpensebutton"
                            onClick={() => setShowNewExpense(prev => !prev)}>
                            Add Expense
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
                        height={250}
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