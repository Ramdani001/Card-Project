// app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/server/prisma.config";

export const GET = async () => {
  try {
    const users = await prisma.user.findMany(); // ambil semua users
    console.log(users); 
    return NextResponse.json(users);
    
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err}, 
      { status: 500 }
    );
  }
};
