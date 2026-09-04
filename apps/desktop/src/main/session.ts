import type { AuthSession } from "@torki-bazar/core";

// Single-user desktop session held in the main process only. The renderer
// never sees permissions/roles directly except through IPC responses.
let currentSession: AuthSession | null = null;

export function getSession(): AuthSession | null {
  return currentSession;
}

export function setSession(session: AuthSession | null) {
  currentSession = session;
}

export function requireSession(): AuthSession {
  if (!currentSession) {
    throw new Error("Not authenticated.");
  }
  return currentSession;
}
