import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { CartItem, api } from "../lib/api";
import { useState } from "react";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total?: number;
  onCreateOrder: () => void;
}

export function Cart({
  isOpen,
  onClose,
  items = [],
  total = 0,
  onCreateOrder,
}: CartProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      await api.checkout();
      alert("Order placed successfully!");
      onCreateOrder();
      onClose();
    } catch (e) {
      alert("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Shopping Cart</SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Your cart is currently empty."
              : `You have ${items.length} items in your cart.`}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 space-y-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-4 items-center border-b pb-4 last:border-0"
            >
              {item.image && (
                <div className="h-16 w-16 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-neutral-500">
                  ${item.price} x {item.quantity}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-500"
              >
                ×
              </Button>
            </div>
          ))}

          {items.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between font-bold mb-4">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Processing..." : "Checkout"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
