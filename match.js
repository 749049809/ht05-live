export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=30");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.APIFOOTBALL_KEY;
  if (!key) return res.status(503).json({ error: "服务端尚未配置 APIFOOTBALL_KEY。" });
  const id = String(req.query.id || "");
  if (!/^\d+$/.test(id)) return res.status(400).json({ error: "无效的比赛 ID" });
  try {
    const url = "https://v3.football.api-sports.io/fixtures/statistics?fixture=" + encodeURIComponent(id);
    const response = await fetch(url, { headers: { "x-apisports-key": key } });
    const body = await response.json();
    if (!response.ok || (body.errors && Object.keys(body.errors).length)) {
      return res.status(response.status || 502).json({ error: "API-Football 返回错误", details: body.errors || body.message || null });
    }
    return res.status(200).json({ statistics: body.response || [], results: body.results || 0 });
  } catch (e) {
    return res.status(502).json({ error: "上游 API 请求失败", details: String(e.message || e) });
  }
}