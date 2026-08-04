import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./protectedroute";


import { useUser } from "@clerk/clerk-react";


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

export default function App() {




    const { isLoaded, isSignedIn, user } = useUser();

    console.log({
        isLoaded,
        isSignedIn,
        userId: user?.id,
        email: user?.primaryEmailAddress?.emailAddress,
    });



    
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/invoices" element={<Invoices />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/expenses" element={<Expenses />} />
                    </Route>
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