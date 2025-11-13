import { useState, useEffect } from "react";
import TablesDisplayModal from "../waiter/TablesDisplayModal";
import instance from "../../api/axiosInstance";

export default function HomePage() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
     


    const fetchTables = async () => {
        try {
            const res = await instance.get("/orders/tables/");
            
            const data =res.data;
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


       


    if (error){
        return(
            <p>{error}</p>
        )
    }
    return(
        <div>
           
            
            <TablesDisplayModal tables={tables} refetchTables={()=>fetchTables()}/>
        </div>
        
    )

}