import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1>Selamat Datang, {session.user?.email}</h1>
      <p>
        Role Anda: <strong>{session.user?.role}</strong>
      </p>

      {session.user?.role === "Admin" && (
        <div className="bg-red-100 p-4 mt-4">
          <p>Panel ini hanya bisa dilihat oleh Admin.</p>
        </div>
      )}
    </div>
  );
}
