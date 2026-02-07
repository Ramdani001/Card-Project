import { CardDetail } from "./CardDetail";
import { TypeCard } from "./TypeCard";

export interface CardData {
  idCard: number;
  idDetail?: number;
  typeCard?: TypeCard;
  detail?: CardDetail;
}
