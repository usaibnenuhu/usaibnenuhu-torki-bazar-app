/// <reference types="vite/client" />

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  code?: string;
  message?: string;
}

interface Window {
  api?: {
    invoke: <T = unknown>(channel: string, payload?: unknown) => Promise<ApiResponse<T>>;
  };
}
