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
import { DollarSign, TrendingUp, ChartColumnIncreasing } from "lucide-react";
import './dashboard.css';
import { useAuth } from "@clerk/clerk-react";

type TimePeriod = '7d' | '30d' | '3m' | '6m' | 'ytd';

interface Transaction {
    transactionId: number;
    transactionValue: number;
    transactionCategory: string;
    transactionCreated: string;
    isDeleted: boolean;
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

interface SaleItem {
    productPrice: number;
    productQuantity: number;
    product: {
        productType: string;
    };
}

interface StringJob {
    orderId: number;
    createdAt: string;
    orderPrice: number;
    isDeleted: boolean;
}

interface ChartDataPoint {
    date: Date;
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

const CHART_COLORS = ['#7c3aed', '#5b4b71', '#06b6d4', '#c4b5fd', '#f472b6', '#fbbf24', '#f87171', '#94a3b8'];

const PRODUCT_TYPE_LABELS: Record<string, string> = {
    racket: 'Rackets',
    tennisstring: 'Strings',
    grip: 'Grips',
    shoe: 'Shoes',
    ball: 'Balls',
    clothing: 'Clothing',
    other: 'Other',
};

function getPeriodStartDate(period: TimePeriod): Date {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    switch (period) {
        case '7d':
            start.setDate(now.getDate() - 6);
            return start;
        case '30d':
            start.setDate(now.getDate() - 29);
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

function getStartOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
}

function getStartOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatBucketLabel(date: Date, period: TimePeriod): string {
    if (period === '7d' || period === '30d') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (period === '3m' || period === '6m') {
        return `Week ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function generateBuckets(period: TimePeriod): Date[] {
    const buckets: Date[] = [];
    const start = getPeriodStartDate(period);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (period === '7d' || period === '30d') {
        let current = new Date(start);
        while (current <= now) {
            buckets.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
    } else if (period === '3m' || period === '6m') {
        let current = getStartOfWeek(start);
        const endOfWeek = getStartOfWeek(now);
        while (current <= endOfWeek) {
            buckets.push(new Date(current));
            current.setDate(current.getDate() + 7);
        }
    } else {
        let current = getStartOfMonth(start);
        const endMonth = getStartOfMonth(now);
        while (current <= endMonth) {
            buckets.push(new Date(current));
            current.setMonth(current.getMonth() + 1);
        }
    }

    return buckets;
}

function getBucketDate(date: Date, period: TimePeriod): Date {
    if (period === '7d' || period === '30d') {
        return getStartOfDay(date);
    }

    if (period === '3m' || period === '6m') {
        return getStartOfWeek(date);
    }

    return getStartOfMonth(date);
}

function aggregateRevenueLines(
    sales: Sale[],
    stringJobs: StringJob[],
    period: TimePeriod
): ChartDataPoint[] {
    const startDate = getPeriodStartDate(period);
    const buckets = generateBuckets(period);
    const bucketMap = new Map<number, { salesRevenue: number; stringjobRevenue: number }>();

    buckets.forEach((bucket) => {
        bucketMap.set(bucket.getTime(), { salesRevenue: 0, stringjobRevenue: 0 });
    });

    sales
        .filter((s) => !s.isDeleted && new Date(s.createdAt) >= startDate)
        .forEach((sale) => {
            const saleDate = new Date(sale.createdAt);
            const bucketDate = getBucketDate(saleDate, period);
            const bucketKey = bucketDate.getTime();

            if (bucketMap.has(bucketKey)) {
                const revenue = sale.saleItems.reduce(
                    (sum, item) => sum + item.productPrice * item.productQuantity,
                    0
                );
                bucketMap.get(bucketKey)!.salesRevenue += revenue;
            }
        });

    stringJobs
        .filter((sj) => !sj.isDeleted && new Date(sj.createdAt) >= startDate)
        .forEach((stringJob) => {
            const jobDate = new Date(stringJob.createdAt);
            const bucketDate = getBucketDate(jobDate, period);
            const bucketKey = bucketDate.getTime();

            if (bucketMap.has(bucketKey)) {
                bucketMap.get(bucketKey)!.stringjobRevenue += stringJob.orderPrice;
            }
        });

    return buckets.map((bucket) => {
        const values = bucketMap.get(bucket.getTime())!;
        const salesRevenue = Math.round(values.salesRevenue * 100) / 100;
        const stringjobRevenue = Math.round(values.stringjobRevenue * 100) / 100;

        return {
            date: bucket,
            period: formatBucketLabel(bucket, period),
            salesRevenue,
            stringjobRevenue,
            totalRevenue: Math.round((salesRevenue + stringjobRevenue) * 100) / 100,
        };
    });
}
function buildPieData(sales: Sale[], stringJobs: StringJob[], period: TimePeriod): PieSlice[] {
    const startDate = getPeriodStartDate(period);
    const grouped: { [key: string]: number } = {
        'Rackets': 0,
        'Strings': 0,
        'Grips': 0,
        'Shoes': 0,
        'Balls': 0,
        'Clothing': 0,
        'Other': 0,
        'Stringjobs': 0,
    };

    // Aggregate sales revenue by product type
    sales
        .filter((s) => !s.isDeleted && new Date(s.createdAt) >= startDate)
        .forEach((sale) => {
            sale.saleItems.forEach((item) => {
                const discriminator = item.product.discriminator?.toLowerCase() || "other";
                const label = PRODUCT_TYPE_LABELS[discriminator] || 'Other';
                const revenue = item.productPrice * item.productQuantity;
                grouped[label] += revenue;
            });
        });

    // Aggregate stringjob revenue
    stringJobs
        .filter((sj) => !sj.isDeleted && new Date(sj.createdAt) >= startDate)
        .forEach((stringJob) => {
            grouped['Stringjobs'] += stringJob.orderPrice;
        });

    // Return only non-zero slices
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

export default function Dashboard() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('7d');
    const [pieTimePeriod, setPieTimePeriod] = useState<TimePeriod>('7d');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [stringJobs, setStringJobs] = useState<StringJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { getToken } = useAuth();

    useEffect(() => {
        async function fetchDashboardData() {
            setIsLoading(true);
            try {
                const token = await getToken({
                    template: "api"
                });

                const [transactionsRes, salesRes, stringJobsRes] = await Promise.all([
                    fetch('https://weavercrm.com/api/transactions', {
                        headers:{
                            Authorization: `Bearer ${token}`
                        }}),
                    fetch('https://weavercrm.com/api/sales', {
                        headers:{
                            Authorization: `Bearer ${token}`
                        }}),
                    fetch('https://weavercrm.com/api/strung', {
                        headers:{
                            Authorization: `Bearer ${token}`
                        }}),
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
                console.error('Failed to load dashboard data', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    const chartData = useMemo(
        () => aggregateRevenueLines(sales, stringJobs, timePeriod),
        [sales, stringJobs, timePeriod]
    );

    const pieData = useMemo(
        () => buildPieData(sales, stringJobs, pieTimePeriod),
        [sales, stringJobs, pieTimePeriod]
    );
const todayRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const salesRevenue = sales
        .filter(s => !s.isDeleted && new Date(s.createdAt) >= today)
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
        .filter(sj => !sj.isDeleted && new Date(sj.createdAt) >= today)
        .reduce((sum, sj) => sum + sj.orderPrice, 0);

    return salesRevenue + stringRevenue;
}, [sales, stringJobs]);

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

    const activeCustomers = useMemo(() => {
        const start = new Date();
        start.setDate(start.getDate() - 30);

        return new Set(
            sales
                .filter(
                    s =>
                        !s.isDeleted &&
                        new Date(s.createdAt) >= start &&
                        s.customer
                )
                .map(s => s.customer.customerId)
        ).size;
    }, [sales]);

    const averageOrderValue = useMemo(() => {
        const validSales = sales.filter(s => !s.isDeleted);

        if (validSales.length === 0) return 0;

        const revenue = validSales.reduce(
            (sum, sale) =>
                sum +
                sale.saleItems.reduce(
                    (itemSum, item) => itemSum + item.productPrice * item.productQuantity,
                    0
                ),
            0
        );

        return revenue / validSales.length;
    }, [sales]);
    
    return (
        <div className="dashboard">
            <div className="pageHeader">
                <h2>Financial Dashboard</h2>
                <span>Business performance overview</span>
                <hr />
            </div>

            <div className="dashboardGrid">
                <InfoBox
                    icon={DollarSign}
                    metric=""
                    info="Today's Revenue"
                    classname="text-green"
                    value={`$${todayRevenue.toFixed(2)}`}
                />

                <InfoBox
                    icon={TrendingUp}
                    metric=""
                    info="Monthly Revenue"
                    classname="text-green"
                    value={`$${monthlyRevenue.toFixed(2)}`}
                />

                <InfoBox
                    icon={ChartColumnIncreasing}
                    metric=""
                    info="Active Customers this Month"
                    value={activeCustomers.toString()}
                />

                <InfoBox
                    icon={TrendingUp}
                    metric=""
                    info="Average Order Value"
                    value={`$${averageOrderValue.toFixed(2)}`}
                />
            </div>

            <div className="dashboardChartsGrid">
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
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" tick={{ fontSize: 14}} />
                                <YAxis width={70} tickFormatter={formatCurrency} tick={{ fontSize: 14}}/>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="totalRevenue"
                                    stroke={CHART_COLORS[0]}
                                    name="Total Revenue"
                                    strokeWidth={1.5}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="salesRevenue"
                                    stroke={CHART_COLORS[2]}
                                    name="Sales Revenue"
                                    strokeWidth={1.5}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="stringjobRevenue"
                                    stroke={CHART_COLORS[1]}
                                    name="Stringjob Revenue"
                                    strokeWidth={1.5}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

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
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={(entry) => `${entry.name}`}
                                    fontSize={14}
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