"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [users, setUsers] = useState<{ id: number; email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Panggil API route /api/users
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("err");
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-bold mb-8">Users List</h1>

        {loading && <p>Loading...</p>}

        {!loading && users.length === 0 && <p>No users found.</p>}

        {!loading && users.length > 0 && (
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {user.email}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
