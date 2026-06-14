import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  url: z.string().url(),
});

const VT_BASE = 'https://www.virustotal.com/api/v3';

async function scanWithVirusTotal(url) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    throw new Error('VIRUSTOTAL_API_KEY is missing');
  }

  const submitRes = await fetch(`${VT_BASE}/urls`, {
    method: 'POST',
    headers: {
      'x-apikey': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ url }),
  });

  if (!submitRes.ok) {
    const text = await submitRes.text();
    throw new Error(`VirusTotal submit failed: ${text}`);
  }

  const submitData = await submitRes.json();
  const analysisId = submitData?.data?.id;

  if (!analysisId) {
    throw new Error('VirusTotal did not return an analysis id');
  }

  await new Promise((resolve) => setTimeout(resolve, 8000));

  const analysisRes = await fetch(`${VT_BASE}/analyses/${analysisId}`, {
    method: 'GET',
    headers: {
      'x-apikey': apiKey,
    },
  });

  if (!analysisRes.ok) {
    const text = await analysisRes.text();
    throw new Error(`VirusTotal analysis fetch failed: ${text}`);
  }

  const analysisData = await analysisRes.json();
  const stats = analysisData?.data?.attributes?.stats || {};

  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const harmless = stats.harmless || 0;
  const undetected = stats.undetected || 0;

  let risk_level = 'safe';
  let reason = 'No obvious phishing pattern detected';

  if (malicious > 0) {
    risk_level = 'blocked';
    reason = `${malicious} engines marked this URL as malicious`;
  } else if (suspicious > 0) {
    risk_level = 'risky';
    reason = `${suspicious} engines marked this URL as suspicious`;
  }

  return {
    risk_level,
    reason,
    stats: {
      malicious,
      suspicious,
      harmless,
      undetected,
    },
    analysis_id: analysisId,
    provider: 'virustotal',
  };
}

export async function POST(request) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = userData.user.id;
  const body = await request.json();

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid URL', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const result = await scanWithVirusTotal(parsed.data.url);

    const { data, error } = await supabase
      .from('scans')
      .insert({
        user_id: userId,
        scan_type: 'url',
        target: parsed.data.url,
        risk_level: result.risk_level,
        details: result,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ scan: data, result });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'VirusTotal scan failed' },
      { status: 500 }
    );
  }
}