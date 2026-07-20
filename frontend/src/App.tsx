import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Sidebar from "./Sidebar/sidebar";
import Dashboard from "./pages/Dashboard/dashboard";
import Inventory from "./pages/Inventory/inventory";
import Customers from "./pages/Customers/customers";
import Orders from "./pages/Orders/orders";
import Invoices from "./pages/Invoices/invoices";
import Settings from "./pages/Settings/settings";
import Support from "./pages/AppSupport/appsupport";
import Expenses from "./pages/Expenses/expenses";
import LoginPage from "./pages/Login/loginpage";
import LandingPage from "./pages/Login/landingpage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
            
                <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/expenses" element={<Expenses />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

function Layout() {
    return (
        <div className="layout">
            <Sidebar />

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}

export default App;