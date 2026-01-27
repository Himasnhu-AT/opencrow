import { OpenCrowWidget } from "@opencrow/ui";
import "@opencrow/ui/styles.css";
import Header from "./components/Header";
import ProductGrid from "./components/ProductGrid";
import OrderList from "./components/OrderList";

function App() {
  return (
    <>
      <Header />

      <div className="container">
        {/* AI Agent Hint */}
        <div className="chat-hint">
          <h3>💬 Try the AI Assistant!</h3>
          <p>
            Click the chat button in the bottom right to interact with your
            orders, subscription, and products using natural language.
          </p>
          <div className="chat-examples">
            <span className="example-pill">"Show my recent orders"</span>
            <span className="example-pill">"Cancel order #12345"</span>
            <span className="example-pill">"Find wireless headphones"</span>
            <span className="example-pill">"Cancel my subscription"</span>
          </div>
        </div>

        {/* Products Section */}
        <section className="section">
          <h2>Featured Products</h2>
          <ProductGrid />
        </section>

        {/* Orders Section */}
        <section className="section">
          <h2>Your Orders</h2>
          <OrderList />
        </section>
      </div>

      {/* OpenCrow Widget */}
      <OpenCrowWidget
        productId="prod_1769552599897"
        apiUrl="http://localhost:3001"
        agentName="Shopping Assistant"
      />
    </>
  );
}

export default App;
