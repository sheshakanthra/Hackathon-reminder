// ─────────────────────────────────────────────────────────────
//  Email Reminder Service — uses Resend REST API via fetch()
//  No SDK required. Works entirely client-side.
//
//  From address: onboarding@resend.dev  (free tier, no domain needed)
//  Verified domain: set VITE_RESEND_FROM once you own a domain.
// ─────────────────────────────────────────────────────────────

import { getHackathons, getReminderState, setReminderSent } from './localStorage';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const FROM_ADDRESS    =
  import.meta.env.VITE_RESEND_FROM || 'HackReminder <onboarding@resend.dev>';

// ── Send a single email ────────────────────────────────────────

export async function sendReminderEmail({
  to,
  hackathonName,
  deadline,
  daysLeft,
  prizePool,
  location,
}) {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Reminders] VITE_RESEND_API_KEY not set — skipping send.');
    return null;
  }

  const urgencyColor = daysLeft === 0 ? '#dc2626' : daysLeft <= 3 ? '#d97706' : '#4f46e5';
  const urgencyLabel = daysLeft === 0
    ? "🔴 It's TODAY!"
    : daysLeft === 1
    ? '🟠 Tomorrow!'
    : `🟢 ${daysLeft} days left`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                max-width:600px;margin:0 auto;padding:32px 24px;
                background:#fff;border-radius:16px;
                border:1px solid #e5e7eb;">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;background:${urgencyColor};
                    color:#fff;font-size:13px;font-weight:700;
                    letter-spacing:.05em;padding:6px 16px;border-radius:999px;">
          ⏰ HACKREMINDER
        </div>
      </div>

      <!-- Title -->
      <h1 style="font-size:22px;font-weight:800;color:#111827;margin:0 0 6px;">
        ${hackathonName}
      </h1>
      <p style="font-size:15px;color:${urgencyColor};font-weight:700;margin:0 0 24px;">
        ${urgencyLabel}
      </p>

      <!-- Details table -->
      <table style="width:100%;border-collapse:collapse;
                    background:#f9fafb;border-radius:12px;overflow:hidden;
                    margin-bottom:24px;">
        <tr>
          <td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;
                     border-bottom:1px solid #f3f4f6;width:130px;">📅 Deadline</td>
          <td style="padding:12px 16px;color:#111827;font-weight:700;font-size:14px;
                     border-bottom:1px solid #f3f4f6;">${deadline}</td>
        </tr>
        ${prizePool ? `
        <tr>
          <td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;
                     border-bottom:1px solid #f3f4f6;">💰 Prize Pool</td>
          <td style="padding:12px 16px;color:#111827;font-weight:700;font-size:14px;
                     border-bottom:1px solid #f3f4f6;">${prizePool}</td>
        </tr>` : ''}
        ${location ? `
        <tr>
          <td style="padding:12px 16px;color:#6b7280;font-size:13px;font-weight:600;">
            📍 Location</td>
          <td style="padding:12px 16px;color:#111827;font-weight:700;font-size:14px;">
            ${location}</td>
        </tr>` : ''}
      </table>

      <!-- CTA -->
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);
                  border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="color:#e0e7ff;font-size:13px;margin:0 0 4px;">Don't miss this one.</p>
        <p style="color:#fff;font-weight:800;font-size:16px;margin:0;">
          🚀 You've got this — go submit!
        </p>
      </div>

      <!-- Footer -->
      <hr style="border:none;border-top:1px solid #f3f4f6;margin:0 0 16px;"/>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
        Sent by <strong>HackReminder</strong> · Automated deadline reminder
      </p>
    </div>
  `;

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      subject: `⏰ HackReminder: ${hackathonName} — ${urgencyLabel}`,
      html,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('[Reminders] Resend API error:', data);
    throw new Error(data?.message || `Resend error ${res.status}`);
  }
  console.log(`[Reminders] ✓ Sent to ${to} — id: ${data.id}`);
  return data;
}

// ── Reminder schedule helpers ──────────────────────────────────

/**
 * Returns the Date at which a specific reminder should fire.
 *   '7d'  → 7 days before deadline
 *   '1d'  → 1 day before deadline
 *   '0d'  → same day as deadline, at 09:00 local time
 */
function getReminderTime(isoDeadline, type) {
  const dl = new Date(isoDeadline);
  if (type === '7d') return new Date(dl.getTime() - 7  * 24 * 60 * 60 * 1000);
  if (type === '1d') return new Date(dl.getTime() - 1  * 24 * 60 * 60 * 1000);
  if (type === '0d') {
    const dayOf = new Date(dl);
    dayOf.setHours(9, 0, 0, 0);   // 9 AM local time on the deadline day
    return dayOf;
  }
  return dl;
}

// ── Main checker — call this on every app load ─────────────────

/**
 * Iterates all localStorage hackathons, computes reminder times,
 * and fires any that are overdue and haven't been sent yet.
 *
 * @param {string} userEmail   - address to send reminders to (from AuthContext)
 */
export async function checkAndSendReminders(userEmail) {
  if (!userEmail) return;

  const hackathons = getHackathons();
  const sentState  = getReminderState();
  const now        = new Date();

  const TYPES = [
    { key: '7d', label: '7 days' },
    { key: '1d', label: '1 day'  },
    { key: '0d', label: 'today'  },
  ];

  for (const hack of hackathons) {
    // Build the list of deadlines to check
    const deadlines = [
      hack.registrationDeadline ? { iso: hack.registrationDeadline, slug: 'reg', name: 'Registration' } : null,
      hack.pptDeadline          ? { iso: hack.pptDeadline,          slug: 'sub', name: 'Submission'    } : null,
    ].filter(Boolean);

    for (const { iso, slug, name } of deadlines) {
      const deadline = new Date(iso);
      if (isNaN(deadline)) continue;

      for (const { key } of TYPES) {
        const stateKey    = `${slug}_${key}`;                     // e.g. "reg_7d"
        const alreadySent = sentState[hack._id]?.[stateKey];
        if (alreadySent) continue;                                // skip if sent

        const fireAt = getReminderTime(iso, key);
        if (now < fireAt) continue;                               // not yet due

        // Days remaining until actual deadline (rounded up, min 0)
        const msLeft   = deadline.getTime() - now.getTime();
        const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

        const deadlineStr = deadline.toLocaleString([], {
          dateStyle: 'medium',
          timeStyle: 'short',
        });

        try {
          await sendReminderEmail({
            to: userEmail,
            hackathonName: hack.name,
            deadline: `${name} — ${deadlineStr}`,
            daysLeft,
            prizePool: hack.prize || hack.prize_pool || '',
            location:  hack.location || '',
          });

          // Mark as sent so it never fires again for this hackathon+type
          setReminderSent(hack._id, stateKey);
        } catch (err) {
          // Log but don't crash the app — try again next load
          console.error(
            `[Reminders] Failed sending ${key} reminder for "${hack.name}" (${name}):`,
            err.message
          );
        }
      }
    }
  }
}
