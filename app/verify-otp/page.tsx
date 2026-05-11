"use client";

import { Alert, Box, Button, Center, Container, Paper, PinInput, rem, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconCheck, IconMailForward } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const shouldResend = searchParams.get("resend") === "true";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  useEffect(() => {
    if (shouldResend && email) {
      handleResend();

      const newUrl = window.location.pathname + `?email=${encodeURIComponent(email)}`;
      window.history.replaceState({}, "", newUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldResend, email]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (codeValue?: string) => {
    const finalOtp = codeValue || otp;
    if (finalOtp.length < 6) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: finalOtp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid verification code.");

      setSuccess("Account verified successfully! Redirecting...");
      setTimeout(() => router.replace("/login?verified=true"), 2000);
    } catch (err: any) {
      setError(err.message);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend code.");

      setSuccess("A new code has been sent to your email.");
      setCooldown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <Box bg="#f8f9fa" mih="100vh" style={{ display: "flex", alignItems: "center" }}>
      <Container size={420}>
        <Paper p={rem(40)} radius="xs" withBorder shadow="sm" bg="white">
          <Stack gap="xs" mb={rem(30)} ta="center">
            <Title order={2} fw={800} style={{ color: "#212529", letterSpacing: rem(-0.5) }}>
              Verify Email
            </Title>
            <Text c="dimmed" size="sm">
              We`ve sent a 6-digit code to <br />
              <Text component="span" fw={700} c="dark">
                {email}
              </Text>
            </Text>
          </Stack>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md" radius="xs" variant="light">
              {error}
            </Alert>
          )}

          {success && (
            <Alert icon={<IconCheck size={16} />} color="green" mb="md" radius="xs" variant="light">
              {success}
            </Alert>
          )}

          <Stack gap="xl">
            <Center>
              <PinInput
                length={6}
                size="lg"
                type="number"
                value={otp}
                onChange={setOtp}
                onComplete={(value) => handleVerify(value)}
                radius="xs"
                oneTimeCode
                autoFocus
                disabled={loading}
                styles={{
                  input: {
                    width: rem(45),
                    height: rem(55),
                    fontWeight: 700,
                    fontSize: rem(20),
                  },
                }}
              />
            </Center>

            <Button
              fullWidth
              color="dark"
              size="md"
              radius="xs"
              loading={loading}
              onClick={() => handleVerify()}
              disabled={otp.length < 6}
              styles={{
                root: { fontWeight: 600 },
              }}
            >
              Verify Account
            </Button>

            <Box style={{ height: 1, backgroundColor: "#eee", width: "100%" }} />

            <Stack gap={5} align="center">
              <Text size="sm" c="dimmed">
                Didn`t receive the code?
              </Text>
              <Button
                variant="subtle"
                color="dark"
                size="xs"
                onClick={handleResend}
                loading={resending}
                disabled={cooldown > 0 || loading}
                leftSection={<IconMailForward size={14} />}
                styles={{
                  root: {
                    height: rem(30),
                  },
                  label: {
                    fontWeight: 600,
                  },
                }}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Verification Code"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Text ta="center" mt="xl" size="xs" c="dimmed" style={{ textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
          &copy; {new Date().getFullYear()} Toko Kartu
        </Text>
      </Container>
    </Box>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <Center mih="100vh">
          <Text fw={700} c="dimmed">
            Loading...
          </Text>
        </Center>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
