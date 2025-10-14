export default function OrderStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-gray-200 p-4 rounded-xl shadow-md text-center">
          <p className="text-gray-500">{s.label}</p>
          <h2 className="text-2xl font-bold">{s.value}</h2>
        </div>
      ))}
    </div>
  );
}
