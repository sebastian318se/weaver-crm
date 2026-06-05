import InfoBox from "../../components/infobox";
import { DollarSign, PackageIcon, TrendingUp, UserIcon } from "lucide-react";
import './dashboard.css';

export default function Dashboard() {
    return (
        <div className="dashboard">
            <div className="pageHeader">
                <h2>Financial Dashboard</h2>
                <span>Buiness Performance Overview</span>
                <hr />
            </div>
            <div className="dashboardGrid">
                <InfoBox
                    icon={DollarSign}
                    metric="+12%"
                    info="Today's Revenue"
                    value="$24,000"
                />
                <InfoBox
                    icon={TrendingUp}
                    metric="+10%"
                    info="This Month"
                    value="$24,000"
                />
                <InfoBox
                    icon={UserIcon}
                    metric="+10%"
                    info="Active Customers"
                    value="128"
                />
                <InfoBox
                    icon={PackageIcon}
                    metric="4 due"
                    info="Pending String Jobs"
                    value="$23"
                />
            </div>
        </div>
        
    );
}