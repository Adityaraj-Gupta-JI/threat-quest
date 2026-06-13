import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  badge_name: z.string().min(2).max(50),
});

export async function POST(request) {
  const supabase = awaitcreateClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = userData.user.id;
  const body = await request.json();

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid badge name', issues: parsed.error.issues }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .eq('badge_name', parsed.data.badge_name)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ message: 'Badge already awarded', badge: existing });
  }

  const { data, error } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_name: parsed.data.badge_name,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, badge: data });
}