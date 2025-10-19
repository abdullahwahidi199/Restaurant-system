export default function OrderItem({ item }) {
    return (
        <div className={`py-2 flex justify-between items-center ${item.is_new ? "bg-green-50 border-l-4 border-green-400 pl-2" : ""
            }`}>
            <div>
                <p className="text-sm font-medium">{item.item_name}</p>
                <p className="text-xs text-gray-500">
                    {item.quantity} × {item.item_price} AFN
                </p>
            </div>
            <span className="text-sm font-semibold">{item.subtotal} AFN</span>
        </div>
    )
}