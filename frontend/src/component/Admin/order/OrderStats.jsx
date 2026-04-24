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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
      {stats.map((item, idx) => (
        <Card key={idx} className="shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <h2 className="text-2xl font-bold text-gray-800">{item.value}</h2>
            </div>
            {item.icon && item.icon}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
