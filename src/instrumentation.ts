import type { Instrumentation } from "next";

/**
 * Server errors as one JSON line each (Vercel's Logs: filter on `"event":"request.failed"`), with the
 * page and, for API errors, the API's request id to find the other half.
 */
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  const error = err instanceof Error ? err : new Error(String(err));
  const requestId = "requestId" in error && typeof error.requestId === "string" ? error.requestId : undefined;
  console.error(
    JSON.stringify({
      level: "error",
      time: new Date().toISOString(),
      event: "request.failed",
      message: error.message,
      app: "console",
      method: request.method,
      path: request.path,
      host: request.headers["x-forwarded-host"] ?? request.headers.host,
      route: context.routePath,
      routeType: context.routeType,
      ...(requestId && { apiRequestId: requestId }),
      ...("digest" in error && { digest: error.digest }),
      stack: error.stack,
    }),
  );
};
