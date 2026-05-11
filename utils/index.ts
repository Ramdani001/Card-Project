import { CartItemDto } from "@/types/dtos/CartItemDto";

export const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const getCardName = (item: CartItemDto) => item.card?.name || "Unknown Item";
export const getCardStock = (item: CartItemDto) => Number(item.card?.stock || 0);
export const getCardType = (item: CartItemDto) => item.card?.categories?.[0]?.category?.name || "General";
export const getCardImage = (item: CartItemDto) => item.card?.images?.[0]?.url || "https://placehold.co/60?text=No+Img";
export const getCardPrice = (item: CartItemDto) => Number(item.card?.price || 0);

export const generateOtpCode = () => Math.floor(100000 + Math.random() * 900000).toString();
