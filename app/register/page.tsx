"use client";

import {
  Box,
  Text
} from "@mantine/core";
import {
  IconCheck
} from "@tabler/icons-react";
import { redirect } from "next/navigation";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "gray" };
  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 10) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9!@#$%^&*]/.test(password)) score += 25;
  if (score <= 25) return { score, label: "Lemah", color: "red" };
  if (score <= 50) return { score, label: "Cukup", color: "orange" };
  if (score <= 75) return { score, label: "Baik", color: "yellow" };
  return { score, label: "Kuat", color: "teal" };
}

function StepIndicator({ step, current }: { step: number; current: number }) {
  const isCompleted = current > step;
  const isActive = current === step;
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Box
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isCompleted ? "var(--mantine-color-teal-6)" : isActive ? "var(--mantine-color-blue-6)" : "var(--mantine-color-gray-2)",
          color: isCompleted || isActive ? "white" : "var(--mantine-color-gray-5)",
          fontWeight: 700,
          fontSize: 14,
          transition: "all 0.3s ease",
          boxShadow: isActive ? "0 0 0 4px rgba(34, 139, 230, 0.2)" : "none",
        }}
      >
        {isCompleted ? <IconCheck size={16} /> : step}
      </Box>
      <Text size="xs" c={isActive ? "blue" : isCompleted ? "teal" : "dimmed"} fw={isActive ? 600 : 400}>
        {step === 1 ? "Account" : step === 2 ? "Social" : "Profile"}
      </Text>
    </Box>
  );
}

