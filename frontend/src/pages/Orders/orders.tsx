import SalesTable from "./salesTable";
import { useEffect, useState } from "react";
import './orders.css'
import LookupTable from "../../components/lookuptable";
import SjTable from "./sjTable";
import NewSaleBox from "./newsaleform";
import NewSjBox from "./neworderform";

type ProductProps = {
    productId: number,
    productName: string,
    productQuantity: number,
    productPrice: number
}

interface SaleItem {
    productId: number;
    productQuantity: number;
}

interface Customer {
    customerId: number;
    customerName: string;
}

interface Racket {
    productId: number;
    productName: string;
    headSize: number;
    stringPattern: string;
}

interface TennisString {
    productId: number;
    productName: string;
    gauge: number;
    productPrice: number;
}

interface Sale {
    orderId: number;
    customerId: number;
    customer: Customer | null;
    orderPrice: number;
    status: number;
    createdAt: string;
    completedAt: string | null;
    isDeleted: boolean;
    saleItems: SaleItem[];
}

interface StringJob{
    orderId: number;
    customerId: number;
    customer: Customer | null;
    racketId: number;
    racket: Racket | null;
    tennisStringId: number;
    tennisString: TennisString | null;
    orderPrice: number;
    status: string;
    createdAt: string;
    completedAt: string | null;
    expectedAt: string | null;
    mainTension: number;
    crossTension: number;
}

export default function Orders() {

    const [activeTab, setActiveTab] = useState("orderstab");

    const [sales, setSales] = useState<Sale[]>([]);

    const [showNewSaleBox, setShowNewSaleBox] = useState(false);

    const fetchSales = async () => {
        const response = await fetch("http://localhost:5000/api/sales");
        const data = await response.json();

        setSales(data);
    }
    useEffect(() => {
        fetchSales();
    }, []);



    const [stringjobs, setStringjobs] = useState<StringJob[]>([]);
    const fetchStringJob = async () => {
        const response = await fetch("http://localhost:5000/api/strung");
        const data = await response.json();

        setStringjobs(data);
    }
    useEffect(() => {
        fetchStringJob();
    }, []);

    // Search results per tab; null means "no active search, show full list"
    const [saleSearchResults, setSaleSearchResults] = useState<Sale[] | null>(null);
    const [sjSearchResults, setSjSearchResults] = useState<StringJob[] | null>(null);

    const searchSales = async (query: string) => {
        if (!query.trim()) {
            setSaleSearchResults(null);
            return;
        }

        const response = await fetch(`http://localhost:5000/api/sales/search?query=${encodeURIComponent(query)}`);

        if (!response.ok) {
            // No match (404) or bad query (400) — treat as empty result set
            setSaleSearchResults([]);
            return;
        }

        const data: Sale[] = await response.json();
        setSaleSearchResults(data);
    };

    const searchStringJobs = async (query: string) => {
        if (!query.trim()) {
            setSjSearchResults(null);
            return;
        }

        const response = await fetch(`http://localhost:5000/api/strung/search?query=${encodeURIComponent(query)}`);

        if (!response.ok) {
            // No match (404) or bad query (400) — treat as empty result set
            setSjSearchResults([]);
            return;
        }

        const data: StringJob[] = await response.json();
        setSjSearchResults(data);
    };

    // Clear whichever search is active when switching tabs
    useEffect(() => {
        setSaleSearchResults(null);
        setSjSearchResults(null);
    }, [activeTab]);

    const displayedStringJobs = sjSearchResults !== null ? sjSearchResults : stringjobs;
    const displayedSales = saleSearchResults !== null ? saleSearchResults : sales;

    return (
        <div>
            <div className="pageHeader">
                <h2>Order History</h2>
                <span>Manage current and past stringjobs and orders</span>
                <hr />
            </div>
            
            <div>
                <div className="ordersmargin">
                    <div className="tabButtons">
                        <button
                            className={activeTab === "orderstab" ? "tabactive" : "tab"}
                            onClick={() => setActiveTab("orderstab")}>
                                Orders
                        </button>

                        <button 
                            className={activeTab === "salestab" ? "tabactive" : "tab"}
                            onClick={() => setActiveTab("salestab")}>
                                Sales
                        </button>

                    </div>

                    <br />
                </div>
                {activeTab === "orderstab" && (
                    <div>
                        <div className={`newsalediv ${showNewSaleBox ? "open" : ""}`}>
                            <NewSjBox
                                action={() => setShowNewSaleBox(prev => !prev)}
                                onSjCreated={fetchStringJob}
                            />
                        </div>

                        <div className="ordersmargin">
                            <div className="salescontainer">
                                
                                <LookupTable
                                    onEntryCreated={fetchSales}
                                    action={() => setShowNewSaleBox(prev => !prev)}
                                    onSearch={searchStringJobs}/>

                                <div>

                                    {sales.length <= 0
                                    ? (<div className="unpopulated">
                                            <span>There are no string jobs yet. Click add new to get started!</span>
                                        </div>)
                                    : (<div className="sjgrid">
                                            {displayedStringJobs.slice() // Make copy
                                                .sort((a, b) => 
                                                    new Date(b.createdAt).getTime() - 
                                                    new Date(a.createdAt).getTime()) // Sort by date a to be where
                                                .slice(0, 9) // Keep only most recent entries
                                                .map((job) => (

                                                    <SjTable
                                                    key={job.orderId}
                                                    {...job}/>
                                            ))}
                                        </div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "salestab" && (
                    <div>
                        <div className={`newsalediv ${showNewSaleBox ? "open" : ""}`}>
                            <NewSaleBox
                                action={() => setShowNewSaleBox(prev => !prev)}
                                onSaleCreated={fetchSales}
                            />
                        </div>
                        <div className="ordersmargin">
                            <div className="salescontainer">

                                    <LookupTable
                                        action={()=> setShowNewSaleBox(prev => !prev)}
                                        onEntryCreated={fetchSales}
                                        onSearch={searchSales}/>
        
                            
                                <div>

                                    {sales.length <= 0
                                    ? (<div className="unpopulated">
                                            <span>There are no sales yet. Click add new to get started!</span>
                                        </div>)
                                    : (<div className="salesgrid">
                                            {displayedSales.slice() // Make copy
                                                .sort((a, b) => 
                                                    new Date(b.createdAt).getTime() - 
                                                    new Date(a.createdAt).getTime()) // Sort by date a to be where
                                                .slice(0, 9) // Keep only most recent entries
                                                .map((sale) => (

                                                    <SalesTable
                                                        key={sale.orderId}
                                                        {...sale}
                                                    />
                                            ))}
                                        </div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}