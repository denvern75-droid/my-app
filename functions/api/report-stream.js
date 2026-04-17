</> JavaScript

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // API 키 체크
    if (!env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        }
      );
    }

    // 요청 데이터 받기
    const body = await request.json().catch(() => ({}));
    const prompt = (body.prompt || "").trim();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        }
      );
    }

    // OpenAI 호출
    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5.3",
        input: prompt
      })
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      return new Response(
        JSON.stringify({
          error: data?.error?.message || "OpenAI request failed",
          raw: data
        }),
        {
          status: openaiRes.status,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        output_text: data.output_text || "응답 없음"
      }),
      {
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "Unknown server error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  }
}