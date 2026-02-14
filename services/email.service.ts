import { Prisma } from "@/prisma/generated/prisma/client";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

type TransactionWithDetails = Prisma.TransactionGetPayload<{
  include: { items: true; user: true; voucher: true };
}>;

export const sendTransactionReceipt = async (transaction: TransactionWithDetails) => {
  if (!transaction.customerEmail && !transaction.user?.email) {
    return;
  }

  const recipientEmail = transaction.customerEmail || transaction.user?.email;
  const itemsHtml = transaction.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(Number(item.subTotal))}</td>
    </tr>
  `
    )
    .join("");

  const voucherHtml =
    Number(transaction.voucherAmount) > 0
      ? `
    <tr>
      <td colspan="2" style="padding: 8px; text-align: right;"><strong>Discount (Voucher):</strong></td>
      <td style="padding: 8px; text-align: right; color: red;">- ${formatCurrency(Number(transaction.voucherAmount))}</td>
    </tr>
  `
      : "";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Payment Receipt</h2>
      <p>Hi ${transaction.customerName || "Customer"},</p>
      <p>Thank you for your payment. Here are the details of your transaction:</p>
      
      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td><strong>Invoice:</strong> ${transaction.invoice}</td>
          <td style="text-align: right;"><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleDateString("id-ID")}</td>
        </tr>
        <tr>
          <td><strong>Status:</strong> <span style="color: green; font-weight: bold;">PAID</span></td>
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
            <td style="padding: 8px; text-align: right;">${formatCurrency(Number(transaction.subTotal))}</td>
          </tr>
          ${voucherHtml}
          <tr>
            <td colspan="2" style="padding: 8px; text-align: right; font-size: 1.1em;"><strong>Total Paid:</strong></td>
            <td style="padding: 8px; text-align: right; font-size: 1.1em;"><strong>${formatCurrency(Number(transaction.totalPrice))}</strong></td>
          </tr>
        </tfoot>
      </table>

      <p style="font-size: 0.9em; color: #666; text-align: center;">
        If you have any questions, please contact our support.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Store Name" <${process.env.SMTP_USER}>`,
      to: recipientEmail!,
      subject: `Payment Receipt - ${transaction.invoice}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send receipt email:", error);
  }
};
