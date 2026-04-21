const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8"
};

function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...(init.headers || {})
    }
  });
}

function extractResponseText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  const parts = [];

  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const block of content) {
      if (typeof block?.text === "string") parts.push(block.text);
    }
  }

  return parts.join("\n").trim();
}

function handleHealth(env) {
  const model = env.OPENAI_MODEL || "gpt-4.1-mini";
  const hasApiKey = Boolean(env.OPENAI_API_KEY);

  return jsonResponse({
    ok: true,
    status: "ok",
    service: "pages-worker",
    model,
    has_api_key: hasApiKey,
    openai_key_configured: hasApiKey
  });
}

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

async function handleReportStream(request, env) {
  const apiKey = env.OPENAI_API_KEY;
  const model = env.OPENAI_MODEL || "gpt-4.1-mini";

  if (!apiKey) {
    return jsonResponse({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

  if (!prompt) {
    return jsonResponse({ error: "prompt is required" }, { status: 400 });
  }

  const openaiRes = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: prompt,
      temperature: 0.4,
      max_output_tokens: 4000
    })
  });

  const data = await openaiRes.json().catch(() => ({}));

  if (!openaiRes.ok) {
    return jsonResponse({
      error: data?.error?.message || "OpenAI request failed",
      status: openaiRes.status
    }, { status: openaiRes.status });
  }

  return jsonResponse({
    output_text: extractResponseText(data) || "No response",
    model
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return handleHealth(env);
    }

    if (url.pathname === "/api/report-stream" && request.method === "OPTIONS") {
      return handleOptions();
    }

    if (url.pathname === "/api/report-stream" && request.method === "POST") {
      try {
        return await handleReportStream(request, env);
      } catch (error) {
        return jsonResponse({
          error: error?.message || "Unknown server error"
        }, { status: 500 });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
