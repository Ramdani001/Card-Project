"use client";

import { CartItemDto } from "@/types/dtos/CartItemDto";
import { Stack } from "@mantine/core";
import { CartItemRow } from "../../Cart/CartItemRow";

interface CartItemRowsProps {
  cartItems: CartItemDto[];
  processingId: string | null;
  handleRemoveItem: (id: string) => void;
  handleUpdateQuantity: (id: string, qty: number) => void;
}

export const CartItemRows = ({ cartItems, processingId, handleRemoveItem, handleUpdateQuantity }: CartItemRowsProps) => {
  return (
    <Stack gap="md">
      {cartItems.map((item) => (
        <CartItemRow key={item.id} item={item} processingId={processingId} onRemove={handleRemoveItem} onUpdate={handleUpdateQuantity} />
      ))}
    </Stack>
  );
};
