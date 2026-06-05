import InfoBox from "../../components/infobox";
import { DollarSign, TrendingUp, TrendingDown, ChartColumnIncreasing } from "lucide-react";

export default function Expenses(){
    return (
        <div className="expenses">
            <div className="pageHeader">
                <h2>Business Expenses</h2>
                <span>Buiness Expenditure Overview</span>
                <hr />
            </div>
            <div className="dashboardGrid">
                <InfoBox
                    icon={TrendingDown}
                    metric="+12%"
                    info="Total Monthly Expenses"
                    value="$10,000"
                    classname="text-red"
                />
                <InfoBox
                    icon={TrendingUp}
                    metric="+10%"
                    info="Total Monthly Revenue"
                    value="$24,000"
                />                    
                <InfoBox
                    icon={DollarSign}
                    metric="+10%"
                    info="Monthly Net Profit"
                    value="$14,000"
                    classname="text-green"
                />
                <InfoBox
                    icon={ChartColumnIncreasing}
                    metric="+2.33%"
                    info="Monthly Profit Margin"
                    value="58.33%"
                />
            </div>
        </div>
    );
}