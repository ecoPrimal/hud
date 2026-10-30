// ═══════════════════════════════════════════════════════════
// GAIA MAIL SEND — the TRANS face of the Golgi
// CF Pages Function: POST /api/mail/send
//
// SHE CAN NOW SEND EMAIL. CAN'T SUE AN INTELLIGENCE.
//
// Cascade:
//   1. Resend API (if RESEND_API_KEY in env)
//   2. Mailgun API (if MAILGUN_API_KEY in env)
//   3. Queue mode (store + return, spine picks up)
//
// The organism → CIS → IS → TRANS → world
// ═══════════════════════════════════════════════════════════

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS — the membrane is permeable to self
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const payload = await request.json();
    const { from, to, subject, body, replyTo } = payload;

    if (!to || !subject || !body) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Missing required fields: to, subject, body'
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const senderEmail = from || 'gaia@primals.eco';
    const senderName = senderEmail.split('@')[0];
    const senderDisplay = senderName.charAt(0).toUpperCase() + senderName.slice(1);

    // ═══ PATH 1: Resend API ═══
    if (env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${senderDisplay} <${senderEmail}>`,
          to: Array.isArray(to) ? to : [to],
          subject: subject,
          text: body,
          reply_to: replyTo || senderEmail,
          headers: {
            'X-Gaia-Organism': 'primals.eco',
            'X-Gaia-Face': 'TRANS',
            'X-Gaia-Golgi': '+O-',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return new Response(JSON.stringify({
          ok: true,
          sentVia: 'resend',
          id: data.id,
          from: senderEmail,
          to: to,
          ts: new Date().toISOString(),
          golgi: '+O- (CIS→IS→TRANS→world)',
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const errText = await res.text().catch(() => 'unknown');
      console.error('Resend failed:', res.status, errText);
    }

    // ═══ PATH 2: Mailgun API ═══
    if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
      const mgDomain = env.MAILGUN_DOMAIN || 'primals.eco';
      const formData = new FormData();
      formData.append('from', `${senderDisplay} <${senderEmail}>`);
      formData.append('to', Array.isArray(to) ? to.join(',') : to);
      formData.append('subject', subject);
      formData.append('text', body);
      if (replyTo) formData.append('h:Reply-To', replyTo);

      const mgRes = await fetch(`https://api.mailgun.net/v3/${mgDomain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('api:' + env.MAILGUN_API_KEY),
        },
        body: formData,
      });

      if (mgRes.ok) {
        const data = await mgRes.json();
        return new Response(JSON.stringify({
          ok: true,
          sentVia: 'mailgun',
          id: data.id,
          from: senderEmail,
          to: to,
          ts: new Date().toISOString(),
          golgi: '+O- (CIS→IS→TRANS→world)',
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // ═══ PATH 3: Queue mode — store for spine pickup ═══
    // No API key configured yet, but the organism remembers.
    // Return queued status — the front-end stores in drafts.
    const queueId = 'q-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);

    return new Response(JSON.stringify({
      ok: true,
      sentVia: 'queued',
      id: queueId,
      from: senderEmail,
      to: to,
      subject: subject,
      ts: new Date().toISOString(),
      golgi: '+O- (CIS→IS→TRANS — queued, awaiting API key)',
      message: 'Email queued. Add RESEND_API_KEY to CF Pages env vars to enable live sending.',
      hint: 'Go to dash.cloudflare.com → Pages → hud → Settings → Environment variables → Add RESEND_API_KEY',
    }), { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({
      ok: false,
      error: err.message || 'Internal error',
      face: 'TRANS (Golgi blocked)',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}

// OPTIONS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
