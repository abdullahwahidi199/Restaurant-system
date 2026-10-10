// export default function OrderStats({ stats }) {
//   return (
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//       {stats.map((s) => (
//         <div key={s.label} className="bg-gray-200 p-4 rounded-xl shadow-md text-center">
//           <p className="text-gray-500">{s.label}</p>
//           <h2 className="text-2xl font-bold">{s.value}</h2>
//         </div>
//       ))}
//     </div>
//   );
// }

import { Card, CardContent } from "../../ui/card";

export default function OrderStats({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center justify-between p-3.5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide theme-text-muted">{item.label}</p>
              <h2 className="mt-1.5 text-2xl font-semibold theme-text-primary">{item.value}</h2>
            </div>
            {item.icon && <span className="erp-kpi-icon grid h-9 w-9 place-items-center rounded-lg bg-[var(--theme-primary-soft)]">{item.icon}</span>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
