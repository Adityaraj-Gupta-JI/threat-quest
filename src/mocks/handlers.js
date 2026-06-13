import { http, HttpResponse } from 'msw';

const mockProfile = {
  id: 'demo-user',
  username: 'ThreatQuestPlayer',
  security_score: 82,
  xp: 140,
  shield_active: true,
};

const mockScans = [
  {
    id: '1',
    scan_type: 'url',
    target: 'https://example.com/login',
    risk_level: 'risky',
    created_at: new Date().toISOString(),
    details: { reason: 'Suspicious keyword detected' },
  },
];

const mockBadges = [
  {
    id: '1',
    badge_name: 'First Scan',
    awarded_at: new Date().toISOString(),
  },
];

export const handlers = [
  http.get('/api/profile', () => {
    return HttpResponse.json({ profile: mockProfile });
  }),

  http.put('/api/profile', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      profile: { ...mockProfile, ...body },
    });
  }),

  http.post('/api/scan/url', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      scan: {
        id: crypto.randomUUID(),
        scan_type: 'url',
        target: body.url,
        risk_level: 'risky',
        created_at: new Date().toISOString(),
        details: { reason: 'Mock URL scan result' },
      },
      result: { risk_level: 'risky', reason: 'Mock URL scan result' },
    });
  }),

  http.post('/api/scan/email', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      scan: {
        id: crypto.randomUUID(),
        scan_type: 'email',
        target: body.email,
        risk_level: 'risky',
        created_at: new Date().toISOString(),
        details: { reason: 'Mock email breach result' },
      },
      result: { risk_level: 'risky', reason: 'Mock email breach result' },
    });
  }),

  http.get('/api/dashboard', () => {
    return HttpResponse.json({
      profile: mockProfile,
      scans: mockScans,
      badges: mockBadges,
      summary: {
        totalScans: mockScans.length,
        latestScan: mockScans[0],
        badgeCount: mockBadges.length,
      },
    });
  }),

  http.post('/api/badges/award', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      badge: {
        id: crypto.randomUUID(),
        badge_name: body.badge_name,
        awarded_at: new Date().toISOString(),
      },
    });
  }),

  http.post('/api/user/update-score', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      profile: {
        ...mockProfile,
        xp: mockProfile.xp + (body.xpDelta || 0),
        security_score: mockProfile.security_score + (body.scoreDelta || 0),
        shield_active: body.shieldActive ?? mockProfile.shield_active,
      },
    });
  }),
];