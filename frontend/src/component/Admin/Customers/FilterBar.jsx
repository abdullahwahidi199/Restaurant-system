import { Search } from "lucide-react";

export default function FilterBar({searchTerm,setSearchTerm,dateFilter,setDateFilter,onSearch}){

    const handleChange=(e)=>{
        setDateFilter(
            {...dateFilter,[e.target.name]:e.target.value}
        )
    }
    return(
        <div className="bg-white p-4 rounded-xl shadow flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Search size={18} />
        <input
          type="text"
          name="search"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}
          className="border rounded-lg px-3 py-1 focus:outline-none"
        />
      </div>

      

      <div className="flex gap-2">
        <label htmlFor="">From:</label>
        <input
          type="date"
          name="from"
          value={dateFilter.from}
          onChange={handleChange}
          className="border cursor-pointer rounded-lg px-2 py-1"
        />
        <label htmlFor="">To:</label>
        <input
          type="date"
          name="to"
          value={dateFilter.to}
          onChange={handleChange}
          className="border cursor-pointer rounded-lg px-2 py-1"
        />
      </div>

      <button
        onClick={onSearch}
        className="bg-blue-600 cursor-pointer text-white px-4 py-1.5 rounded-lg hover:bg-blue-700"
      >
        Apply
      </button>
    </div>
  );
}