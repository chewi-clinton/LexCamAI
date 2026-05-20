import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: upstream.status });
    }
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const buffer = await upstream.arrayBuffer();
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 502 });
  }
}
