import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export class UnauthorizedError extends Error {
  statusCode: number;
  constructor(message = "Unauthorized: Please login first") {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
  }
}

export async function getAuthUser() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new UnauthorizedError();
  }

  return {
    id: Number(session.user.id),
    email: session.user.email,
    role: session.user.role,
    session: session,
  };
}
