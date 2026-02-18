export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface Order {
  id: string;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: CartItem[];
  createdAt: string;
}

const API_BASE = "http://localhost:3002/api";

export const api = {
  getProducts: async (
    category?: string,
    query?: string,
  ): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (query) params.append("query", query);
    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },

  getCart: async (): Promise<Cart> => {
    const res = await fetch(`${API_BASE}/cart`);
    if (!res.ok) throw new Error("Failed to fetch cart");
    return res.json();
  },

  addToCart: async (
    productId: string,
    quantity: number = 1,
  ): Promise<{ message: string; cart: Cart }> => {
    const res = await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) throw new Error("Failed to add to cart");
    return res.json();
  },

  clearCart: async (): Promise<{ message: string; cart: Cart }> => {
    const res = await fetch(`${API_BASE}/cart`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to clear cart");
    return res.json();
  },

  getOrders: async (): Promise<Order[]> => {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },

  checkout: async (): Promise<Order> => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to checkout");
    return res.json();
  },
};
