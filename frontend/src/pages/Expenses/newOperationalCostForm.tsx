import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";

interface expenseProps {
    onCancel: () => void;
    onTransactionCreated: () => void;
}

export default function NewExpenseForm({onCancel, onTransactionCreated}: expenseProps){

    const { getToken } = useAuth();

    const [price, setPrice] = useState<number>(0);
    const [note, setNote] = useState<string>("");

    async function handleSubmit() {

        const token = await getToken({
            template: "api"
        });

        const transaction = {
            transactionValue: price,
            description: note,
            transactionCategory: "OperationalCost"
        };

        const response = await fetch("http://localhost:5000/api/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(transaction)
        });

        if (response.ok) {
            console.log("Transaction added to db.");
        }

        setPrice(0); setNote("");
        onCancel(); onTransactionCreated();
    }

    return (
        <div className="formcontainer">
            <div className="formcontents">
                <div className="forminputs">
                    <div className="forminput">
                        <span>Add expense cost</span>
                        <input
                            placeholder="e.g. 200"
                            type="number"
                            value={price}
                            min="0"
                            step="1"
                            onChange={(e) => setPrice(Number(e.target.value))}    
                        />
                    </div>
                    <div className="forminput">
                        <span>Add expense description</span>
                        <input
                            placeholder="Origin: bill paid"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>
                <div className="formbuttons">
                    <button 
                        onClick={handleSubmit}
                        className="addcustomer">
                            Add Expense
                    </button>
                    <button
                        onClick={onCancel} 
                        className="cancel">
                            Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}