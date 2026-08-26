import { useEffect, useState } from "react";
import { call } from "../api/client";
import { Card } from "../components/Card";
import { formatDateTime } from "../utils/format";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

/* ----------------------------------------------------------------------- */
/*  LINE-STYLE ICONS (presentational only)                                  */
/* ----------------------------------------------------------------------- */

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.6 2.7 17a1.7 1.7 0 0 0 1.5 2.6h15.6A1.7 1.7 0 0 0 21.3 17L13.7 3.6a1.7 1.7 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

function UrgentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

function CriticalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m14.5 9.5-5 5" />
      <path d="m9.5 9.5 5 5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

/* ----------------------------------------------------------------------- */
/*  SEVERITY CONFIG (presentational only — same severity values as before) */
/* ----------------------------------------------------------------------- */

const severityConfig: Record<
  string,
  { bar: string; chip: string; icon: React.ReactNode; label: string }
> = {
  INFO: {
    bar: "bg-sky-400",
    chip: "bg-sky-100 text-sky-700",
    icon: <InfoIcon />,
    label: "Info",
  },
  WARNING: {
    bar: "bg-amber-400",
    chip: "bg-amber-100 text-amber-700",
    icon: <WarningIcon />,
    label: "Warning",
  },
  URGENT: {
    bar: "bg-orange-500",
    chip: "bg-orange-100 text-orange-700",
    icon: <UrgentIcon />,
    label: "Urgent",
  },
  CRITICAL: {
    bar: "bg-red-500",
    chip: "bg-red-100 text-red-700",
    icon: <CriticalIcon />,
    label: "Critical",
  },
};

const defaultSeverity = {
  bar: "bg-slate-300",
  chip: "bg-slate-100 text-slate-600",
  icon: <InfoIcon />,
  label: "Notice",
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      await call("notifications:refresh").catch(() => {});

      const data = await call<Notification[]>("notifications:list");

      // Only show unread notifications
      setNotifications(data.filter((n) => !n.isRead));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string) {
    // Immediately remove it from the screen
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );

    try {
      await call("notifications:markRead", { id });
    } catch {
      // If saving fails, reload the notifications
      await load();
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="reveal">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
            Alerts Center
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
            Notifications
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Expiry alerts, low stock, and pending COD collections.
          </p>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
          ))}
        </div>

        <style>{`
          .skeleton-shimmer {
            position: relative;
            overflow: hidden;
            background: linear-gradient(110deg, #e6efe9 8%, #f4f8f5 18%, #e6efe9 33%);
            background-size: 200% 100%;
            animation: shimmer 1.6s ease-in-out infinite;
          }
          @keyframes shimmer { to { background-position-x: -200%; } }
          .reveal { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="notifications-root space-y-6">
      <div className="reveal flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
            Alerts Center
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
            Notifications
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Expiry alerts, low stock, and pending COD collections.
          </p>
        </div>

        {notifications.length > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1.5 text-xs font-black text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            {notifications.length} unread
          </span>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="reveal" style={{ animationDelay: "60ms" }}>
            <Card className="!py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <BellIcon />
              </div>
              <p className="mt-4 font-bold text-slate-700">All caught up</p>
              <p className="mt-1 text-sm text-slate-400">
                No notifications right now.
              </p>
            </Card>
          </div>
        )}

        {notifications.map((n, i) => {
          const config = severityConfig[n.severity] ?? defaultSeverity;

          return (
            <div
              key={n.id}
              className="notification-card reveal group relative flex overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
            >
              <span className={`w-1.5 shrink-0 ${config.bar}`} />

              <div className="flex-1 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${config.chip}`}>
                      {config.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{n.title}</p>
                        <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide sm:inline-block ${config.chip}`}>
                          {config.label}
                        </span>
                      </div>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                        <ClockIcon />
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {n.message}
                </p>

                <button
                  className="group/btn mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all duration-300 hover:bg-emerald-100 hover:text-emerald-700"
                  onClick={() => markRead(n.id)}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-slate-400 transition-colors duration-300 group-hover/btn:bg-emerald-500 group-hover/btn:text-white">
                    <CheckIcon />
                  </span>
                  Mark as read
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .reveal {
          animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal, .notification-card, .animate-pulse { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
