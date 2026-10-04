import { NextResponse, type NextRequest } from "next/server";

/**
 * Minimal API-layer utilities shared by route handlers: structured errors,
 * request-id tracing, and body parsing with an explicit size ceiling so a
 * malformed or oversized client can never exhaust the handler.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(
    status: number,
    message: string,
    code = "request_error",
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function requestId(headers: Headers): string {
  return (
    headers.get("x-request-id") ??
    `req_${crypto.randomUUID().slice(0, 12)}`
  );
}

export function jsonError(
  error: unknown,
  requestIdValue = "req_unknown",
): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, requestId: requestIdValue } },
      { status: error.status },
    );
  }

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";
  console.error(`[api] ${requestIdValue}`, error);
  return NextResponse.json(
    { error: { code: "internal_error", message, requestId: requestIdValue } },
    { status: 500 },
  );
}

/** Parses JSON and rejects bodies larger than `maxBytes` before parsing. */
export async function readJsonBody(
  request: NextRequest,
  maxBytes = 64_000,
): Promise<Record<string, unknown>> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes) {
    throw new ApiError(413, "Request body is too large.", "payload_too_large");
  }

  const text = await request.text();
  if (text.length > maxBytes) {
    throw new ApiError(413, "Request body is too large.", "payload_too_large");
  }

  if (!text.trim()) return {};

  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new ApiError(400, "Expected a JSON object.", "invalid_json");
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "Invalid JSON body.", "invalid_json");
  }
}

export function optionalString(
  value: unknown,
  maxLength = 500,
): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maxLength)
    : undefined;
}

export function optionalStringArray(
  value: unknown,
  maxItems = 50,
  maxLength = 100,
): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const strings = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean);
  return strings.length > 0 ? strings.slice(0, maxItems) : undefined;
}
