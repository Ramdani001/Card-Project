import prisma from "@/lib/prisma";
import { hashPassword } from "@/helpers/auth.helper";
import { saveFile, deleteFile } from "@/helpers/file.helper";
import { logError } from "@/lib/logger";
import { generateOtpCode } from "@/utils";
import { sendOtpEmail } from "../system/email.service";
import { OtpType } from "@/prisma/generated/prisma/enums";
import { RegisterParams, UpdateProfileParams } from "@/types/params/authParams";

export const register = async ({ email, password, name, phone, address, file, facebookUrl, instagramUrl, twitterUrl }: RegisterParams) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      otps: {
        where: { type: OtpType.REGISTRATION },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new Error("Email is already registered and verified.");
    }

    const latestOtp = existingUser.otps[0];
    if (latestOtp) {
      const now = new Date();
      const cooldownTime = 2 * 60 * 1000;
      const isCooldown = now.getTime() - latestOtp.createdAt.getTime() < cooldownTime;

      if (isCooldown) {
        throw new Error("A verification code was recently sent. Please check your email or wait a moment.");
      }
    }

    throw new Error("Account already exists but is not verified. Please verify your email or request a new code.");
  }

  if (phone) {
    const existingPhone = await prisma.user.findFirst({
      where: { phone: phone },
    });

    if (existingPhone) {
      throw new Error("Phone number is already in use by another account.");
    }
  }

  let defaultRole = await prisma.role.findUnique({ where: { name: "B2C" } });
  if (!defaultRole) {
    const anyRole = await prisma.role.findFirst();
    if (!anyRole) throw new Error("No roles found in system. Please seed database.");
    defaultRole = anyRole;
  }

  const hashedPassword = await hashPassword(password);
  let avatarUrl: string | null = null;
  let avatarPath: string | null = null;

  try {
    if (file && file.size > 0) {
      const uploadResult = await saveFile(file, "avatars");
      avatarUrl = uploadResult.url;
      avatarPath = uploadResult.path;
    }

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          address,
          facebookUrl,
          twitterUrl,
          instagramUrl,
          roleId: defaultRole!.id,
          avatar: avatarUrl,
          isVerified: false,
        },
      });

      const otpCode = generateOtpCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expired 10 Menit

      await tx.otp.create({
        data: {
          code: otpCode,
          userId: newUser.id,
          expiresAt,
          type: OtpType.REGISTRATION,
        },
      });

      return { newUser, otpCode };
    });

    await sendOtpEmail(result.newUser.email, result.otpCode, result.newUser.name || "Customer");

    return result.newUser;
  } catch (error) {
    if (avatarPath) await deleteFile(avatarPath).catch(console.error);
    logError("AuthService.register", error);
    throw error;
  }
};

export const verifyRegistrationOtp = async (email: string, code: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      otps: {
        where: { code, type: OtpType.REGISTRATION },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) throw new Error("User not found.");
  if (user.isVerified) throw new Error("Account is already verified.");

  const otp = user.otps[0];
  if (!otp) throw new Error("Invalid verification code.");

  if (new Date() > otp.expiresAt) {
    throw new Error("Verification code has expired. Please request a new one.");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    }),
    prisma.otp.deleteMany({
      where: { userId: user.id },
    }),
  ]);

  return { success: true, message: "Account verified successfully." };
};

export const resendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      otps: {
        where: { type: OtpType.REGISTRATION },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new Error("User with this email does not exist.");
  }

  if (user.isVerified) {
    throw new Error("This account is already verified. Please log in.");
  }

  const latestOtp = user.otps[0];
  if (latestOtp) {
    const now = new Date();
    const cooldownTime = 1 * 60 * 1000;
    const timeDiff = now.getTime() - latestOtp.createdAt.getTime();

    if (timeDiff < cooldownTime) {
      const remainingSeconds = Math.ceil((cooldownTime - timeDiff) / 1000);
      throw new Error(`Please wait ${remainingSeconds} seconds before requesting a new code.`);
    }
  }

  const newOtpCode = generateOtpCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.create({
    data: {
      code: newOtpCode,
      userId: user.id,
      expiresAt,
      type: OtpType.REGISTRATION,
    },
  });

  await sendOtpEmail(user.email, newOtpCode, user.name || "Customer");

  return {
    success: true,
    message: "A new verification code has been sent to your email.",
  };
};

export const updateProfile = async ({
  userId,
  email,
  name,
  phone,
  file,
  facebookUrl,
  twitterUrl,
  instagramUrl,
  password,
  address,
}: UpdateProfileParams) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User tidak ditemukan");

  if (email && email !== user.email) {
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) throw new Error("Email sudah digunakan oleh akun lain");
  }

  let newAvatarUrl: string | null = null;
  let newAvatarPath: string | null = null;
  let hashedPassword: string | undefined = undefined;

  if (password && password.trim() !== "") {
    hashedPassword = await hashPassword(password);
  }

  try {
    if (file && file.size > 0) {
      const uploadResult = await saveFile(file, "avatars");
      newAvatarUrl = uploadResult.url;
      newAvatarPath = uploadResult.path;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: email ?? user.email,
        name: name ?? user.name,
        phone: phone ?? user.phone,
        facebookUrl: facebookUrl ?? user.facebookUrl,
        twitterUrl: twitterUrl ?? user.twitterUrl,
        instagramUrl: instagramUrl ?? user.instagramUrl,
        address: address ?? user.address,
        avatar: newAvatarUrl ?? user.avatar,
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: {
          select: { name: true },
        },
      },
    });

    if (newAvatarPath && user.avatar) {
      const oldPath = user.avatar.replace(/^\/uploads\//, "");
      await deleteFile(oldPath).catch(console.error);
    }

    return updatedUser;
  } catch (error) {
    if (newAvatarPath) {
      await deleteFile(newAvatarPath).catch(console.error);
    }

    logError("AuthService.updateProfile", error);
    throw error;
  }
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      facebookUrl: true,
      instagramUrl: true,
      twitterUrl: true,
      address: true,
      role: {
        select: { name: true },
      },
    },
  });

  if (!user) throw new Error("User tidak ditemukan");

  return user;
};
