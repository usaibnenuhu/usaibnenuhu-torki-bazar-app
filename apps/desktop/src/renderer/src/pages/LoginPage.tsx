import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { call } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/Button";
import { Field, Input } from "../components/Form";
import logo from "../assets/torki-logo.png";

const REMEMBER_KEY = "torki-bazar-remember-login";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  // Load remembered login
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (parsed?.username) {
        setUsername(parsed.username);
      }

      if (parsed?.password) {
        setPassword(parsed.password);
        setRememberMe(true);
      }
    } catch {
      localStorage.removeItem(REMEMBER_KEY);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const session = await call("auth:login", {
        username,
        password,
      });

      // Remember login if enabled
      if (rememberMe) {
        localStorage.setItem(
          REMEMBER_KEY,
          JSON.stringify({
            username,
            password,
          }),
        );
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      setSession(session as any);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-brand-900">
      {/* =========================================================
          ANIMATED BACKGROUND
      ========================================================= */}

      <div className="absolute inset-0 overflow-hidden">
        {/* Main green gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700" />

        {/* Animated glow 1 */}
        <div
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-brand-500/30 blur-3xl"
          style={{
            animation: "torkiFloatOne 9s ease-in-out infinite",
          }}
        />

        {/* Animated glow 2 */}
        <div
          className="absolute -bottom-40 -right-32 h-[600px] w-[600px] rounded-full bg-emerald-400/20 blur-3xl"
          style={{
            animation: "torkiFloatTwo 11s ease-in-out infinite",
          }}
        />

        {/* Animated glow 3 */}
        <div
          className="absolute left-[45%] top-[20%] h-[280px] w-[280px] rounded-full bg-lime-300/10 blur-3xl"
          style={{
            animation: "torkiPulse 7s ease-in-out infinite",
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

        {/* Floating particles */}
        <div
          className="absolute left-[12%] top-[22%] h-2 w-2 rounded-full bg-white/40"
          style={{
            animation: "torkiParticle 5s ease-in-out infinite",
          }}
        />

        <div
          className="absolute left-[82%] top-[25%] h-3 w-3 rounded-full bg-white/30"
          style={{
            animation: "torkiParticle 7s ease-in-out infinite 1s",
          }}
        />

        <div
          className="absolute left-[20%] top-[75%] h-3 w-3 rounded-full bg-white/25"
          style={{
            animation: "torkiParticle 6s ease-in-out infinite 2s",
          }}
        />

        <div
          className="absolute left-[75%] top-[72%] h-2 w-2 rounded-full bg-white/40"
          style={{
            animation: "torkiParticle 8s ease-in-out infinite 1.5s",
          }}
        />
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-[460px]">

          {/* =====================================================
              BRAND HEADER
          ===================================================== */}

          <div
            className="mb-7 text-center"
            style={{
              animation: "torkiFadeDown 0.8s ease-out both",
            }}
          >
            {/* Logo */}
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] ring-1 ring-white/40 backdrop-blur-xl">
              <img
                src={logo}
                alt="Torki Bazar"
                className="h-full w-full object-contain"
              />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-lg">
              Torki Bazar
            </h1>

            <p className="mt-1 text-sm font-medium text-white/65">
              Retail Management System
            </p>
          </div>

          {/* =====================================================
              LOGIN CARD
          ===================================================== */}

          <div
            className="relative overflow-hidden rounded-[30px] border border-white/20 bg-white/95 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-9"
            style={{
              animation: "torkiFadeUp 0.8s ease-out both",
            }}
          >
            {/* Top green shine */}
            <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-brand-400 via-emerald-400 to-lime-300" />

            {/* Decorative corner */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-100/70 blur-2xl" />

            <div className="relative">
              {/* Welcome */}
              <div className="mb-7">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                  Secure access
                </p>

                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to manage your Torki Bazar store.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Username */}
                <Field label="Username">
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21a8 8 0 0 0-16 0" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>

                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoFocus
                      required
                      placeholder="Enter your username"
                      className="!pl-11 !h-12 !rounded-xl !border-slate-200 !bg-slate-50 focus:!border-brand-500 focus:!ring-brand-500/20"
                    />
                  </div>
                </Field>

                {/* Password */}
                <Field label="Password">
                  <div className="relative">
                    <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="10"
                          width="18"
                          height="11"
                          rx="2"
                        />
                        <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                      </svg>
                    </div>

                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="!h-12 !rounded-xl !border-slate-200 !bg-slate-50 !pl-11 !pr-12 focus:!border-brand-500 focus:!ring-brand-500/20"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-600"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 9 4 10 8-0.4 1.4-1.2 2.6-2.2 3.7" />
                          <path d="M6.6 6.6C4.8 7.8 3.5 9.6 2 12c1 4 5 8 10 8 1.5 0 2.9-.3 4.1-.9" />
                        </svg>
                      ) : (
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </Field>

                {/* Remember me */}
                <div className="flex items-center justify-between">
                  <label className="group flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(e.target.checked)
                      }
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-brand-600 accent-brand-600 focus:ring-brand-500"
                    />

                    <span className="text-sm font-medium text-slate-600 transition group-hover:text-slate-900">
                      Remember me
                    </span>
                  </label>

                  <span className="text-xs font-medium text-slate-400">
                    Stay signed in
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <svg
                      className="mt-0.5 shrink-0"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v4" />
                      <path d="M12 16h.01" />
                    </svg>

                    <span>{error}</span>
                  </div>
                )}

                {/* Sign in button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="group relative !h-13 w-full !rounded-xl !border-0 !bg-brand-600 !text-base !font-bold !text-white shadow-lg shadow-brand-600/25 transition-all duration-300 hover:!bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 active:scale-[0.99] disabled:opacity-70"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in

                        <svg
                          className="transition-transform duration-300 group-hover:translate-x-1"
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M5 12h14" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      </>
                    )}
                  </span>
                </Button>
              </form>

              {/* Security message */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                <span>Secure store management access</span>
              </div>
            </div>
          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <div
            className="mt-7 text-center"
            style={{
              animation: "torkiFadeUp 1s ease-out both",
            }}
          >
            <p className="text-xs font-medium text-white/50">
              © 2026 Torki Bazar. All Rights Reserved.
            </p>

            <p className="mt-1 text-xs text-white/35">
              Developed & Designed by{" "}
              <span className="font-semibold text-white/60">
                Nuhu
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          ANIMATION KEYFRAMES
      ========================================================= */}

      <style>
        {`
          @keyframes torkiFloatOne {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            50% {
              transform: translate3d(80px, 60px, 0) scale(1.15);
            }
          }

          @keyframes torkiFloatTwo {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }
            50% {
              transform: translate3d(-70px, -50px, 0) scale(1.12);
            }
          }

          @keyframes torkiPulse {
            0%, 100% {
              opacity: 0.35;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.25);
            }
          }

          @keyframes torkiParticle {
            0%, 100% {
              transform: translateY(0);
              opacity: 0.25;
            }
            50% {
              transform: translateY(-35px);
              opacity: 0.8;
            }
          }

          @keyframes torkiFadeDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes torkiFadeUp {
            from {
              opacity: 0;
              transform: translateY(25px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}