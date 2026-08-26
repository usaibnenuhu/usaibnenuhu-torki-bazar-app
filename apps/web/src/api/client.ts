type ApiResponse<T = unknown> = {
  ok: boolean;
  data?: T;
  message?: string;
  code?: string;
};

/**
 * Torki Bazar transport layer.
 *
 * Electron:
 *   React → preload IPC → Electron → Core → local SQLite
 *
 * Browser:
 *   React → HTTP → API → Core/Neon
 */
export async function call<T = unknown>(
  channel: string,
  payload?: unknown
): Promise<T> {
  // ============================================================
  // ELECTRON
  // ============================================================

  if (window.api) {
    const response = await window.api.invoke<T>(
      channel,
      payload
    );

    if (!response.ok) {
      throw new Error(
        response.message ??
          "Something went wrong. Please try again."
      );
    }

    return response.data as T;
  }

  // ============================================================
  // BROWSER
  // ============================================================

  const response = await fetch("/rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      channel,
      payload,
    }),
  });

  let result: ApiResponse<T>;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok || !result.ok) {
    throw new Error(
      result.message ??
        "Something went wrong. Please try again."
    );
  }

  return result.data as T;
}
