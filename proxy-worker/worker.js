export default {
  async fetch(request) {
    const url = new URL(request.url);
    // 反向代理到 Vercel 部署
    url.hostname = 'ai-world-monitor-dun.vercel.app';

    const modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.arrayBuffer()
        : undefined,
      redirect: 'manual',
    });

    modifiedRequest.headers.set('Host', 'ai-world-monitor-dun.vercel.app');

    let response = await fetch(modifiedRequest);

    response = new Response(response.body, response);
    response.headers.set('Access-Control-Allow-Origin', '*');

    return response;
  }
};
