export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.APIFOOTBALL_KEY;
  if (!key) return res.status(503).json({ error: "服务端尚未配置 APIFOOTBALL_KEY。请在部署平台环境变量中设置，不要把 Key 写进网页。" });
  try {
    const response = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: { "x-apisports-key": key }
    });
    const body = await response.json();
    if (!response.ok || (body.errors && Object.keys(body.errors).length)) {
      return res.status(response.status || 502).json({ error: "API-Football 返回错误", details: body.errors || body.message || null });
    }
    return res.status(200).json({ response: body.response || [], results: body.results || 0 });
  } catch (e) {
    return res.status(502).json({ error: "上游 API 请求失败", details: String(e.message || e) });
  }
}