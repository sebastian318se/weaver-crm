import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <div className="sidebar">
            <h2>Tennis CRM</h2>
            <hr />
            <nav>
                    {/* <Link to="/dashboard">Dashboard</Link><br /> */}
                    <a>Dashboard<br /></a>
                    <a>Inventory<br /></a>
                    <a>Customers<br /></a>
                    <a>Orders<br /></a>
                    <a>Invoices<br /></a>
                    <a>Settings<br /></a>
                    <a>Support<br /></a>
            </nav>
        </div>
    );
}