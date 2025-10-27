export default function CustomersTable({ customers }) {
  return (
    <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200 bg-white mt-4">
        
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-gray-800 uppercase text-xs font-semibold">
          <tr>
            {["Id", "Username", "Phone", "Address", "Email", "Gender","Joined at"].map((h) => (
              <th key={h} className="px-4 py-3 border-b">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {customers.map((c, index) => (
            <tr
              key={c.id}
              className={`transition-colors ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-blue-50`}
            >
              <td className="px-4 py-2 border-b">{c.id}</td>
              <td className="px-4 py-2 border-b font-medium text-gray-900">{c.username}</td>
              <td className="px-4 py-2 border-b">{c.phone}</td>
              {c.address ? (<td className="px-4 py-2 border-b">{c.address}</td>):(<tr>N/A</tr>)}
              {c.email ? (<td className="px-4 py-2 border-b">{c.email}</td>):(<tr>N/A</tr>)}
              {c.email ? (<td className="px-4 py-2 border-b">{c.email}</td>):(<tr>N/A</tr>)}
              <td className="px-4 py-2 border-b">
                {new Date(c.joined_at).toLocaleString("en-us",{
                    year:"numeric",
                    month:"short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })}
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
