import type { VercelRequest, VercelResponse } from "@vercel/node";

const DEFAULT_UPSTREAM = "http://154.74.179.186:8181/simple-survey-api/api";

function buildUpstreamUrl(req: VercelRequest): string {
  const pathParam = req.query.path;
  const rawPath = Array.isArray(pathParam)
    ? pathParam.join("/")
    : (pathParam ?? "");
  const normalizedPath = rawPath.replace(/^api\//, "");

  const upstreamBase = process.env.SURVEY_API_BASE_URL || DEFAULT_UPSTREAM;
  const url = new URL(
    normalizedPath ? `${upstreamBase}/${normalizedPath}` : upstreamBase,
  );

  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path") continue;

    if (Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === "string") {
          url.searchParams.append(key, entry);
        }
      }
      continue;
    }

    if (typeof value === "string") {
      url.searchParams.append(key, value);
    }
  }

  return url.toString();
}

function getForwardBody(
  req: VercelRequest,
  method: string,
): BodyInit | undefined {
  if (["GET", "HEAD"].includes(method)) return undefined;
  if (typeof req.body === "string") return req.body;
  if (req.body === undefined || req.body === null) return undefined;
  if (req.body instanceof Uint8Array) return req.body as unknown as BodyInit;
  return JSON.stringify(req.body);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = (req.method || "GET").toUpperCase();
  const url = buildUpstreamUrl(req);

  const headers: Record<string, string> = {};
  if (typeof req.headers.authorization === "string") {
    headers.Authorization = req.headers.authorization;
  }
  if (typeof req.headers.accept === "string") {
    headers.Accept = req.headers.accept;
  }
  if (typeof req.headers["content-type"] === "string") {
    headers["Content-Type"] = req.headers["content-type"];
  }

  try {
    const upstreamResponse = await fetch(url, {
      method,
      headers,
      body: getForwardBody(req, method),
    });

    const body = new Uint8Array(await upstreamResponse.arrayBuffer());
    const contentType = upstreamResponse.headers.get("content-type");
    const contentDisposition = upstreamResponse.headers.get(
      "content-disposition",
    );

    if (contentType) res.setHeader("Content-Type", contentType);
    if (contentDisposition) {
      res.setHeader("Content-Disposition", contentDisposition);
    }

    res.status(upstreamResponse.status).send(body);
  } catch {
    res.status(502).json({ error: "Could not reach upstream API" });
  }
}
