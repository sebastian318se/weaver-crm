import { useState } from "react";
import { useEffect } from "react";
import InputDropdown from "./inputdropdown";
import "./neworderform.css";

type sjBoxProps = {
    action: () => void;
    onSjCreated: () => void;
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

export default function NewSjBox({action, onSjCreated}: sjBoxProps) {

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
    const [laborCost, setLaborCost] = useState<number>(0);
    const [isStoreOwned, setIsStoreOwned] = useState<boolean>(true);

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


    useEffect(() => {
        if (customerSearch.length < 2) {
            setCustomers([]);
            return;
        }

        fetch(`http://localhost:5000/api/customers/search?query=${customerSearch}`)
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
            })
    }, [customerSearch, selectedCustomer])

    useEffect(() => {
        if (racketSearch.length < 2) {
            setRackets([]);
            return;
        }

        fetch(`http://localhost:5000/api/inventory/racket/search?query=${racketSearch}`)
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
    }, [racketSearch, selectedRacket])

    useEffect(() => {
        if (stringSearch.length < 2) {
            setStrings([]);
            return;
        }

        fetch(`http://localhost:5000/api/inventory/string/search?query=${stringSearch}`)
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
    }, [stringSearch, selectedString])

    async function handleSubmit() {

        if (!selectedCustomer || !selectedRacket || !selectedString) return;

        const expectedAt = new Date();
        expectedAt.setUTCDate(expectedAt.getUTCDate() + expectedDays);

        const stringJob = {
            customerId: selectedCustomer.id,
            racketId: selectedRacket.id,
            tennisStringId: selectedString.id,
            mainTension: mainTension,
            crossTension: crossTension,
            expectedAt: expectedAt.toISOString(),
            isStoreOwned: true,
            
            status: "Collected", // Collected
            orderPrice: selectedString.price + laborCost
        };

        console.log(stringJob);

        const response = await fetch("http://localhost:5000/api/strung", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(stringJob)
        });

        if (response.ok) {
            console.log("String job added to db.");
            console.log(response);
        }

        onSjCreated();
        action();
        setMainTension(50);
        setCrossTension(50);
        setExpectedDays(7);
        setLaborCost(0);
        setIsStoreOwned(true);
        setRacketSearch(""); setRackets([]); setSelectedRacket(null);
        setStringSearch(""); setStrings([]); setSelectedString(null);
    }

    return (
        <div>
            <div className="formcontainer">

                <div className="formcontents">

                    <div className="newOrderTopRow">
                        <span className='addnewspan'>Add New String Job</span>
                    </div>
                    
                    <div className="forminputs">
                        <div className="forminput">
                            <span>Customer:</span>
                            <InputDropdown
                                inputPlaceholder="Search customer..."
                                list="customers"
                                search={customerSearch}
                                entries={customerEntries}
                                setSearch={setCustomerSearch}
                                setSelected={setSelectedCustomer}
                                counter={false}
                            />
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
                            <span>Expected Days:</span>
                            <input
                                type="number"
                                value={expectedDays}
                                onChange={(e) => setExpectedDays(Number(e.target.value))}
                                placeholder="Days until completion..."
                                min="1"
                            />
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
                                Add String Job
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