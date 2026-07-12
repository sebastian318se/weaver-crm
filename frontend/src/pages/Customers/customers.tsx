import LookupTable from "../../components/lookuptable";
import CustomerBox from "./customerbox";
import NewCustomerBox from "./newcustomerform";
import { useEffect, useState } from "react";
import './customers.css'

interface Customer {
    customerId: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    lastModified: string;
    totalSpent?: number;
    racketsStrung?: number;
}

export default function Customers() {

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [showNewCustomer, setShowNewCustomer] = useState(false);

    const fetchCustomers = async () => {
        const response = await fetch("http://localhost:5000/api/customers");
        const data: Customer[] = await response.json();

        setCustomers(data);
    };


    useEffect(() => {
        fetchCustomers();
    }, []);

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat("pt-BR", {
            timeZone: "America/Sao_Paulo"
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
                        action={()=>setShowNewCustomer(false)}
                        onCustomerCreated={fetchCustomers}
                    />
                </div>

            <div className="customerlookup">

                <LookupTable 
                    action={()=>setShowNewCustomer(prev => ! prev)} // Toggle whenever pressed
                    onEntryCreated={() => fetchCustomers()}
                />
                
                <div>

                    {customers.length >= 0
                        ? (<div className="unpopulated">
                            <span>There are no customer entries yet. Click add new to get started!</span>
                        </div>)
                        : (<div className="customerboxes">
                            {customers
                                .slice() // Make copy
                                .sort((a, b) => 
                                    new Date(b.lastModified).getTime() - 
                                    new Date(a.lastModified).getTime()) // Sort by date a to be where
                                .slice(0, 8) // Keep only most recent entries
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
                                />
                    ))}</div>)}

                    
                </div>
            </div>
        </div>
    );
}