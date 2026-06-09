import { CardDto } from "./CardDto";

export interface VoucherCardDto {
  id: string;
  voucherId: string;
  cardId: string;
  card: CardDto;
  createdAt: string | Date;
  updatedAt: string | Date;
}
