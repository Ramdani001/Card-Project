import { TransactionWithDetails } from "@/types/dtos/TransactionWithDetailsDto";
import { formatDate, formatRupiah } from "@/utils";

export const generateReceiptHtml = (transaction: TransactionWithDetails): string => {
  const itemsHtml = transaction.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatRupiah(Number(item.subTotal))}</td>
        </tr>
      `
    )
    .join("");

  const voucherHtml =
    Number(transaction.voucherAmount) > 0
      ? `
        <tr>
          <td colspan="2" style="padding: 8px; text-align: right;"><strong>Discount (Voucher):</strong></td>
          <td style="padding: 8px; text-align: right; color: red;">- ${formatRupiah(Number(transaction.voucherAmount))}</td>
        </tr>
      `
      : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Payment Receipt</h2>
      <p>Hi ${transaction.customerName || "Customer"},</p>
      <p>Thank you for your payment. Here are the details of your transaction:</p>
      
      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td><strong>Invoice:</strong> ${transaction.invoice}</td>
          <td style="text-align: right;"><strong>Date:</strong> ${formatDate(transaction.createdAt.toDateString())}</td>
        </tr>
        <tr>
          <td><strong>Status:</strong> <span style="color: green; font-weight: bold;">${transaction.status}</span></td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 8px; text-align: right;"><strong>Subtotal:</strong></td>
            <td style="padding: 8px; text-align: right;">${formatRupiah(Number(transaction.subTotal))}</td>
          </tr>
          ${voucherHtml}
          <tr>
            <td colspan="2" style="padding: 8px; text-align: right; font-size: 1.1em;"><strong>Total Paid:</strong></td>
            <td style="padding: 8px; text-align: right; font-size: 1.1em;"><strong>${formatRupiah(Number(transaction.totalPrice))}</strong></td>
          </tr>
        </tfoot>
      </table>

      <p style="font-size: 0.9em; color: #666; text-align: center;">
        If you have any questions, please contact our support.
      </p>
    </div>
  `;
};

export const generateOtpHtml = (otpCode: string, name: string = "User"): string => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px; color: #333;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #2563eb; margin: 0;">Account Verification</h2>
        <p style="color: #666;">Toko Kartu - Account Security</p>
      </div>
      
      <p>Hello <strong>${name}</strong>,</p>
      <p>Thank you for registering. Please use the verification code below to complete your registration process:</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 10px; margin: 25px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otpCode}</span>
      </div>
      
      <p style="font-size: 0.85em; color: #ef4444; text-align: center;">
        <strong>Important:</strong> This code will expire in 10 minutes. 
        Do not share this code with anyone, including staff from Toko Kartu.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;" />
      
      <p style="font-size: 0.8em; color: #9ca3af; text-align: center;">
        If you did not request this registration, please ignore this email.
      </p>
    </div>
  `;
};
