import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  xpDelta: z.number().int().optional().default(0),
  scoreDelta: z.number().int().optional().default(0),
  shieldActive: z.boolean().optional(),
});

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
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 400 });
  }

  const newXp = Math.max(0, profile.xp + parsed.data.xpDelta);
  const newScore = Math.max(0, profile.security_score + parsed.data.scoreDelta);

  const { data, error } = await supabase
    .from('profiles')
    .update({
      xp: newXp,
      security_score: newScore,
      shield_active: parsed.data.shieldActive ?? profile.shield_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ profile: data });
}