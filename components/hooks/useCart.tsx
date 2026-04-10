import { CardDto } from "@/types/dtos/CardDto";
import { CartItemDto } from "@/types/dtos/CartItemDto";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useCart() {
  const { status } = useSession();
  const [cartItems, setCartItems] = useState<CartItemDto[]>([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchCart = async () => {
    if (status !== "authenticated") return;
    setLoadingCart(true);
    try {
      const res = await fetch("/api/cart");
      const json = await res.json();
      if (res.ok) {
        if (Array.isArray(json.data)) setCartItems(json.data);
        else if (json.data?.items) setCartItems(json.data.items);
        else setCartItems([]);
      }
    } catch (error) {
      console.error("Cart error", error);
    } finally {
      setLoadingCart(false);
    }
  };

  const handleAddToCart = async (product: CardDto) => {
    if (status !== "authenticated") {
      notifications.show({ title: "Login Required", message: "Please log in to start shopping.", color: "red" });
    }

    setLoadingAction(product.id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: product.id, quantity: 1 }),
      });

      if (res.ok) {
        notifications.show({
          title: "Added to Cart",
          message: "Item successfully added to your cart.",
          color: "teal",
          icon: <IconCheck size={16} />,
        });
        fetchCart();
      } else {
        const json = await res.json();
        throw new Error(json.message || "Failed to add item to cart");
      }
    } catch (error: any) {
      notifications.show({ title: "Error", message: error.message, color: "red" });
    } finally {
      setLoadingAction(null);
    }
  };

  return {
    cartItems,
    fetchCart,
    setLoadingAction,
    loadingAction,
    setLoadingCart,
    loadingCart,
    handleAddToCart,
    setCartItems,
  };
}
