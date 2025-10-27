import { useEffect, useState } from "react"
import FilterBar from "./FilterBar"
import CustomersTable from "./CustomersTable"

export default function CustomersBaseModal() {
    const [customers, setCustomers] = useState([])
    const [searchTerm, setSearchTerm] = useState("")  // used for filtering based on name. this filter is handled in the frontnend
    const [dateFilter, setDateFilter] = useState({    // used for filtering based on data, this type of search is handled in the backend
        from: "",
        to: ""
    })
    const fetchAllCustomers = async () => {
        let query = new URLSearchParams(dateFilter).toString();

        const response = await fetch(`http://127.0.0.1:8000/customer/customers/?${query}`)
        const data = await response.json()
        setCustomers(data)
    }
    useEffect(() => {
        fetchAllCustomers()
    }, [])

    const filteredCustomers = customers.filter((c) =>
        c.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(customers)
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">All Customers</h2>
                <span className="text-sm text-gray-500">
                    Total Customers: <span className="font-medium text-gray-800">{filteredCustomers.length}</span>
                </span>
            </div>
            <FilterBar searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                dateFilter={dateFilter} setDateFilter={setDateFilter}
                onSearch={fetchAllCustomers}
            />

            <CustomersTable customers={filteredCustomers} />
        </div>
    )
}