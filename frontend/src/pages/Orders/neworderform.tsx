import { useAuth } from "@clerk/clerk-react";
import InputDropdown from "./inputdropdown";
import { useEffect } from "react";
import { useState } from "react";
import "./neworderform.css";

type sjBoxProps = {
    action: () => void;
    onSjCreated: () => void;
    existingJob?: ExistingStringJob | null;
}

interface Customer {
    customerId: number;
    customerName: string;
}

interface Racket {
    productId: number;
    productName: string;
}

interface TennisString {
    productId: number;
    productName: string;
    productPrice: number;
}

type CustomerEntry = {
    id: number;
    label: string;
}

type RacketEntry = {
    id: number;
    label: string;
}

type StringEntry = {
    id: number;
    label: string;
    price: number;
}

// Shape matches what Orders.tsx already fetches per string job
type ExistingStringJob = {
    orderId: number;
    customerId: number;
    customer: { customerId: number; customerName: string } | null;
    racketId: number;
    racket: { productId: number; productName: string } | null;
    tennisStringId: number;
    tennisString: { productId: number; productName: string; productPrice: number } | null;
    orderPrice: number;
    status: string;
    completedAt: string | null;
    expectedAt: string | null;
    mainTension: number;
    crossTension: number;
    isStoreOwned: boolean;
    isDeleted?: boolean;
}

const STATUS_OPTIONS = ["Collected", "InProgress", "Completed", "Cancelled", "Delivered"];

// Formats an ISO date string into yyyy-MM-dd for a native date input
function toDateInputValue(iso: string | null): string {
    if (!iso) return "";
    return new Date(iso).toISOString().slice(0, 10);
}

