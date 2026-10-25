export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.APIFOOTBALL_KEY;
  if (!key) {
    return res.status(503).json({ error: "服务端未配置 APIFOOTBALL_KEY，请在 Vercel 环境变量中设置。" });
  }

  try {
    const upstream = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: { "x-apisports-key": key }
    });
    const body = await upstream.json();
    if (!upstream.ok || (body.errors && Object.keys(body.errors).length > 0)) {
      return res.status(502).json({ error: "API-Football 请求失败，请检查 API Key、套餐额度或接口状态。" });
    }
    return res.status(200).json({ response: body.response || [], results: body.results || 0 });
  } catch {
    return res.status(502).json({ error: "无法连接足球数据服务，请稍后重试。" });
  }
}
