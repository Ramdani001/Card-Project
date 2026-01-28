import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Sidebar from "../component/Sidebar";
import Collection from "../component/Collection";
import Topbar from "../component/Topbar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <main className="flex overflow-x-hidden">
         <Sidebar />
         <div>
          <Topbar />
          <Collection />
         </div>
      </main>
    </>
  );
}