export default function NewSjBox({action, onSjCreated, existingJob}: sjBoxProps) {

    const { getToken } = useAuth();

    const isEditing = existingJob != null;

    const [customerSearch, setCustomerSearch] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] =
        useState<CustomerEntry | null>(null);

    const [racketSearch, setRacketSearch] = useState("");
    const [rackets, setRackets] = useState<Racket[]>([]);
    const [selectedRacket, setSelectedRacket] =
        useState<RacketEntry | null>(null);

    const [stringSearch, setStringSearch] = useState("");
    const [strings, setStrings] = useState<TennisString[]>([]);
    const [selectedString, setSelectedString] =
        useState<StringEntry | null>(null);

    const [mainTension, setMainTension] = useState<number>(50);
    const [crossTension, setCrossTension] = useState<number>(50);
    const [expectedDays, setExpectedDays] = useState<number>(7);
    const [expectedDate, setExpectedDate] = useState<string>(""); // yyyy-MM-dd, edit mode only
    const [laborCost, setLaborCost] = useState<number>(0);
    const [isStoreOwned, setIsStoreOwned] = useState<boolean>(true);
    const [status, setStatus] = useState<string>("Collected");

    // Normalize names and id's
    const customerEntries = customers.map(customer => ({
        id: customer.customerId,
        label: customer.customerName
    }));

    const racketEntries = rackets.map(racket => ({
        id: racket.productId,
        label: racket.productName
    }));

    const stringEntries = strings.map(string => ({
        id: string.productId,
        label: string.productName,
        price: string.productPrice
    }));

    // Pre-fill everything when handed a job to edit; reset when cleared
    useEffect(() => {
        if (existingJob) {
            setSelectedCustomer(existingJob.customer
                ? { id: existingJob.customer.customerId, label: existingJob.customer.customerName }
                : { id: existingJob.customerId, label: "Unknown customer" });
            setCustomerSearch(existingJob.customer?.customerName ?? "");

            setSelectedRacket(existingJob.racket
                ? { id: existingJob.racket.productId, label: existingJob.racket.productName }
                : { id: existingJob.racketId, label: "Unknown racket" });
            setRacketSearch(existingJob.racket?.productName ?? "");

            setSelectedString(existingJob.tennisString
                ? { id: existingJob.tennisString.productId, label: existingJob.tennisString.productName, price: existingJob.tennisString.productPrice }
                : { id: existingJob.tennisStringId, label: "Unknown string", price: 0 });
            setStringSearch(existingJob.tennisString?.productName ?? "");

            setMainTension(existingJob.mainTension);
            setCrossTension(existingJob.crossTension);
            setExpectedDate(toDateInputValue(existingJob.expectedAt));

            // Recover the labor cost portion from the stored order price
            const stringPrice = existingJob.tennisString?.productPrice ?? 0;
            setLaborCost(Math.max(0, existingJob.orderPrice - stringPrice));

            setIsStoreOwned(existingJob.isStoreOwned);
            setStatus(existingJob.status);
        } else {
            setSelectedCustomer(null); setCustomerSearch("");
            setSelectedRacket(null); setRacketSearch("");
            setSelectedString(null); setStringSearch("");
            setMainTension(50);
            setCrossTension(50);
            setExpectedDays(7);
            setExpectedDate("");
            setLaborCost(0);
            setIsStoreOwned(true);
            setStatus("Collected");
        }
    }, [existingJob]);

    const handleCustomerSearch = async () => {

        const token = await getToken({
            template: "api"
        });

        if (customerSearch.length < 2) {
            setCustomers([]);
            return;
        }

        fetch(`${API_URL}/api/customers/search?query=${customerSearch}`, {
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                // Deduplication of results where name and email match by choosing only the first occurrence of an ID
                const uniqueCustomerEntries = data.filter(
                    (customer, index, self) =>
                        // If indexes match, the entry is doubled, and one of them is dropped
                        index === self.findIndex(
                            c => c.customerId === customer.customerId
                    )
                );

            setCustomers(uniqueCustomerEntries)
            });
    }

    useEffect(() => {
        handleCustomerSearch();
    }, [customerSearch, selectedCustomer])

    const handleRacketSearch = async () => {
        const token = await getToken({
            template: "api"
        });

        if (racketSearch.length < 2) {
            setRackets([]);
            return;
        }

        fetch(`${API_URL}/api/inventory/racket/search?query=${racketSearch}`, {
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                const uniqueRacketEntries = data.filter(
                    (racket, index, self) =>
                        index === self.findIndex(
                            r => r.racketId === racket.racketId
                    )
                );

            setRackets(uniqueRacketEntries)
            })
    }

    useEffect(() => {
        handleRacketSearch();
    }, [racketSearch, selectedRacket])

    const handleStringSearch = async () => {
        const token = await getToken({
            template: "api"
        })

        if (stringSearch.length < 2) {
            setStrings([]);
            return;
        }

        fetch(`${API_URL}/api/inventory/string/search?query=${stringSearch}`, {
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                const uniqueStringEntries = data.filter(
                    (string, index, self) =>
                        index === self.findIndex(
                            s => s.tennisStringId === string.tennisStringId
                    )
                );

            setStrings(uniqueStringEntries)
            })
    }

    useEffect(() => {
        handleStringSearch();
    }, [stringSearch, selectedString])

    async function handleSubmit() {

        if (!selectedCustomer || !selectedRacket || !selectedString) return;

        const token = await getToken({
            template: "api"
        });

        let expectedAtIso: string;
        if (isEditing) {
            if (!expectedDate) return;
            expectedAtIso = new Date(expectedDate + "T00:00:00.000Z").toISOString();
        } else {
            const expectedAt = new Date();
            expectedAt.setUTCDate(expectedAt.getUTCDate() + expectedDays);
            expectedAtIso = expectedAt.toISOString();
        }

        // Only flips CompletedAt to "now" the moment status becomes Completed;
        // otherwise carries forward whatever it already was
        const completedAt = isEditing
            ? (status === "Completed"
                ? (existingJob!.completedAt ?? new Date().toISOString())
                : existingJob!.completedAt)
            : null;

        const basePayload = {
            racketId: selectedRacket.id,
            tennisStringId: selectedString.id,
            mainTension: mainTension,
            crossTension: crossTension,
            expectedAt: expectedAtIso,
            isStoreOwned: isStoreOwned,
            status: status,
            orderPrice: selectedString.price + laborCost,
            completedAt: completedAt
        };

        const url = isEditing
            ? `${API_URL}/api/strung/${existingJob!.orderId}`
            : "${API_URL}/api/strung";

        const stringJob = isEditing
            ? { ...existingJob, ...basePayload, isDeleted: existingJob!.isDeleted ?? false }
            : { customerId: selectedCustomer.id, ...basePayload };

        const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(stringJob)
        });

        if (response.ok) {
            console.log(isEditing ? "String job updated." : "String job added to db.");
        }

        onSjCreated();
        action();
        setMainTension(50);
        setCrossTension(50);
        setExpectedDays(7);
        setExpectedDate("");
        setLaborCost(0);
        setIsStoreOwned(true);
        setStatus("Collected");
        setRacketSearch(""); setRackets([]); setSelectedRacket(null);
        setStringSearch(""); setStrings([]); setSelectedString(null);
        setCustomerSearch(""); setCustomers([]); setSelectedCustomer(null);
    }

    return (
        <div>
            <div className="formcontainer">

                <div className="formcontents">

                    <div className="newOrderTopRow">
                        <span className='addnewspan'>{isEditing ? "Edit String Job" : "Add New String Job"}</span>
                    </div>
                    
                    <div className="forminputs">
                        <div className="forminput">
                            <span>Customer:</span>
                            {isEditing ? (
                                <input type="text" value={customerSearch} disabled />
                            ) : (
                                <InputDropdown
                                    inputPlaceholder="Search customer..."
                                    list="customers"
                                    search={customerSearch}
                                    entries={customerEntries}
                                    setSearch={setCustomerSearch}
                                    setSelected={setSelectedCustomer}
                                    counter={false}
                                />
                            )}
                        </div>
                        <div className="forminput">
                                <span>Racket:</span>
                                <InputDropdown
                                    inputPlaceholder="Search racket..."
                                    list="rackets"
                                    search={racketSearch}
                                    entries={racketEntries}
                                    setSearch={setRacketSearch}
                                    setSelected={setSelectedRacket}
                                    counter={false}
                                />
                        </div>
                        <div className="forminput">
                                <span>String:</span>
                                <InputDropdown
                                    inputPlaceholder="Search string..."
                                    list="strings"
                                    search={stringSearch}
                                    entries={stringEntries}
                                    setSearch={setStringSearch}
                                    setSelected={setSelectedString}
                                    counter={false}
                                />
                        </div>
                        <div className="forminput">
                            <span>Labor Cost:</span>
                            <input
                                type="number"
                                value={laborCost}
                                onChange={(e) => setLaborCost(Number(e.target.value))}
                                placeholder="Enter labor cost..."
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="forminputs">
                            <div className="forminput">
                                <span>Status:</span>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="forminputs">
                        <div className="forminput">
                            <span>Main Tension (Vertical):</span>
                            <input
                                type="number"
                                value={mainTension}
                                onChange={(e) => setMainTension(Number(e.target.value))}
                                placeholder="Enter tension..."
                                min="0"
                            />
                        </div>
                        <div className="forminput">
                            <span>Cross Tension (Horizontal):</span>
                            <input
                                type="number"
                                value={crossTension}
                                onChange={(e) => setCrossTension(Number(e.target.value))}
                                placeholder="Enter tension..."
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="forminputs">
                        <div className="forminput">
                            {isEditing ? (
                                <>
                                    <span>Expected Date:</span>
                                    <input
                                        type="date"
                                        value={expectedDate}
                                        onChange={(e) => setExpectedDate(e.target.value)}
                                    />
                                </>
                            ) : (
                                <>
                                    <span>Expected Days:</span>
                                    <input
                                        type="number"
                                        value={expectedDays}
                                        onChange={(e) => setExpectedDays(Number(e.target.value))}
                                        placeholder="Days until completion..."
                                        min="1"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="forminputs">
                        <div className="forminput">
                            <span>String Ownership:</span>
                            <div className="stringownerinput">
                                <label>
                                    <input
                                        type="radio"
                                        name="ownership"
                                        checked={isStoreOwned}
                                        onChange={() => setIsStoreOwned(true)}
                                    />
                                    Store-Owned
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="ownership"
                                        checked={!isStoreOwned}
                                        onChange={() => setIsStoreOwned(false)}
                                    />
                                    Customer-Owned
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="formbuttons">
                        <button 
                            className='addsale'
                            onClick={handleSubmit}>
                                {isEditing ? "Save Changes" : "Add String Job"}
                        </button>
                        <button 
                            className='cancel'
                            onClick={action}>
                                Cancel
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}