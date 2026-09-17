'use client';

import { useState, useMemo } from 'react';
import { ShoppingCart, Search, Plus, Minus, X } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const PRODUCTS: Product[] = [
  {
    id: 'field-notes',
    title: 'Field Notes Notebook',
    price: 2499,
    image: '/products/field-notes.png',
  },
  {
    id: 'ceramic-cup',
    title: 'Ceramic Coffee Cup',
    price: 3499,
    image: '/products/ceramic-cup.png',
  },
  {
    id: 'canvas-tote',
    title: 'Canvas Tote Bag',
    price: 5999,
    image: '/products/canvas-tote.png',
  },
  {
    id: 'desk-lamp',
    title: 'Desk Lamp',
    price: 12999,
    image: '/products/desk-lamp.png',
  },
];

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/polar/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: '7f9b4691-7146-4520-8d9b-4d4961551255',
          amount: cartTotal,
          items: cart.map((item) => ({
            id: item.product.id,
            name: item.product.title,
            quantity: item.quantity,
            price: item.product.price,
          })),
        }),
      });

      const data = await response.json();
      const redirectUrl = data.url || data.checkoutUrl;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        console.error('Checkout API Error:', data);
        alert(`Failed to create checkout session: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight">Store</h1>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-lg text-muted-foreground">
              No products found. Try a different search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col rounded-lg border border-border bg-card p-4 transition-all hover:shadow-lg"
              >
                {/* Product Image */}
                <div className="mb-4 aspect-square overflow-hidden rounded-md bg-muted">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <h3 className="mb-2 line-clamp-2 font-semibold text-foreground">
                  {product.title}
                </h3>

                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-lg font-bold text-foreground">
                    ${(product.price / 100).toFixed(2)}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(product)}
                  className="mt-auto rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-end">
          <div
            className="w-full max-w-md rounded-t-2xl bg-card p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Shopping Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-1 hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Your cart is empty.
              </p>
            ) : (
              <>
                <div className="mb-6 space-y-4 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-4 border-b border-border pb-4"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">
                          {item.product.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${(item.product.price / 100).toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                          className="rounded p-1 hover:bg-secondary"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          className="rounded p-1 hover:bg-secondary"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="rounded p-1 hover:bg-secondary"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cart Total */}
                <div className="mb-6 space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${(cartTotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${(cartTotal / 100).toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cart.length === 0}
                  className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? 'Processing...' : 'Pay with Polar'}
                </button>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 w-full rounded-lg border border-border px-4 py-2 font-medium transition-colors hover:bg-secondary"
                >
                  Continue Shopping
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cart Overlay Close */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          onClick={() => setIsCartOpen(false)}
        />
      )}
    </div>
  );
}
