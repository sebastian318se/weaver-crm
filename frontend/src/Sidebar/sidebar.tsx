import { NavLink } from "react-router-dom";
import { FileText, Info, LayoutDashboard, PackageIcon, Settings, ShoppingCart, TrendingDown, UserIcon } from "lucide-react";
import './sidebar.css';

export default function Sidebar() {
    const navItems = [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard
        }, {
            name: "Expenses",
            path: "/expenses",
            icon: TrendingDown
        }, {
            name: "Inventory",
            path: "/inventory",
            icon: PackageIcon
        }, {
            name: "Customer",
            path: "/customers",
            icon: UserIcon
        }, {
            name: "Orders",
            path: "/orders",
            icon: ShoppingCart
        }, {
            name: "Invoices",
            path: "/invoices",
            icon: FileText
        }, {
            name: "Settings",
            path: "/settings",
            icon: Settings
        }, {
            name: "Support",
            path: "support",
            icon: Info
        }
    ];
    return (
        <div className="sidebar">
            <h2>Tennis CRM</h2>
            <hr />

            <nav>
                {navItems.map ((item) => {
                    const Icon = item.icon;

                    return(
                        <NavLink
                            key={item.path}
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                            to={item.path}>
                            <Icon size={22}/>

                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}