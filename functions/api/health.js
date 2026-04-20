export async function onRequestGet(context) {
  const model = context.env.OPENAI_MODEL || "gpt-4.1-mini";
  const hasApiKey = Boolean(context.env.OPENAI_API_KEY);

  return new Response(
    JSON.stringify({
      ok: true,
      status: "ok",
      service: "pages-functions",
      model,
      has_api_key: hasApiKey,
      openai_key_configured: hasApiKey
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    }
  );
}
