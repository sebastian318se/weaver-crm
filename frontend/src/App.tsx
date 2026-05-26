import Sidebar from "./Sidebar/sidebar";
import Dashboard from "./pages/dashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inventory from "./pages/inventory";
import Customers from "./pages/customers";
import Orders from "./pages/orders";
import Invoices from "./pages/invoices";
import Settings from "./pages/settings";
import Support from "./pages/appsupport";

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
                    </Routes>
                </main>

            </div>

        </BrowserRouter>
    );
}

export default App;