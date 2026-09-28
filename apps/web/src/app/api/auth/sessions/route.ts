import { NextRequest, NextResponse } from 'next/server';
import { getSession, listSessions, revokeSession, revokeAllSessions } from '../../../../lib/auth';

function getSessionFromRequest(req: NextRequest) {
  const sessionId = req.cookies.get('session')?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

/** GET /api/auth/sessions — list active sessions for current user */
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userSessions = listSessions(session.userId).map((s) => ({
    sessionId: s.sessionId,
    createdAt: s.createdAt,
    lastSeen: s.lastSeen,
    userAgent: s.userAgent,
    ip: s.ip,
    isCurrent: s.sessionId === req.cookies.get('session')?.value,
  }));

  return NextResponse.json({ sessions: userSessions });
}

/** DELETE /api/auth/sessions — revoke session(s) */
export async function DELETE(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const target = searchParams.get('sessionId');

  if (target === 'all') {
    revokeAllSessions(session.userId);
  } else if (target) {
    revokeSession(target);
  } else {
    return NextResponse.json({ error: 'Provide sessionId or sessionId=all' }, { status: 400 });
  }

  const res = NextResponse.json({ success: true });
  if (target === 'all') {
    res.cookies.delete('session');
  }
  return res;
}
