export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawId = req.query?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).json({ error: "请提供有效的比赛 ID。" });
  }

  const key = process.env.APIFOOTBALL_KEY;
  if (!key) {
    return res.status(503).json({ error: "服务端未配置 APIFOOTBALL_KEY，请在 Vercel 环境变量中设置。" });
  }

  try {
    const url = `https://v3.football.api-sports.io/fixtures/statistics?fixture=${encodeURIComponent(id)}`;
    const upstream = await fetch(url, { headers: { "x-apisports-key": key } });
    const body = await upstream.json();
    if (!upstream.ok || (body.errors && Object.keys(body.errors).length > 0)) {
      return res.status(502).json({ error: "比赛统计请求失败，请检查 API Key、套餐额度或该赛事的数据覆盖。" });
    }
    return res.status(200).json({ response: body.response || [], statistics: body.response || [] });
  } catch {
    return res.status(502).json({ error: "无法连接足球数据服务，请稍后重试。" });
  }
}
