import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  email: z.string().email(),
});

function getEmailRisk(email) {
  const domain = email.split('@')[1]?.toLowerCase();

  if (['test.com', 'mailinator.com'].includes(domain)) {
    return { risk_level: 'blocked', reason: 'Disposable or risky email domain' };
  }

  return {
    risk_level: 'risky',
    reason: 'Demo breach check: email should be checked against breach history',
    breaches_found: 0,
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
    return NextResponse.json({ error: 'Invalid email', issues: parsed.error.issues }, { status: 400 });
  }

  const result = getEmailRisk(parsed.data.email);

  const { data, error } = await supabase
    .from('scans')
    .insert({
      user_id: userId,
      scan_type: 'email',
      target: parsed.data.email,
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