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
          <td style="padding: 8px; text-align: right; color: #d9534f;">- ${formatRupiah(Number(transaction.voucherAmount))}</td>
        </tr>
      `
      : "";

  const deliveryInfoHtml =
    transaction.deliveryMethod === "PICKUP"
      ? `
        <div style="background-color: #f0f7ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #007bff;">
          <h4 style="margin: 0 0 5px 0; color: #007bff;">Pickup Information</h4>
          <p style="margin: 0; font-size: 0.9em;">Please collect your order at: <strong>${transaction.shop?.name || "Main Store"}</strong></p>
          <p style="margin: 0; font-size: 0.9em; color: #666;">Note: Bring this email as proof of purchase.</p>
        </div>
      `
      : `
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #28a745;">
          <h4 style="margin: 0 0 10px 0; color: #28a745;">Shipping Information</h4>
          <table style="width: 100%; font-size: 0.9em; border-collapse: collapse;">
            <tr>
              <td width="120" style="color: #666; padding-bottom: 5px;">Expedition:</td>
              <td style="padding-bottom: 5px;"><strong>${transaction.expedition || "-"}</strong></td>
            </tr>
            <tr>
              <td style="color: #666; padding-bottom: 5px;">Resi Number:</td>
              <td style="padding-bottom: 5px;"><strong>${transaction.resi || "-"}</strong></td>
            </tr>
            <tr>
              <td style="color: #666; vertical-align: top;">Shipping Address:</td>
              <td style="line-height: 1.5;">
                ${
                  transaction.transactionShipmentAddress.length
                    ? `
                      <strong>${transaction.customerName || "Recipient"}</strong><br />
                      ${transaction.transactionShipmentAddress[0]?.address}<br />
                      ${transaction.transactionShipmentAddress[0]?.villageName}, ${transaction.transactionShipmentAddress[0]?.subDistrictName}<br />
                      ${transaction.transactionShipmentAddress[0]?.cityName}, ${transaction.transactionShipmentAddress[0]?.provinceName}<br />
                      ${transaction.transactionShipmentAddress[0]?.postalCode}
                    `
                    : `
                        <strong>-</strong>
                      `
                }
              </td>
            </tr>
          </table>
        </div>
      `;

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; color: #333;">
      <h2 style="color: #333; text-align: center; border-bottom: 2px solid #eee; padding-bottom: 10px;">Payment Receipt</h2>
      
      <p>Hi <strong>${transaction.customerName || "Customer"}</strong>,</p>
      <p>Thank you for your payment. Your transaction has been processed successfully.</p>
      
      <table style="width: 100%; margin-bottom: 20px; font-size: 0.9em;">
        <tr>
          <td><strong>Invoice:</strong> ${transaction.invoice}</td>
          <td style="text-align: right;"><strong>Date:</strong> ${formatDate(transaction.createdAt.toString())}</td>
        </tr>
        <tr>
          <td><strong>Payment:</strong> ${transaction.paymentMethod || "-"}</td>
          <td style="text-align: right;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${transaction.status}</span></td>
        </tr>
      </table>

      ${deliveryInfoHtml}

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
            <td colspan="2" style="padding: 15px 8px 8px 8px; text-align: right;">Subtotal:</td>
            <td style="padding: 15px 8px 8px 8px; text-align: right;">${formatRupiah(Number(transaction.subTotal))}</td>
          </tr>
          ${voucherHtml}
          ${
            transaction.shippingCost.gt(0)
              ? `
          <tr>
            <td colspan="2" style="padding: 8px; text-align: right;">Shipping Cost:</td>
            <td style="padding: 8px; text-align: right;">${formatRupiah(Number(transaction.shippingCost))}</td>
          </tr>`
              : ""
          }
          <tr>
            <td colspan="2" style="padding: 8px; text-align: right; font-size: 1.2em;"><strong>Total Paid:</strong></td>
            <td style="padding: 8px; text-align: right; font-size: 1.2em; color: #007bff;"><strong>${formatRupiah(Number(transaction.totalPrice))}</strong></td>
          </tr>
        </tfoot>
      </table>

      <div style="text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
        <p style="font-size: 0.85em; color: #777;">
          If you have any questions regarding this invoice, please reply to this email or contact our support team.
        </p>
        <p style="font-weight: bold; color: #333;">Thank you for shopping with us!</p>
      </div>
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
