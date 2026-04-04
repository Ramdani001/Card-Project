import prisma from "@/lib/prisma";

export const logError = async (service: string, error: any, context?: any) => {
  try {
    await prisma.errorLog.create({
      data: {
        service,
        message: error.message || "Unknown Error",
        stack: error.stack || null,
        context: context ? JSON.parse(JSON.stringify(context)) : null,
      },
    });
  } catch (logDbError) {
    console.error("Failed to save error log to DB", logDbError);
  }
};
