import Sidebar from "./Sidebar/sidebar";
import Dashboard from "./pages/Dashboard/dashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inventory from "./pages/Inventory/inventory";
import Customers from "./pages/Customers/customers";
import Orders from "./pages/Orders/orders";
import Invoices from "./pages/Invoices/invoices";
import Settings from "./pages/Settings/settings";
import Support from "./pages/AppSupport/appsupport";
import Expenses from "./pages/Expenses/expenses";

function App() {
    return (
        <BrowserRouter>

            <div className="layout">

                <Sidebar />
                <main className="content">
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />}/>
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/expenses" element={<Expenses />} />
                    </Routes>
                </main>

            </div>

        </BrowserRouter>
    );
}

export default App;