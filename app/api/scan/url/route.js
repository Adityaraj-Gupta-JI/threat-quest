import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  url: z.string().url(),
});

function getRisk(url) {
  const riskyWords = ['login', 'verify', 'update', 'secure', 'bank', 'wallet'];
  const match = riskyWords.some((word) => url.toLowerCase().includes(word));

  if (match) return { risk_level: 'risky', reason: 'Suspicious keyword detected' };
  return { risk_level: 'safe', reason: 'No obvious phishing pattern detected' };
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
    return NextResponse.json({ error: 'Invalid URL', issues: parsed.error.issues }, { status: 400 });
  }

  const result = getRisk(parsed.data.url);

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
}