export default function RegisterPage() {
  redirect("/");

  // const [form, setForm] = useState({
  //   email: "",
  //   password: "",
  //   confirmPassword: "",
  //   name: "",
  //   facebookUrl: "",
  //   instagramUrl: "",
  //   twitterUrl: "",
  // });

  // const [file, setFile] = useState<File | null>(null);
  // const [loading, setLoading] = useState(false);
  // const [step, setStep] = useState(1);
  // const router = useRouter();

  // const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  // const passwordMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  // const handleChange = (field: string, value: string) => {
  //   setForm((prev) => ({ ...prev, [field]: value }));
  // };

  // const handleNext = () => {
  //   if (step === 1) {
  //     if (!form.name || !form.email || !form.password || !form.confirmPassword) {
  //       notifications.show({
  //         title: "Complete Data",
  //         message: "Please fill in all required fields",
  //         color: "orange",
  //         icon: <IconAlertCircle size={16} />,
  //       });
  //       return;
  //     }
  //     if (form.password !== form.confirmPassword) {
  //       notifications.show({
  //         title: "Password Doesn't Match",
  //         message: "Password and password confirmation must be the same",
  //         color: "red",
  //         icon: <IconAlertCircle size={16} />,
  //       });
  //       return;
  //     }
  //     if (form.password.length < 6) {
  //       notifications.show({
  //         title: "Password Too Short",
  //         message: "Password must be at least 6 characters",
  //         color: "red",
  //         icon: <IconAlertCircle size={16} />,
  //       });
  //       return;
  //     }
  //   }
  //   setStep((s) => s + 1);
  // };

  // const handleSubmit = async () => {
  //   setLoading(true);
  //   try {
  //     const formData = new FormData();
  //     formData.append("email", form.email);
  //     formData.append("password", form.password);
  //     formData.append("name", form.name);
  //     formData.append("facebookUrl", form.facebookUrl);
  //     formData.append("instagramUrl", form.instagramUrl);
  //     formData.append("twitterUrl", form.twitterUrl);
  //     if (file) formData.append("file", file);

  //     const res = await fetch("/api/auth/register", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const json = await res.json();
  //     if (!json.success) throw new Error(json.message || "Failed to register");

  //     notifications.show({
  //       title: "Registration Successful",
  //       message: "Your account has been successfully created. Redirecting to the login page....",
  //       color: "teal",
  //       icon: <IconCheck size={16} />,
  //     });

  //     setTimeout(() => router.push("/login"), 1500);
  //   } catch (err: any) {
  //     notifications.show({
  //       title: "Failed to register",
  //       message: err.message || "An error occurred on the server.",
  //       color: "red",
  //       icon: <IconAlertCircle size={16} />,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // return (
  //   <>
  //     <style>{`
  //       .register-bg {
  //         min-height: 100vh;
  //         background: linear-gradient(160deg, #f2f6ff 0%, #e9efff 45%, #f9fbff 100%);
  //         background-image:
  //           radial-gradient(circle at 20% 20%, rgba(73, 126, 236, 0.14) 0%, transparent 40%),
  //           radial-gradient(circle at 80% 15%, rgba(34, 119, 255, 0.08) 0%, transparent 50%);
  //         display: flex;
  //         align-items: center;
  //         justify-content: center;
  //         padding: 40px 16px;
  //       }

  //       .register-left {
  //         background: linear-gradient(145deg, #1e3a8a, #2563eb);
  //         border-radius: 20px 0 0 20px;
  //         padding: 48px 40px;
  //         display: flex;
  //         flex-direction: column;
  //         justify-content: space-between;
  //         min-height: 580px;
  //         position: relative;
  //         overflow: hidden;
  //       }

  //       .register-left::before {
  //         content: 'TOKO KARTU';
  //         position: absolute;
  //         top: 30px;
  //         left: 24px;
  //         font-size: 72px;
  //         font-weight: 900;
  //         color: rgba(255, 255, 255, 0.15);
  //         transform: rotate(-10deg);
  //       }

  //       .register-left::after {
  //         content: '';
  //         position: absolute;
  //         bottom: -80px;
  //         left: -40px;
  //         width: 200px;
  //         height: 200px;
  //         border-radius: 50%;
  //         background: rgba(20, 184, 166, 0.15);
  //       }

  //       .register-card {
  //         border-radius: 0 20px 20px 0;
  //         border: 1px solid rgba(59, 130, 246, 0.25) !important;
  //         box-shadow: 0 20px 45px rgba(44, 84, 140, 0.2) !important;
  //         background: linear-gradient(160deg, #ffffff, #f4f7ff);
  //       }

  //       .field-input input,
  //       .field-input input:focus {
  //         border-radius: 12px;
  //         border: 1.5px solid #dbe6fb;
  //         transition: border-color 0.2s ease, box-shadow 0.2s ease;
  //       }

  //       .field-input input:focus {
  //         border-color: #2563eb;
  //         box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
  //       }

  //       .field-input input:focus {
  //         border-color: #6366f1;
  //         box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  //       }

  //       .step-line {
  //         flex: 1;
  //         height: 2px;
  //         background: var(--mantine-color-gray-2);
  //         margin: 0 8px;
  //         margin-bottom: 20px;
  //         transition: background 0.3s ease;
  //       }

  //       .step-line.active {
  //         background: var(--mantine-color-teal-5);
  //       }

  //       .submit-btn {
  //         background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  //         border: none !important;
  //         border-radius: 14px !important;
  //         height: 50px !important;
  //         font-size: 15px !important;
  //         font-weight: 700 !important;
  //         letter-spacing: 0.5px;
  //         transition: transform 0.15s ease, box-shadow 0.15s ease !important;
  //         color: #fff !important;
  //       }

  //       .submit-btn:hover:not(:disabled) {
  //         transform: translateY(-1px);
  //         box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4) !important;
  //       }

  //       .submit-btn:active:not(:disabled) {
  //         transform: translateY(0);
  //       }

  //       .social-input input {
  //         border-radius: 10px;
  //       }

  //       .avatar-upload {
  //         border: 2px dashed #c7d2fe;
  //         border-radius: 16px;
  //         padding: 24px;
  //         text-align: center;
  //         cursor: pointer;
  //         transition: border-color 0.2s, background 0.2s;
  //         background: #f5f3ff;
  //       }

  //       .avatar-upload:hover {
  //         border-color: #6366f1;
  //         background: #ede9fe;
  //       }

  //       @media (max-width: 768px) {
  //         .register-left {
  //           display: none;
  //         }
  //         .register-card {
  //           border-radius: 20px !important;
  //         }
  //       }
  //     `}</style>

  //     <div className="register-bg">
  //       <Box style={{ width: "100%", maxWidth: 880 }}>
  //         <div style={{ display: "flex", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.12)" }}>
  //           <div className="register-left" style={{ width: "38%", flexShrink: 0 }}>
  //             <Box
  //               style={{
  //                 position: "relative",
  //                 zIndex: 1,
  //                 flex: 1,
  //                 display: "flex",
  //                 flexDirection: "column",
  //                 alignItems: "center",
  //                 justifyContent: "center",
  //               }}
  //             >
  //               <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  //                 <circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
  //                 <circle cx="100" cy="100" r="70" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />

  //                 <rect
  //                   x="44"
  //                   y="62"
  //                   width="112"
  //                   height="76"
  //                   rx="12"
  //                   fill="rgba(255,255,255,0.07)"
  //                   stroke="rgba(255,255,255,0.18)"
  //                   strokeWidth="1.2"
  //                 />

  //                 <circle cx="72" cy="90" r="16" fill="rgba(165,243,252,0.2)" stroke="rgba(165,243,252,0.5)" strokeWidth="1.5" />
  //                 <circle cx="72" cy="86" r="5" fill="rgba(165,243,252,0.7)" />
  //                 <path d="M60 103 Q72 95 84 103" stroke="rgba(165,243,252,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

  //                 <rect x="96" y="83" width="44" height="5" rx="2.5" fill="rgba(255,255,255,0.35)" />
  //                 <rect x="96" y="93" width="30" height="4" rx="2" fill="rgba(255,255,255,0.18)" />

  //                 <circle cx="96" cy="110" r="4" fill="rgba(29,161,242,0.7)" />
  //                 <circle cx="108" cy="110" r="4" fill="rgba(228,64,95,0.7)" />
  //                 <circle cx="120" cy="110" r="4" fill="rgba(24,119,242,0.7)" />

  //                 <circle cx="34" cy="54" r="4" fill="rgba(165,243,252,0.4)" />
  //                 <circle cx="166" cy="148" r="5" fill="rgba(99,102,241,0.5)" />
  //                 <circle cx="158" cy="44" r="3" fill="rgba(255,255,255,0.2)" />
  //                 <circle cx="40" cy="155" r="3" fill="rgba(255,255,255,0.15)" />

  //                 <path d="M148 68 L150 62 L152 68 L158 70 L152 72 L150 78 L148 72 L142 70 Z" fill="rgba(165,243,252,0.5)" />
  //                 <path d="M38 120 L39.5 116 L41 120 L45 121.5 L41 123 L39.5 127 L38 123 L34 121.5 Z" fill="rgba(255,255,255,0.2)" />
  //               </svg>
  //             </Box>
  //           </div>

  //           <Paper className="register-card" style={{ flex: 1, padding: "40px 40px", background: "white" }}>
  //             <Box style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
  //               <StepIndicator step={1} current={step} />
  //               <div className={`step-line ${step > 1 ? "active" : ""}`} />
  //               <StepIndicator step={2} current={step} />
  //               <div className={`step-line ${step > 2 ? "active" : ""}`} />
  //               <StepIndicator step={3} current={step} />
  //             </Box>

  //             {step === 1 && (
  //               <Stack gap="md">
  //                 <Box mb={4}>
  //                   <Title order={3} fw={700} style={{ color: "#1f3d7a" }}>
  //                     Register
  //                   </Title>
  //                 </Box>

  //                 <TextInput
  //                   className="field-input"
  //                   label="Full name"
  //                   placeholder="Full name"
  //                   required
  //                   value={form.name}
  //                   onChange={(e) => handleChange("name", e.currentTarget.value)}
  //                   leftSection={<IconUser size={16} color="#6366f1" />}
  //                   styles={{ label: { fontWeight: 600, marginBottom: 6, color: "#374151" } }}
  //                 />

  //                 <TextInput
  //                   className="field-input"
  //                   label="Email address"
  //                   placeholder="Email address"
  //                   required
  //                   type="email"
  //                   value={form.email}
  //                   onChange={(e) => handleChange("email", e.currentTarget.value)}
  //                   leftSection={<IconMail size={16} color="#6366f1" />}
  //                   styles={{ label: { fontWeight: 600, marginBottom: 6, color: "#374151" } }}
  //                 />

  //                 <Box>
  //                   <PasswordInput
  //                     className="field-input"
  //                     label="Password"
  //                     placeholder="Minimum 6 characters"
  //                     required
  //                     value={form.password}
  //                     onChange={(e) => handleChange("password", e.currentTarget.value)}
  //                     leftSection={<IconLock size={16} color="#6366f1" />}
  //                     styles={{ label: { fontWeight: 600, marginBottom: 6, color: "#374151" } }}
  //                   />
  //                   {form.password && (
  //                     <Box mt={8}>
  //                       <Group justify="space-between" mb={4}>
  //                         <Text size="xs" c="dimmed">
  //                           Password strength
  //                         </Text>
  //                         <Text size="xs" c={passwordStrength.color} fw={600}>
  //                           {passwordStrength.label}
  //                         </Text>
  //                       </Group>
  //                       <Progress value={passwordStrength.score} color={passwordStrength.color} size="xs" radius="xl" />
  //                     </Box>
  //                   )}
  //                 </Box>

  //                 <PasswordInput
  //                   className="field-input"
  //                   label="Confirm Password"
  //                   placeholder="Repeat password"
  //                   required
  //                   value={form.confirmPassword}
  //                   onChange={(e) => handleChange("confirmPassword", e.currentTarget.value)}
  //                   leftSection={<IconLock size={16} color={passwordMismatch ? "red" : "#6366f1"} />}
  //                   error={passwordMismatch ? "Passwords do not match" : undefined}
  //                   styles={{ label: { fontWeight: 600, marginBottom: 6, color: "#374151" } }}
  //                 />

  //                 <Button className="submit-btn" fullWidth mt="sm" rightSection={<IconChevronRight size={16} />} onClick={handleNext}>
  //                   Lanjut
  //                 </Button>
  //               </Stack>
  //             )}

  //             {step === 2 && (
  //               <Stack gap="md">
  //                 <Box mb={4}>
  //                   <Title order={3} fw={700} style={{ color: "#1e1b4b" }}>
  //                     Social media
  //                   </Title>
  //                   <Text size="sm" c="dimmed" mt={4}>
  //                     Optional — add your social media links
  //                   </Text>
  //                 </Box>

  //                 {[
  //                   {
  //                     field: "facebookUrl",
  //                     label: "Facebook",
  //                     placeholder: "https://facebook.com/username",
  //                     icon: <IconBrandFacebook size={18} color="#1877F2" />,
  //                     color: "#eff6ff",
  //                   },
  //                   {
  //                     field: "instagramUrl",
  //                     label: "Instagram",
  //                     placeholder: "https://instagram.com/username",
  //                     icon: <IconBrandInstagram size={18} color="#E4405F" />,
  //                     color: "#fff1f2",
  //                   },
  //                   {
  //                     field: "twitterUrl",
  //                     label: "Twitter / X",
  //                     placeholder: "https://twitter.com/username",
  //                     icon: <IconBrandTwitter size={18} color="#1DA1F2" />,
  //                     color: "#eff6ff",
  //                   },
  //                 ].map((s) => (
  //                   <Box key={s.field}>
  //                     <Text size="sm" fw={600} mb={6} c="#374151">
  //                       {s.label}
  //                     </Text>
  //                     <TextInput
  //                       placeholder={s.placeholder}
  //                       leftSection={<Box style={{ background: s.color, borderRadius: 6, padding: "3px 5px", display: "flex" }}>{s.icon}</Box>}
  //                       value={form[s.field as keyof typeof form]}
  //                       onChange={(e) => handleChange(s.field, e.currentTarget.value)}
  //                       styles={{
  //                         input: { borderRadius: 10, paddingLeft: 44, border: "1.5px solid #e2e8f0" },
  //                         section: { width: 44, paddingLeft: 10 },
  //                       }}
  //                     />
  //                   </Box>
  //                 ))}

  //                 <Group mt="sm">
  //                   <Button variant="default" radius="xl" onClick={() => setStep(1)} style={{ flex: 1 }}>
  //                     Kembali
  //                   </Button>
  //                   <Button className="submit-btn" onClick={handleNext} style={{ flex: 2 }} rightSection={<IconChevronRight size={16} />}>
  //                     Lanjut
  //                   </Button>
  //                 </Group>
  //               </Stack>
  //             )}

  //             {step === 3 && (
  //               <Stack gap="md">
  //                 <Box mb={4}>
  //                   <Title order={3} fw={700} style={{ color: "#1e1b4b" }}>
  //                     Profile picture
  //                   </Title>
  //                   <Text size="sm" c="dimmed" mt={4}>
  //                     Optional — add your profile picture
  //                   </Text>
  //                 </Box>

  //                 <FileInput
  //                   label="Upload Photos"
  //                   placeholder="Click to select an image"
  //                   leftSection={<IconPhoto size={16} color="#6366f1" />}
  //                   accept="image/png,image/jpeg,image/webp"
  //                   value={file}
  //                   onChange={setFile}
  //                   clearable
  //                   styles={{
  //                     input: { borderRadius: 10, border: "1.5px solid #e2e8f0", cursor: "pointer" },
  //                     label: { fontWeight: 600, marginBottom: 6, color: "#374151" },
  //                   }}
  //                 />

  //                 {file && (
  //                   <Box
  //                     style={{
  //                       display: "flex",
  //                       alignItems: "center",
  //                       gap: 12,
  //                       background: "#f0fdf4",
  //                       border: "1px solid #bbf7d0",
  //                       borderRadius: 12,
  //                       padding: "12px 16px",
  //                     }}
  //                   >
  //                     <ThemeIcon color="teal" variant="light" radius="xl" size="lg">
  //                       <IconCheck size={16} />
  //                     </ThemeIcon>
  //                     <Box>
  //                       <Text size="sm" fw={600} c="teal.7">
  //                         {file.name}
  //                       </Text>
  //                       <Text size="xs" c="dimmed">
  //                         {(file.size / 1024).toFixed(1)} KB
  //                       </Text>
  //                     </Box>
  //                   </Box>
  //                 )}

  //                 <Divider my="sm" label="Account Summary" labelPosition="center" styles={{ label: { color: "#9ca3af", fontSize: 12 } }} />

  //                 <Box style={{ background: "#f8faff", borderRadius: 12, padding: "16px 20px" }}>
  //                   <Stack gap={8}>
  //                     <Group justify="space-between">
  //                       <Text size="sm" c="dimmed">
  //                         Name
  //                       </Text>
  //                       <Text size="sm" fw={600} c="#1e1b4b">
  //                         {form.name || "—"}
  //                       </Text>
  //                     </Group>
  //                     <Group justify="space-between">
  //                       <Text size="sm" c="dimmed">
  //                         Email
  //                       </Text>
  //                       <Text size="sm" fw={600} c="#1e1b4b">
  //                         {form.email || "—"}
  //                       </Text>
  //                     </Group>
  //                     <Group justify="space-between">
  //                       <Text size="sm" c="dimmed">
  //                         Social Media
  //                       </Text>
  //                       <Text size="sm" fw={600} c="#1e1b4b">
  //                         {[form.facebookUrl, form.instagramUrl, form.twitterUrl].filter(Boolean).length} terhubung
  //                       </Text>
  //                     </Group>
  //                   </Stack>
  //                 </Box>

  //                 <Group mt="sm">
  //                   <Button variant="default" radius="xl" onClick={() => setStep(2)} style={{ flex: 1 }}>
  //                     Back
  //                   </Button>
  //                   <Button className="submit-btn" onClick={handleSubmit} loading={loading} style={{ flex: 2 }}>
  //                     Create Account
  //                   </Button>
  //                 </Group>
  //               </Stack>
  //             )}

  //             <Text ta="center" mt="xl" size="sm" c="dimmed">
  //               Already have an account?{" "}
  //               <Anchor component={Link} href="/login" fw={700} c="indigo">
  //                 Login now
  //               </Anchor>
  //             </Text>
  //           </Paper>
  //         </div>
  //       </Box>
  //     </div>
  //   </>
  // );
}
