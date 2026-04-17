export async function onRequestGet(context) {
  const hasKey = Boolean(context.env.OPENAI_API_KEY);

  return new Response(
    JSON.stringify({
      ok: true,
      service: "pages-functions",
      openai_key_configured: hasKey
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    }
  );
}