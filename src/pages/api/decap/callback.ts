import type { NextApiRequest, NextApiResponse } from "next"

/**
 * 웹 관리자(/admin) GitHub 로그인 2단계: 받은 code 를 토큰으로 바꿔
 * Decap CMS 창(opener)에 postMessage 로 전달합니다.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state } = req.query
  const cookieState = (req.headers.cookie || "").match(/(?:^|;\s*)decap_state=([a-f0-9]+)/)?.[1]
  const send = (status: "success" | "error", content: object) => {
    const message = `authorization:github:${status}:${JSON.stringify(content)}`
    res.setHeader("Content-Type", "text/html; charset=utf-8")
    res.setHeader("Set-Cookie", "decap_state=; Path=/api/decap; Max-Age=0")
    res.send(`<!doctype html><html><body><p>로그인 처리 중…</p><script>
(function () {
  var msg = ${JSON.stringify(message)};
  function receive(e) {
    if (e.origin !== window.location.origin) return;
    window.opener.postMessage(msg, e.origin);
    window.removeEventListener("message", receive);
  }
  window.addEventListener("message", receive, false);
  window.opener.postMessage("authorizing:github", window.location.origin);
})();
</script></body></html>`)
  }

  if (!code || !state || state !== cookieState) {
    send("error", { message: "로그인 상태 확인에 실패했어요. 다시 시도해 주세요." })
    return
  }
  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    const data = await r.json()
    if (!data.access_token) throw new Error(data.error_description || "토큰을 받지 못했어요.")
    send("success", { token: data.access_token, provider: "github" })
  } catch (e: any) {
    send("error", { message: e.message || "로그인에 실패했어요." })
  }
}
