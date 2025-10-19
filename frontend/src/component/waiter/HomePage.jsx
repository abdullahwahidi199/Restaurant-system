import { useState, useEffect } from "react";
import TablesDisplayModal from "../waiter/TablesDisplayModal";

export default function HomePage() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
     


    const fetchTables = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/orders/tables/");
            if (!res.ok) throw new Error("Failed to fetch tables");
            const data = await res.json();
            setTables(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Loading tables...</p>
            </div>
        );


       


    return(
        <div>
           
            
            <TablesDisplayModal tables={tables} refetchTables={()=>fetchTables()}/>
        </div>
        
    )

}