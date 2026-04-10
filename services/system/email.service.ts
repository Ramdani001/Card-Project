import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { formatDate, formatRupiah } from "@/utils";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  pool: true,
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
});

type TransactionWithDetails = Prisma.TransactionGetPayload<{
  include: { items: true; user: true; voucher: true };
}>;

const generateReceiptHtml = (transaction: TransactionWithDetails): string => {
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

export const sendTransactionReceipt = async (transaction: TransactionWithDetails): Promise<{ success: boolean; message: string }> => {
  try {
    let recipientEmail = transaction.customerEmail || transaction.user?.email;

    const devEmails = process.env.EMAIL_DEV?.split(";").filter(Boolean);
    if (devEmails && devEmails.length > 0) {
      recipientEmail = devEmails.join(",");
    }

    if (!recipientEmail) {
      return { success: false, message: "No recipient email found." };
    }

    const htmlContent = generateReceiptHtml(transaction);
    const subjectTitle = `Payment Receipt - ${transaction.invoice}`;

    const emailLog = await prisma.emailHistory.create({
      data: {
        recipient: recipientEmail,
        subject: subjectTitle,
        status: "PENDING",
        body: htmlContent,
        provider: "Nodemailer-SMTP",
        transactionId: transaction?.id,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: `"TOKO-KARTU" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: subjectTitle,
        html: htmlContent,
      });

      await prisma.emailHistory.update({
        where: { id: emailLog.id },
        data: {
          status: "SUCCESS",
          errorMessage: `MessageID: ${info.messageId}`,
        },
      });

      return { success: true, message: "Receipt sent successfully." };
    } catch (sendError: any) {
      await prisma.emailHistory.update({
        where: { id: emailLog.id },
        data: {
          status: "FAILED",
          errorMessage: sendError.message || "Unknown SMTP error",
        },
      });

      logError("sendTransactionReceipt", sendError);
      return { success: false, message: "Failed to send email." };
    }
  } catch (error) {
    logError("sendTransactionReceipt", error);
    return { success: false, message: "Internal server error." };
  }
};
