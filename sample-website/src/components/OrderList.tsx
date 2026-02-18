import { useEffect, useState } from "react";
import { api, Order } from "../lib/api";

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = () => {
    api.getOrders().then(setOrders);
  };

  useEffect(() => {
    fetchOrders();

    const handleOrderCreated = () => fetchOrders();
    window.addEventListener("order-created", handleOrderCreated);
    return () =>
      window.removeEventListener("order-created", handleOrderCreated);
  }, []);

  if (orders.length === 0) {
    return <div className="text-neutral-500">No orders found.</div>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold text-lg">Order {order.id}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium 
                    ${order.status === "delivered" ? "bg-green-100 text-green-700" : ""}
                    ${order.status === "shipped" ? "bg-blue-100 text-blue-700" : ""}
                    ${order.status === "pending" ? "bg-amber-100 text-amber-700" : ""}
                    ${order.status === "cancelled" ? "bg-red-100 text-red-700" : ""}
                `}
              >
                {order.status.toUpperCase()}
              </span>
            </div>
            <div className="text-neutral-500 text-sm mb-2">
              {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </div>
            <div className="text-neutral-600">
              {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
            </div>
          </div>
          <div className="text-xl font-bold">${order.total.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
