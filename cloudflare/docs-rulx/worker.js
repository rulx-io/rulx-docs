const UPSTREAM_HOST = "rulx.mintlify.dev";
const CUSTOM_HOST = "docs.rulx.io";
const UPSTREAM_BASE_PATH = "/docs";

function resolveUpstreamPath(pathname) {
  if (pathname === "/" || pathname === "/docs" || pathname === "/index" || pathname === "/docs/index") {
    return `${UPSTREAM_BASE_PATH}/index`;
  }

  return pathname.startsWith(`${UPSTREAM_BASE_PATH}/`)
    ? pathname
    : `${UPSTREAM_BASE_PATH}${pathname}`;
}

function rewriteLocation(location, upstreamUrl) {
  const url = new URL(location, upstreamUrl);

  if (url.hostname !== UPSTREAM_HOST) {
    return location;
  }

  url.hostname = CUSTOM_HOST;
  url.protocol = "https:";

  return `${url.pathname}${url.search}${url.hash}`;
}

export default {
  async fetch(request) {
    const incomingUrl = new URL(request.url);
    const upstreamUrl = new URL(request.url);

    upstreamUrl.hostname = UPSTREAM_HOST;
    upstreamUrl.protocol = "https:";
    upstreamUrl.pathname = resolveUpstreamPath(incomingUrl.pathname);

    const headers = new Headers(request.headers);
    headers.set("Host", UPSTREAM_HOST);
    headers.set("X-Forwarded-Host", CUSTOM_HOST);
    headers.set("X-Forwarded-Proto", "https");

    const init = {
      method: request.method,
      headers,
      redirect: "manual",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }

    const response = await fetch(new Request(upstreamUrl.toString(), init));
    const location = response.headers.get("Location");

    if (!location) {
      return response;
    }

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Location", rewriteLocation(location, upstreamUrl));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};
