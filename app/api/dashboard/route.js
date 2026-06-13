console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = userData.user.id;

  const [profileRes, scansRes, badgesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('scans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('user_badges').select('*').eq('user_id', userId).order('awarded_at', { ascending: false }),
  ]);

  if (profileRes.error) return NextResponse.json({ error: profileRes.error.message }, { status: 400 });
  if (scansRes.error) return NextResponse.json({ error: scansRes.error.message }, { status: 400 });
  if (badgesRes.error) return NextResponse.json({ error: badgesRes.error.message }, { status: 400 });

  return NextResponse.json({
    profile: profileRes.data,
    scans: scansRes.data,
    badges: badgesRes.data,
    summary: {
      totalScans: scansRes.data.length,
      latestScan: scansRes.data[0] || null,
      badgeCount: badgesRes.data.length,
    },
  });
}