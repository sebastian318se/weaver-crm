import { sale1, sale2, sale3, sale4, sale5, sj1, sj2, sj3, sj4, sj5 } from "./OrderProps";
import SalesTable from "./salesTable";
import { useState } from "react";
import './orders.css'
import LookupTable from "../../components/lookuptable";
import SjTable from "./sjTable";



export default function Orders() {

    const [activeTab, setActiveTab] = useState("orderstab");
    const stringjobs = [ sj1,sj2, sj3, sj4, sj5 ];
    const sales = [ sale1, sale2, sale3, sale4, sale5 ];

    return (
        <div>
            <div className="pageHeader">
                <h2>Order History</h2>
                <span>Manage current and past stringjobs and orders</span>
                <hr />
            </div>
            
            <div className="orders">
                <div className="tabButtons">
                    <button
                        className={activeTab === "orderstab" ? "tabactive" : "tab"}
                        onClick={() => setActiveTab("orderstab")}>
                            String Jobs
                    </button>

                    <button 
                        className={activeTab === "salestab" ? "tabactive" : "tab"}
                        onClick={() => setActiveTab("salestab")}>
                            Sales
                    </button>

                </div>

                <br />
                
                {activeTab === "orderstab" && (

                    <div className="salescontainer">

                        <LookupTable/>

                        <div className="sjgrid">

                            {stringjobs.map((job) => (
                                <SjTable
                                key={job.orderId}
                                {...job}/>
                            ))}

                        </div>
                    </div>
                )}

                {activeTab === "salestab" && (
                    
                    <div className="salescontainer">

                        <LookupTable/>
                    
                        <div className="salesgrid">

                            {sales.map((sale) => (
                                <SalesTable
                                    key={sale.orderId}
                                    {...sale}/>
                            ))}

                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}