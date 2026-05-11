import { generateOtpHtml, generateReceiptHtml } from "@/config/emailConfig";
import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { TransactionWithDetails } from "@/types/dtos/TransactionWithDetailsDto";
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

export const sendOtpEmail = async (email: string, otpCode: string, name?: string): Promise<{ success: boolean; message: string }> => {
  try {
    let recipientEmail = email;

    const devEmails = process.env.EMAIL_DEV?.split(";").filter(Boolean);
    if (devEmails && devEmails.length > 0) {
      recipientEmail = devEmails.join(",");
    }

    const htmlContent = generateOtpHtml(otpCode, name);
    const subjectTitle = `${otpCode} adalah Kode Verifikasi Anda`;

    const emailLog = await prisma.emailHistory.create({
      data: {
        recipient: recipientEmail,
        subject: subjectTitle,
        status: "PENDING",
        body: htmlContent,
        provider: "Nodemailer-SMTP",
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

      return { success: true, message: "OTP sent successfully." };
    } catch (sendError: any) {
      await prisma.emailHistory.update({
        where: { id: emailLog.id },
        data: {
          status: "FAILED",
          errorMessage: sendError.message || "SMTP error during OTP send",
        },
      });

      logError("sendOtpEmail.SMTP", sendError);
      return { success: false, message: "Failed to send OTP email." };
    }
  } catch (error) {
    logError("sendOtpEmail.Internal", error);
    return { success: false, message: "Internal server error on OTP service." };
  }
};
