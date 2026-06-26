// Next.js TV proxy route mock for file-system compatibility
export async function GET(req: any) {
  try {
    const urlStr = new URL(req.url).searchParams.get('url');
    if (!urlStr) {
      return new Response('Missing url parameter', { status: 400 });
    }

    const decodedUrl = decodeURIComponent(urlStr);
    const res = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });

    const headers = new Headers();
    const contentType = res.headers.get('content-type');
    if (contentType) headers.set('Content-Type', contentType);
    const contentLength = res.headers.get('content-length');
    if (contentLength) headers.set('Content-Length', contentLength);

    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');

    return new Response(res.body, {
      status: res.status,
      headers
    });
  } catch (err: any) {
    return new Response(err.message || 'IPTV Proxy Error', { status: 500 });
  }
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  headers.set('Access-Control-Allow-Headers', '*');
  return new Response(null, { status: 204, headers });
}
