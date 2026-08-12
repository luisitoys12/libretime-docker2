import * as BunnySDK from "@bunny.net/edgescript-sdk";

BunnySDK.net.http
  .servePullZone({ url: "http://localhost:8000" })
  .onOriginRequest((ctx) => {
    const url = new URL(ctx.request.url);
    const path = url.pathname;

    // Health check endpoint
    if (path === "/status") {
      const body = JSON.stringify({
        status: "ok",
        service: "EstacionKusmedios - LibreTime",
        stream: "https://libretime-afgbp.bunny.run/live.mp3",
        timestamp: new Date().toISOString(),
      });

      return Promise.resolve(
        new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store",
          },
        }),
      );
    }

    // Clone the request so we can modify headers
    const modifiedHeaders = new Headers(ctx.request.headers);

    // Add CORS headers for all streaming endpoints
    modifiedHeaders.set("Origin", "https://libretime-afgbp.bunny.run");

    const modifiedRequest = new Request(ctx.request, {
      headers: modifiedHeaders,
    });

    return Promise.resolve(modifiedRequest);
  })
  .onOriginResponse((ctx) => {
    const url = new URL(ctx.request.url);
    const path = url.pathname;

    // Add CORS headers to allow web players to embed the stream
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    ctx.response.headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    ctx.response.headers.set("Access-Control-Allow-Headers", "Range, Content-Type");
    ctx.response.headers.set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");

    // Prevent caching of live streams
    if (path.includes("live") || path.endsWith(".mp3") || path.endsWith(".ogg")) {
      ctx.response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      ctx.response.headers.set("Pragma", "no-cache");
    }

    // Set proper headers for static assets (docs)
    if (path.endsWith(".html") || path.endsWith(".css") || path.endsWith(".js") || path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".svg")) {
      ctx.response.headers.set("Cache-Control", "public, max-age=3600");
    }

    return Promise.resolve(ctx.response);
  });
