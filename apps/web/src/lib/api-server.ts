import { headers } from "next/headers";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? response.statusText;
  } catch {
    return response.statusText || "Request failed";
  }
}

export async function serverApiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: {
    allowUnauthorized?: boolean;
    allowUnavailable?: boolean;
  },
): Promise<T | null> {
  const incomingHeaders = await headers();
  const cookie = incomingHeaders.get("cookie");
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        accept: "application/json",
        ...(init?.body ? { "content-type": "application/json" } : {}),
        ...(init?.headers ?? {}),
        ...(cookie ? { cookie } : {}),
      },
    });
  } catch (error) {
    if (options?.allowUnavailable) {
      return null;
    }

    throw new Error(
      `Unable to reach the API at ${API_URL}. Start the backend server or update API_URL/NEXT_PUBLIC_API_URL.`,
      { cause: error },
    );
  }

  if (!response.ok) {
    if (options?.allowUnauthorized && response.status === 401) {
      return null;
    }

    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return null;
  }

  return (await response.json()) as T;
}

export function withQuery(
  path: string,
  query: Record<string, string | undefined | null>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}
