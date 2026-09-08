import LookupTable from "../../components/lookuptable";
import CustomerBox from "./customerbox";
import NewCustomerBox from "./newcustomerform";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import './customers.css'

interface Customer {
    customerId: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    lastModified: string;
    totalSpent?: number; 
    // Make availabe in customer by reformulating order Post and Put request
    // (Status + Order Price should do and shield from price changes in the future)
    // Handle is deleted!!!!!!!!
    // Don't forget to add according migrations
    // Send prop into customer box

    // racketsStrung?: number;
}

export default function Customers() {

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [showNewCustomer, setShowNewCustomer] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const { getToken } = useAuth();

    const fetchCustomers = async () => {
        const token = await getToken({
            template: "api"
        });
        const response = await fetch("https://weavercrm.com/api/customers", {
            headers:{
                Authorization: `Bearer ${token}`
            }
        });
        const data: Customer[] = await response.json();

        setCustomers(data);
    };

    const searchCustomers = async (query: string) => {
        if (!query.trim()) {
            fetchCustomers();
            return;
        }

        const token = await getToken({
            template: "api"
        });

        const response = await fetch(`https://weavercrm.com/api/customers/search?query=${encodeURIComponent(query)}`, {
            headers:{
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // No match (404) or bad query (400) — treat as empty result set
            setCustomers([]);
            return;
        }

        const data: Customer[] = await response.json();
        setCustomers(data);
    };

    const handleCloseForm = () => {
        setShowNewCustomer(false);
        setEditingCustomer(null);
    };

    const handleEdit = (customerId: number) => {
        const target = customers.find(c => c.customerId === customerId);
        if (!target) return;

        setEditingCustomer(target);
        setShowNewCustomer(true);
    };

    const handleDelete = async (customerId: number) => {
        const target = customers.find(c => c.customerId === customerId);
        if (!target) return;

        const confirmed = window.confirm(`Delete ${target.customerName}? The entry will become unavailable if you do, and associated transactions will stay in the database.`);
        if (!confirmed) return;

        const payload = {
            customerName: target.customerName,
            customerPhone: target.customerPhone,
            customerEmail: target.customerEmail,
            isDeleted: true
        };

        const token = await getToken({
            template: "api"
        });

        const response = await fetch(`https://weavercrm.com/api/customers/${customerId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            fetchCustomers();
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York"
        }).format(new Date(dateString));
    };

    return (
        <div>
            <div className="pageHeader">
                <h2>Customer Management</h2>
                <span>Track all customer history and relationships</span>
                <hr />
            </div>

            <div className={`newcustomerdiv ${showNewCustomer ? "open" : ""}`}>
                <NewCustomerBox
                    action={handleCloseForm}
                    onCustomerCreated={fetchCustomers}
                    existingCustomer={editingCustomer}
                />
            </div>

            <div className="customerlookup">

                <LookupTable 
                    action={() => {
                        setEditingCustomer(null); // Make sure "Add New" never opens a stale edit
                        setShowNewCustomer(prev => !prev);
                    }}
                    onEntryCreated={() => fetchCustomers()}
                    onSearch={searchCustomers}
                />

                <div>

                    {customers.length <= 0
                        ? (<div className="unpopulated">
                            <span>There are no customer entries yet. Click add new to get started!</span>
                        </div>)
                        : (<div className="customerboxes">
                            {customers
                                .slice() // Make copy
                                .sort((a, b) => 
                                    new Date(b.lastModified).getTime() - 
                                    new Date(a.lastModified).getTime()) // Sort by date a to be where
                                .slice(0, 16) // Keep only most recent entries
                                .map(customer => (

                                <CustomerBox
                                    key={customer.customerId}
                                    customerid={customer.customerId}
                                    name={customer.customerName}
                                    email={customer.customerEmail}
                                    phone={customer.customerPhone}
                                    totalSpent={customer.totalSpent}
                                    racketsstrung={customer.racketsStrung}
                                    lastvisit={formatDate(customer.lastModified)}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}</div>)}

                </div>
            </div>
        </div>
    );
}