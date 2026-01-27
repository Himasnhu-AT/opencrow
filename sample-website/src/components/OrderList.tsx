const orders = [
  {
    id: "ord-001",
    status: "delivered",
    total: 149.99,
    items: [{ name: "Wireless Headphones", quantity: 1 }],
    createdAt: "2025-01-15",
  },
  {
    id: "ord-002",
    status: "shipped",
    total: 349.98,
    items: [
      { name: "Smart Watch", quantity: 1 },
      { name: "USB-C Hub", quantity: 1 },
    ],
    createdAt: "2025-01-20",
  },
  {
    id: "ord-003",
    status: "pending",
    total: 49.99,
    items: [{ name: "Laptop Stand", quantity: 1 }],
    createdAt: "2025-01-22",
  },
];

export default function OrderList() {
  return (
    <div className="orders-list">
      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-info">
            <div>
              <strong>Order {order.id}</strong>
            </div>
            <div>
              Total: ${order.total} • {order.createdAt}
            </div>
            <div style={{ marginTop: 8, color: "#6b7280" }}>
              {order.items.map((i) => i.name).join(", ")}
            </div>
          </div>
          <span className={`order-status status-${order.status}`}>
            {order.status.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}
