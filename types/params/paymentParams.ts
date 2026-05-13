export interface MidtransItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface PaymentTokenParams {
  id: string;
  totalPrice: number;
  customerName?: string;
  customerEmail?: string;
  items: MidtransItem[];
}

export interface MidtransNotificationDto {
  transaction_status: string;
  fraud_status?: string;
  order_id: string;
  gross_amount: string;
  status_code: string;
  signature_key: string;
  payment_type?: string;
  [key: string]: any;
}
