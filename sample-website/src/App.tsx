import { useState, useEffect, useCallback } from "react";
import { OpenCrowWidget } from "@opencrow/ui";
import "@opencrow/ui/styles.css";
import ProductGrid from "./components/ProductGrid";
import OrderList from "./components/OrderList";
import { Cart } from "./components/Cart";
import NotFound from "./components/NotFound";
import { Button } from "./components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import { api, CartItem } from "./lib/api";

const UserIcon = User as any;
const ShoppingCartIcon = ShoppingCart as any;

type Page = "home" | "orders";

function App() {
  const [currentPage, setCurrentPage] = useState<Page | "404">("home");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  const fetchCart = () => {
    api.getCart().then((cart) => {
      setCartItems(cart.items);
      setCartTotal(cart.total);
    });
  };

  useEffect(() => {
    fetchCart();

    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  const navigateTo = useCallback((page: string) => {
    if (page === "home" || page === "orders") {
      setCurrentPage(page as Page);
      return true;
    }
    setCurrentPage("404");
    return false;
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case "home":
        return (
          <>
            {/* AI Agent Hint */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-8 rounded-2xl mb-12 text-center shadow-lg">
              <h3 className="text-2xl font-bold mb-2">
                💬 Try the AI Assistant!
              </h3>
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
          </>
        );
      case "orders":
        return (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              Your Orders
            </h2>
            <OrderList />
          </section>
        );
      case "404":
        return <NotFound onNavigate={navigateTo} />;
      default:
        return <NotFound onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigateTo("home")}
        >
          <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-900">
            ShopDemo
          </span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 text-sm font-medium text-neutral-600">
            <button
              onClick={() => navigateTo("home")}
              className={`hover:text-black transition-colors ${currentPage === "home" ? "text-black font-semibold" : ""}`}
            >
              Products
            </button>
            <button
              onClick={() => navigateTo("orders")}
              className={`hover:text-black transition-colors ${currentPage === "orders" ? "text-black font-semibold" : ""}`}
            >
              Orders
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">John Doe</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCartIcon className="h-4 w-4" />
              Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
            </Button>
          </div>
        </div>
      </header>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        total={cartTotal}
        onCreateOrder={() => {
          fetchCart();
          // Refresh orders list
          window.dispatchEvent(new Event("order-created"));
        }}
      />

      <main className="container mx-auto py-10 px-4">{renderContent()}</main>

      {/* OpenCrowWidget */}
      <OpenCrowWidget
        productId="prod_1771310164218"
        apiUrl="http://localhost:3001"
        agentName="Shopping Assistant"
        tools={{
          navigate_to_page: ({ page }: { page: string }) => {
            console.log("Navigating to:", page);
            // Example mapping of loose terms to exact routes
            let targetPage = page.toLowerCase();
            if (targetPage.includes("home") || targetPage.includes("product"))
              targetPage = "home";
            else if (targetPage.includes("order")) targetPage = "orders";

            const success = navigateTo(targetPage);

            if (success) {
              return { success: true, message: `Navigated to ${targetPage}` };
            } else {
              // Throwing an error string as requested so the agent knows it failed
              throw new Error(
                `Page '${page}' not found. Available pages: 'home', 'orders'.`,
              );
            }
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
