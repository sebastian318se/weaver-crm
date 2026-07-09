import { useEffect, useMemo, useState } from "react";
import {
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    LineChart,
    Line,
} from "recharts";
import InfoBox from "../../components/infobox";
import { DollarSign, TrendingUp, TrendingDown, ChartColumnIncreasing } from "lucide-react";
import './dashboard.css';

type TimePeriod = '7d' | '30d' | '3m' | '6m' | 'ytd';

interface Transaction {
    transactionId: number;
    transactionValue: number;
    transactionCategory: string;
    transactionDiscriminator?: string;
    transactionCreated: string;
    isDeleted: boolean;
}

interface ChartDataPoint {
    period: string;
    totalRevenue: number;
    salesRevenue: number;
    stringjobRevenue: number;
}

interface PieSlice {
    name: string;
    value: number;
}

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '3m', label: '3M' },
    { value: '6m', label: '6M' },
    { value: 'ytd', label: 'YTD' },
];

const CHART_COLORS = ['#7c3aed', '#cd3e33', '#06b6d4', '#c4b5fd', '#f472b6', '#fbbf24', '#f87171', '#94a3b8'];

const SALE_DISCRIMINATORS = ['shoe', 'ball', 'clothing', 'tennisString', 'racket', 'grip', 'other'];

const DISCRIMINATOR_LABELS: Record<string, string> = {
    shoe: 'Shoe',
    ball: 'Ball',
    clothing: 'Clothing',
    tennisString: 'Tennis String',
    racket: 'Racket',
    grip: 'Grip',
    other: 'Other',
};

function getPeriodStartDate(period: TimePeriod): Date {
    const now = new Date();
    const start = new Date(now);

    switch (period) {
        case '7d':
            start.setDate(now.getDate() - 7);
            return start;
        case '30d':
            start.setDate(now.getDate() - 30);
            return start;
        case '3m':
            start.setMonth(now.getMonth() - 3);
            return start;
        case '6m':
            start.setMonth(now.getMonth() - 6);
            return start;
        case 'ytd':
            return new Date(now.getFullYear(), 0, 1);
    }
}

