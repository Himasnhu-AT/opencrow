'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  openApiUrl: string;
  baseUrl: string;
  createdAt: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    openApiUrl: '',
    baseUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    const products = await fetch('http://localhost:3001/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (products.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }
    const data = await products.json();
    setProducts(data);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const createProduct = async () => {
    const productId = `prod_${Date.now()}`;
    const token = localStorage.getItem('token');

    try {
      await fetch('http://localhost:3001/api/config/' + productId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      setProducts([...products, {
        id: productId,
        ...formData,
        createdAt: new Date().toISOString()
      }]);

      setShowModal(false);
      setFormData({ name: '', openApiUrl: '', baseUrl: '' });
    } catch (e) {
      console.error("Failed to create product", e);
      alert("Failed to create product. Is backend running?");
    }
  };

  return (
    <div className="min-h-screen text-black bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl text-black font-bold">OpenCrow</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            + New Product
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">
              No products yet. Create one to get started!
            </div>
          )}
          {products.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-4">ID: {product.id}</p>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">API Spec:</span>
                  <p className="text-gray-600 truncate" title={product.openApiUrl}>{product.openApiUrl}</p>
                </div>
                <div>
                  <span className="font-medium">Base URL:</span>
                  <p className="text-gray-600 truncate" title={product.baseUrl}>{product.baseUrl}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Embed Code:</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {`<script
  src="http://localhost:5173/ai-agent-widget.umd.js"
  data-product-id="${product.id}"
  data-api-url="http://localhost:3001"
></script>`}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Create New Product</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="product-name">Product Name</label>
                  <input
                    id="product-name"
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="My E-commerce Store"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="openapi-url">OpenAPI Spec URL</label>
                  <input
                    id="openapi-url"
                    type="url"
                    value={formData.openApiUrl}
                    onChange={e => setFormData({ ...formData, openApiUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="http://localhost:8000/openapi.yaml"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="base-url">API Base URL</label>
                  <input
                    id="base-url"
                    type="url"
                    value={formData.baseUrl}
                    onChange={e => setFormData({ ...formData, baseUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="http://localhost:3002"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={createProduct}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  type="button"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
