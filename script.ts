import * as BunnySDK from "@bunny.net/edgescript-sdk";

const ICECAST_ORIGIN =
  process.env.ICECAST_ORIGIN || "http://localhost:8000";

BunnySDK.net.http.serve(async (request: Request) => {
  const url = new URL(request.url);
  const path = url.pathname;

  // Health check endpoint
  if (path === "/status") {
    const body = JSON.stringify({
      status: "ok",
      service: "EstacionKusmedios - LibreTime",
      stream: "https://libretime-afgbp.bunny.run/live.mp3",
      timestamp: new Date().toISOString(),
    });

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    });
  }

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Proxy request to Icecast origin
  const targetUrl = ICECAST_ORIGIN + path + url.search;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
    });

    const responseHeaders = new Headers(response.headers);

    // Add CORS headers
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Range, Accept-Ranges",
    );

    // Prevent caching of live streams
    if (path.includes("live") || path.endsWith(".mp3") || path.endsWith(".ogg")) {
      responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");
      responseHeaders.set("Pragma", "no-cache");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response("Upstream error", { status: 502 });
  }
});
