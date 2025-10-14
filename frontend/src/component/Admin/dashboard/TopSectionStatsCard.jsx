import { Card,CardContent } from "../../ui/card"

export default function TopSectionStats({stats}){
    return(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {stats.map((item, idx) => (
                  <Card key={idx} className="shadow-sm">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <h2 className="text-2xl font-bold text-gray-800">{item.value}</h2>
                      </div>
                      {item.icon}
                    </CardContent>
                  </Card>
                ))}
              </div>
    )
}