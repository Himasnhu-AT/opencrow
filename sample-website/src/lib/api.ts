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

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const API_BASE = "http://localhost:3002/api";

let token = localStorage.getItem("token");

const getHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  setToken: (newToken: string | null) => {
    token = newToken;
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  },

  getToken: () => token,

  login: async (
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }> => {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    return res.json();
  },

  register: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }> => {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Registration failed");
    }
    return res.json();
  },

  me: async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  },

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
    const res = await fetch(`${API_BASE}/cart`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch cart");
    return res.json();
  },

  addToCart: async (
    productId: string,
    quantity: number = 1,
  ): Promise<{ message: string; cart: Cart }> => {
    const res = await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) throw new Error("Failed to add to cart");
    return res.json();
  },

  clearCart: async (): Promise<{ message: string; cart: Cart }> => {
    const res = await fetch(`${API_BASE}/cart`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to clear cart");
    return res.json();
  },

  getOrders: async (): Promise<Order[]> => {
    const res = await fetch(`${API_BASE}/orders`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },

  checkout: async (): Promise<Order> => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to checkout");
    return res.json();
  },
};
