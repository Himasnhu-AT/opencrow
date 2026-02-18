import { useEffect, useState } from "react";
import { api, Product } from "../lib/api";

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const addToCart = async (productId: string) => {
    try {
      await api.addToCart(productId, 1);
      alert("Added to cart!");
      // Ideally trigger a cart refresh here
      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) {
      alert("Failed to add to cart");
    }
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow"
        >
          <div className="aspect-video relative mb-4 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={
                product.image ||
                `https://placehold.co/600x400?text=${encodeURIComponent(product.name)}`
              }
              alt={product.name}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-neutral-500">{product.category}</p>
            </div>
            <span className="font-bold text-lg">${product.price}</span>
          </div>
          <button
            className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-neutral-800 transition-colors mt-2"
            onClick={() => addToCart(product.id)}
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}
