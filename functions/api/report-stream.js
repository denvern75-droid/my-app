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

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
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

    const outputText = extractResponseText(data);

    return jsonResponse({
      output_text: outputText || "응답 없음",
      model
    });
  } catch (error) {
    return jsonResponse({
      error: error?.message || "Unknown server error"
    }, { status: 500 });
  }
}