function getBucketKey(date: Date, period: TimePeriod): string {
    if (period === '7d' || period === '30d') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (period === '3m' || period === '6m') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `Week ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function aggregateRevenueLines(transactions: Transaction[], period: TimePeriod): ChartDataPoint[] {
    const startDate = getPeriodStartDate(period);
    const grouped: {
        [key: string]: { salesRevenue: number; stringjobRevenue: number };
    } = {};

    transactions
        .filter((t) => !t.isDeleted && new Date(t.transactionCreated) >= startDate)
        .forEach((t) => {
            const date = new Date(t.transactionCreated);
            const key = getBucketKey(date, period);

            if (!grouped[key]) {
                grouped[key] = { salesRevenue: 0, stringjobRevenue: 0 };
            }

            if (t.transactionCategory === 'Sale') {
                grouped[key].salesRevenue += t.transactionValue;
            } else if (t.transactionCategory === 'Stringjob') {
                grouped[key].stringjobRevenue += t.transactionValue;
            }
        });

    return Object.entries(grouped).map(([period, values]) => {
        const salesRevenue = Math.round(values.salesRevenue * 100) / 100;
        const stringjobRevenue = Math.round(values.stringjobRevenue * 100) / 100;
        return {
            period,
            salesRevenue,
            stringjobRevenue,
            totalRevenue: Math.round((salesRevenue + stringjobRevenue) * 100) / 100,
        };
    });
}

// Pie: break Sale into discriminator subcategories, plus Stringjob as its own slice.
function buildPieData(transactions: Transaction[], period: TimePeriod): PieSlice[] {
    const startDate = getPeriodStartDate(period);
    const grouped: { [key: string]: number } = {};

    transactions
        .filter(
            (t) =>
                !t.isDeleted &&
                new Date(t.transactionCreated) >= startDate &&
                (t.transactionCategory === 'Sale' || t.transactionCategory === 'Stringjob')
        )
        .forEach((t) => {
            let label: string;

            if (t.transactionCategory === 'Stringjob') {
                label = 'Stringjob';
            } else {
                // Sale break down by discriminator
                const disc = t.transactionDiscriminator ?? 'other';
                const normalized = SALE_DISCRIMINATORS.includes(disc) ? disc : 'other';
                label = DISCRIMINATOR_LABELS[normalized] ?? 'Other';
            }

            grouped[label] = (grouped[label] ?? 0) + t.transactionValue;
        });

    return Object.entries(grouped)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({
            name,
            value: Math.round(value * 100) / 100,
        }));
}

function formatCurrency(value: number): string {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// ---------- Component ----------

export default function Dashboard() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
    const [pieTimePeriod, setPieTimePeriod] = useState<TimePeriod>('30d');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:5000/api/transactions');
                const transactionsData: Transaction[] = await response.json();
                setTransactions(transactionsData);
            } catch (err) {
                console.error('Failed to load dashboard data', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    const chartData = useMemo(
        () => aggregateRevenueLines(transactions, timePeriod),
        [transactions, timePeriod]
    );

    const pieData = useMemo(
        () => buildPieData(transactions, pieTimePeriod),
        [transactions, pieTimePeriod]
    );

    const totalRevenue = chartData.reduce((sum, d) => sum + d.totalRevenue, 0);
    const totalExpenses = useMemo(() => {
        const startDate = getPeriodStartDate(timePeriod);
        return transactions
            .filter(
                (t) =>
                    !t.isDeleted &&
                    t.transactionCategory === 'OperationalCost' &&
                    new Date(t.transactionCreated) >= startDate
            )
            .reduce((sum, t) => sum + Math.abs(t.transactionValue), 0);
    }, [transactions, timePeriod]);

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return (
        <div className="dashboard">
            <div className="pageHeader">
                <h2>Financial Dashboard</h2>
                <span>Business Performance Overview</span>
                <hr />
            </div>

            <div className="dashboardGrid">
                <InfoBox
                    icon={TrendingUp}
                    metric=""
                    info="Monthly Revenue"
                    value={totalRevenue.toFixed(2)}
                />
                <InfoBox
                    icon={TrendingDown}
                    metric=""
                    info="Monthly Expenses"
                    value={totalExpenses.toFixed(2)}
                    classname="text-red"
                />
                <InfoBox
                    icon={DollarSign}
                    metric=""
                    info="Monthly Net Profit"
                    value={netProfit.toFixed(2)}
                    classname="text-green"
                />
                <InfoBox
                    icon={ChartColumnIncreasing}
                    metric=""
                    info="Monthly Profit Margin"
                    value={`${profitMargin.toFixed(2)}%`}
                />
            </div>

            <div className="dashboardChartsGrid">
                {/* Line Chart — Revenue over time */}
                <div className="dashboardGraphWrapper">
                    <div className="dashboardGraphHeader">
                        <h3 className="dashboardGraphTitle">Revenue Over Time</h3>
                        <div className="dashboardGraphTimePeriodToggle">
                            {TIME_PERIODS.map((period) => (
                                <button
                                    key={period.value}
                                    className={
                                        period.value === timePeriod
                                            ? "dashboardGraphToggleButton dashboardGraphToggleButtonActive"
                                            : "dashboardGraphToggleButton"
                                    }
                                    onClick={() => setTimePeriod(period.value)}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="dashboardGraphLoadingState">Loading revenue data...</div>
                    ) : chartData.length === 0 ? (
                        <div className="dashboardGraphEmptyState">No data available for this period</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis width={70} tickFormatter={formatCurrency} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="totalRevenue"
                                    stroke={CHART_COLORS[0]}
                                    name="Total Revenue"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="salesRevenue"
                                    stroke={CHART_COLORS[2]}
                                    name="Sales Revenue"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="stringjobRevenue"
                                    stroke={CHART_COLORS[4]}
                                    name="Stringjob Revenue"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie Chart — Revenue type breakdown */}
                <div className="dashboardGraphWrapper">
                    <div className="dashboardGraphHeader">
                        <h3 className="dashboardGraphTitle">Revenue Breakdown</h3>
                        <div className="dashboardGraphTimePeriodToggle">
                            {TIME_PERIODS.map((period) => (
                                <button
                                    key={period.value}
                                    className={
                                        period.value === pieTimePeriod
                                            ? "dashboardGraphToggleButton dashboardGraphToggleButtonActive"
                                            : "dashboardGraphToggleButton"
                                    }
                                    onClick={() => setPieTimePeriod(period.value)}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="dashboardGraphLoadingState">Loading breakdown data...</div>
                    ) : pieData.length === 0 ? (
                        <div className="dashboardGraphEmptyState">No data available for this period</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label={(entry) => `${entry.name}`}
                                >
                                    {pieData.map((_entry, index) => (
                                        <Cell
                                            key={`slice-${index}`}
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}