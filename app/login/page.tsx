"use client";

import { Box, Button, Center, Loader, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconAlertCircle, IconLock, IconMail } from "@tabler/icons-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Loader size="lg" color="indigo" />
      </Center>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Incorrect email or password!");
      } else {
        router.push("/dashboard/main");
        router.refresh();
      }
    } catch {
      setError("An error occurred on the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-bg {
          min-height: 100vh;
          background: linear-gradient(160deg, #f2f6ff 0%, #e9efff 45%, #f9fbff 100%);
          background-image: radial-gradient(circle at 20% 20%, rgba(73, 126, 236, 0.14) 0%, transparent 40%),
            radial-gradient(circle at 80% 15%, rgba(34, 119, 255, 0.08) 0%, transparent 50%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 12px;
          color: #1f3d7a;
        }

        .login-left {
          background: linear-gradient(145deg, #1e3a8a, #2563eb);
          border-radius: 20px 0 0 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 520px;
          width: 340px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }

        .login-left::before {
          content: 'TOKO KARTU';
          position: absolute;
          top: 30px;
          left: 24px;
          font-size: 72px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.15);
          transform: rotate(-10deg);
        }

        .login-left::after {
          content: '';
          position: absolute;
          bottom: -50px;
          left: -40px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
          border: 5px solid rgba(255, 255, 255, 0.22);
        }

        .login-card {
          border-radius: 0 20px 20px 0 !important;
          border: 1px solid rgba(59, 130, 246, 0.25) !important;
          box-shadow: 0 20px 45px rgba(44, 84, 140, 0.2) !important;
          background: linear-gradient(160deg, #ffffff, #f4f7ff);
          overflow: hidden;
        }

        .login-field input {
          border-radius: 12px;
          border: 1.5px solid #dbe6fb;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .login-field input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
        }

        .login-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
          border: none !important;
          border-radius: 14px !important;
          height: 50px !important;
          font-size: 15px !important;
          font-weight: 700 !important;
          letter-spacing: 0.5px;
          transition: transform 0.15s ease, box-shadow 0.15s ease !important;
          color: #fff !important;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37, 99, 235, 0.4) !important;
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .error-box {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        @media (max-width: 680px) {
          .login-left { display: none; }
          .login-card { border-radius: 20px !important; }
        }
      `}</style>

      <div className="login-bg">
        <Box style={{ display: "flex", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.12)" }}>
          <div className="login-left">
            <Box style={{ position: "relative", zIndex: 1 }}>
              <svg width="190" height="190" viewBox="0 0 190 190" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="95" cy="95" r="85" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
                <circle cx="95" cy="95" r="65" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 6" />

                <rect x="62" y="88" width="66" height="52" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

                <path
                  d="M75 88 L75 72 Q95 52 115 72 L115 88"
                  stroke="rgba(165,243,252,0.55)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle cx="95" cy="108" r="7" fill="rgba(165,243,252,0.35)" stroke="rgba(165,243,252,0.6)" strokeWidth="1.2" />
                <rect x="92" y="112" width="6" height="10" rx="3" fill="rgba(165,243,252,0.5)" />

                <circle cx="32" cy="52" r="4" fill="rgba(165,243,252,0.35)" />
                <circle cx="160" cy="140" r="5" fill="rgba(99,102,241,0.5)" />
                <circle cx="152" cy="38" r="3" fill="rgba(255,255,255,0.18)" />
                <circle cx="36" cy="148" r="3" fill="rgba(255,255,255,0.12)" />

                <path d="M143 62 L145 56 L147 62 L153 64 L147 66 L145 72 L143 66 L137 64 Z" fill="rgba(165,243,252,0.45)" />
                <path d="M36 112 L37.5 108 L39 112 L43 113.5 L39 115 L37.5 119 L36 115 L32 113.5 Z" fill="rgba(255,255,255,0.18)" />
              </svg>
            </Box>
          </div>

          <Paper className="login-card" style={{ width: 400, padding: "48px 40px", background: "white" }}>
            <Box mb={36}>
              <Title order={2} fw={800} style={{ color: "#1f3d7a", fontSize: 28 }}>
                Login
              </Title>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                {error && (
                  <div className="error-box">
                    <IconAlertCircle size={18} color="#e11d48" style={{ flexShrink: 0 }} />
                    <Text size="sm" c="red.7" fw={500}>
                      {error}
                    </Text>
                  </div>
                )}

                <TextInput
                  className="login-field"
                  label="Email"
                  placeholder="Email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  leftSection={<IconMail size={16} color="#6366f1" />}
                  styles={{ label: { fontWeight: 600, marginBottom: 6, color: "#374151" } }}
                />

                <PasswordInput
                  className="login-field"
                  label="Password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  leftSection={<IconLock size={16} color="#6366f1" />}
                  styles={{ label: { fontWeight: 600, marginBottom: 6, color: "#374151" } }}
                />

                <Button type="submit" className="login-btn" fullWidth mt="sm" loading={loading} loaderProps={{ type: "dots" }}>
                  Login
                </Button>
              </Stack>
            </form>

            {/* <Text ta="center" mt="xl" size="sm" c="dimmed">
              Don`t have an account yet?
              <Anchor component={Link} href="/register" fw={700} c="indigo">
                Register now
              </Anchor>
            </Text> */}
          </Paper>
        </Box>
      </div>
    </>
  );
}
