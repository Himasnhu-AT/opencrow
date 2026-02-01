import { useState } from "react";
import { OpenCrowWidget } from "@opencrow/ui";
import "@opencrow/ui/styles.css";
import ProductGrid from "./components/ProductGrid";
import OrderList from "./components/OrderList";
import { Cart } from "./components/Cart";
import { Button } from "./components/ui/button";
import { ShoppingCart, User } from "lucide-react";

const UserIcon = User as any;
const ShoppingCartIcon = ShoppingCart as any;

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems] = useState([
    {
      name: "Wireless Headphones",
      price: 99.99,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
    },
  ]);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-900">
            ShopDemo
          </span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 text-sm font-medium text-neutral-600">
            <a href="#" className="hover:text-black transition-colors">
              Products
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Collections
            </a>
            <a href="#" className="hover:text-black transition-colors">
              About
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">John Doe</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCartIcon className="h-4 w-4" />
              Cart ({cartItems.length})
            </Button>
          </div>
        </div>
      </header>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
      />

      <main className="container mx-auto py-10 px-4">
        {/* AI Agent Hint */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-8 rounded-2xl mb-12 text-center shadow-lg">
          <h3 className="text-2xl font-bold mb-2">💬 Try the AI Assistant!</h3>
          <p className="opacity-90 mb-6">
            Click the chat button in the bottom right to interact with your
            orders, subscription, and products using natural language.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
              "Show my recent orders"
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
              "Open my cart"
            </span>
            <span className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
              "Find wireless headphones"
            </span>
          </div>
        </div>

        {/* Products Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Featured Products
          </h2>
          <ProductGrid />
        </section>

        {/* Orders Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Your Orders
          </h2>
          <OrderList />
        </section>
      </main>

      {/* OpenCrow Widget */}
      <OpenCrowWidget
        productId="prod_1769552599897"
        apiUrl="http://localhost:3001"
        agentName="Shopping Assistant"
        tools={{
          navigate_to_page: ({ page }: { page: string }) => {
            console.log("Navigating to:", page);
            alert(`Agent requested navigation to: ${page}`);
            window.location.hash = page;
            return { success: true };
          },
          open_cart: () => {
            console.log("Opening cart");
            setIsCartOpen(true);
            return { success: true, message: "Cart opened" };
          },
        }}
      />
    </div>
  );
}

export default App;
