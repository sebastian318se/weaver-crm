import { sale1, sale2, sale3, sale4 } from "./OrderProps";
import SalesTable from "./salesTable";
import { useState } from "react";
import './orders.css'
import LookupTable from "../../components/lookuptable";

export default function Orders() {

    const [activeTab, setActiveTab] = useState(1);

    return (
        <div>
            <div className="pageHeader">
                <h2>Order History</h2>
                <span>Manage current and past stringjobs and orders</span>
                < hr/>
            </div>
            
            <div className="orders">
                <div className="tabButtons">
                    <button
                        className={activeTab === 1 ? "tabactive" : "tab"}
                        onClick={() => setActiveTab(1)}>
                            String Jobs
                    </button>

                    <button 
                        className={activeTab === 2 ? "tabactive" : "tab"}
                        onClick={() => setActiveTab(2)}>
                            Orders
                    </button>

                </div>

                <br />
                
                {activeTab === 1 && (
                    <h2>String Jobs</h2>
                )}

                {activeTab === 2 && (
                    
                    <div className="salescontainer">

                        <LookupTable/>
                        
                        <div className="salesgrid">
                            <SalesTable
                            products={sale1.products}
                            customerId={sale1.customerId}
                            customerName={sale1.customerName}
                            saleDate={sale1.saleDate}/>

                            <SalesTable
                            products={sale2.products}
                            customerId={sale2.customerId}
                            customerName={sale2.customerName}
                            saleDate={sale2.saleDate}/>

                            <SalesTable
                            products={sale3.products}
                            customerId={sale3.customerId}
                            customerName={sale3.customerName}
                            saleDate={sale3.saleDate}/>

                            <SalesTable
                            products={sale4.products}
                            customerId={sale4.customerId}
                            customerName={sale4.customerName}
                            saleDate={sale4.saleDate}/>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}