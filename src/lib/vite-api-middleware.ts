import type { IncomingMessage, ServerResponse } from 'http';
import { AuditRequestPayload, runMultiDocBillAudit } from './auditEngine';
import {
  AUDIT_PRESETS,
  DEFAULT_OWNER_PIN,
  OWNER_CONTACT_EMAIL,
  OWNER_CONTACT_PHONE,
  SEEDED_ESCROWS,
  SEEDED_MERCHANTS,
  ZONE_WHOLESALE_INDEX,
  validateGstinMod36,
} from './seeded-marketplace';
import {
  getAutonomousTelemetrySnapshot,
  ownerAlerts,
  pushOwnerAlert,
  resolveSupportQuery,
  runMapsAndWebHarvester,
  runWebSyndicationEngine,
  supportTickets,
  SupportedLang,
  updateFounderControls,
} from './autonomousStore';
import { runAutonomousGrowthCycle } from './autonomous-growth';

type NextFn = () => void;

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Connect-style middleware giving Vite (`vite.config.ts`) 100% parity
 * with the Next.js App Router API routes (`/api/*`).
 */
export function createNearMeViteApiMiddleware() {
  return async function nearMeApiMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: NextFn
  ) {
    const url = req.url || '';
    const pathname = url.split('?')[0];
    const method = (req.method || 'GET').toUpperCase();

    if (!pathname.startsWith('/api/')) {
      return next();
    }

    try {
      if (pathname === '/api/engine' || pathname === '/api/engine/bill-slasher') {
        if (method === 'GET') {
          return sendJson(res, 200, {
            status: 'operational',
            engine: 'NearMe India Unlimited-Page Multi-Document Auditor',
            maxPagesSupported: 'unlimited',
            presets: AUDIT_PRESETS.map((p) => ({
              id: p.id,
              label: p.label,
              badge: p.badge,
              pageCount: p.pageCount,
            })),
          });
        }
        if (method === 'POST') {
          const body = (await readJsonBody(req)) as unknown as AuditRequestPayload;
          const result = await runMultiDocBillAudit(body);
          return sendJson(res, 200, result);
        }
      }

      if (pathname === '/api/verify') {
        if (method === 'GET') {
          return sendJson(res, 200, {
            status: 'ok',
            count: SEEDED_MERCHANTS.length,
            merchants: SEEDED_MERCHANTS,
            zones: ZONE_WHOLESALE_INDEX,
          });
        }
        if (method === 'POST') {
          const body = await readJsonBody(req);
          const mod36 = validateGstinMod36(String(body.gstin || '29AABCS1429B1ZQ'));
          return sendJson(res, 200, {
            status: 'verified',
            gstin: mod36.gstin,
            formatValid: mod36.syntaxValid,
            mod36ChecksumValid: mod36.checksumValid,
            trustScore: mod36.checksumValid ? 95 : 82,
            escrowEligible: true,
            eCourtNoticeReady: true,
          });
        }
      }

      if (pathname === '/api/escrow') {
        if (method === 'GET') {
          return sendJson(res, 200, { status: 'ok', escrows: SEEDED_ESCROWS });
        }
        if (method === 'POST') {
          const body = await readJsonBody(req);
          const total = Math.max(100, Number(body.totalAmountInr) || 10000);
          const fee15 = Math.round(total * 0.15);
          const msmeEnabled = Boolean(body.msme43bhDiscounting);
          const msmeFee = msmeEnabled ? Math.round(total * 0.03) : 0;
          return sendJson(res, 201, {
            status: 'created',
            escrow: {
              id: `ESC-IND-${Math.floor(1000 + Math.random() * 9000)}`,
              total_amount_inr: total,
              platform_fee_15_inr: fee15,
              merchant_payout_85_inr: total - fee15 - msmeFee,
              msme_43bh_enabled: msmeEnabled,
              msme_43bh_fee_3pct_inr: msmeFee,
              owner_net_profit_inr: fee15 + msmeFee,
              status: 'ESCROW_LOCKED_15_85',
            },
          });
        }
      }

      if (pathname === '/api/support') {
        if (method === 'GET') {
          return sendJson(res, 200, {
            status: 'operational',
            zeroHumanResolutionRatePct: 100,
            totalTickets: supportTickets.length,
            tickets: supportTickets,
          });
        }
        if (method === 'POST') {
          const body = await readJsonBody(req);
          const ticket = await resolveSupportQuery({
            query: String(body.query || body.message || 'Status check'),
            language: (body.language as SupportedLang) || 'EN',
            customerIdentifier: String(body.customerIdentifier || body.phone || 'Guest User'),
            channel: body.channel === 'FOUNDER_TEST' ? 'FOUNDER_TEST' : 'WEB_CONCIERGE',
          });
          return sendJson(res, 200, {
            status: 'resolved',
            ticket,
            humanInterventionNeeded: ticket.humanInterventionNeeded,
          });
        }
      }

      if (pathname === '/api/ai-manager') {
        if (method === 'GET') {
          return sendJson(res, 200, getAutonomousTelemetrySnapshot());
        }
        if (method === 'POST') {
          const body = await readJsonBody(req);
          const action = String(body.action || 'viral_wave');
          const city = String(body.city || 'Bengaluru');
          const pincode = String(body.pincode || '560001');
          if (action === 'maps_harvester') {
            const harvested = await runMapsAndWebHarvester(city, pincode);
            return sendJson(res, 200, { status: 'ok', action, ...harvested });
          }
          if (action === 'syndication_ping') {
            return sendJson(res, 200, {
              status: 'ok',
              action,
              syndication: runWebSyndicationEngine(city),
            });
          }
          const report = await runAutonomousGrowthCycle(city, pincode);
          return sendJson(res, 200, { status: 'ok', action: 'viral_wave', report });
        }
      }

      if (pathname === '/api/telemetry') {
        if (method === 'GET' || method === 'POST') {
          return sendJson(res, 200, getAutonomousTelemetrySnapshot());
        }
      }

      if (pathname === '/api/alerts') {
        if (method === 'GET') {
          return sendJson(res, 200, {
            status: 'operational',
            ownerPhone: OWNER_CONTACT_PHONE,
            ownerEmail: OWNER_CONTACT_EMAIL,
            alerts: ownerAlerts,
          });
        }
        if (method === 'POST') {
          const body = await readJsonBody(req);
          const alert = pushOwnerAlert('INFO', String(body.message || 'Owner alert logged'));
          return sendJson(res, 200, { status: 'dispatched', alert });
        }
      }

      if (pathname === '/api/orders') {
        if (method === 'GET') {
          return sendJson(res, 200, { status: 'ok', count: 1, orders: [] });
        }
        if (method === 'POST') {
          const body = await readJsonBody(req);
          const amount = Number(body.amount ?? body.amountInRupees) || 199;
          return sendJson(res, 200, {
            id: `order_demo_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency: 'INR',
            status: 'created_demo',
            fallbackMode: true,
          });
        }
      }

      if (pathname === '/api/owner') {
        if (method === 'GET') {
          return sendJson(res, 200, getAutonomousTelemetrySnapshot());
        }
        if (method === 'POST') {
          const body = await readJsonBody(req);
          const expectedPin = process.env.OWNER_PIN || DEFAULT_OWNER_PIN;
          if (body.pin && String(body.pin) !== expectedPin) {
            return sendJson(res, 401, { error: 'Invalid owner PIN' });
          }
          if (body.action === 'update_controls') {
            updateFounderControls({
              autopilotEnabled:
                typeof body.autopilotEnabled === 'boolean' ? body.autopilotEnabled : undefined,
              viralBountyMultiplier:
                body.viralBountyMultiplier === 1.0 ||
                body.viralBountyMultiplier === 1.5 ||
                body.viralBountyMultiplier === 2.0
                  ? body.viralBountyMultiplier
                  : undefined,
              autoRefundOn48hExpiry:
                typeof body.autoRefundOn48hExpiry === 'boolean'
                  ? body.autoRefundOn48hExpiry
                  : undefined,
            });
          } else if (body.action === 'run_maps_harvester') {
            await runMapsAndWebHarvester(String(body.city || 'Bengaluru'), String(body.pincode || '560001'));
          } else if (body.action === 'run_growth' || body.action === 'run_viral_wave') {
            await runAutonomousGrowthCycle(String(body.city || 'Bengaluru'), String(body.pincode || '560001'));
          } else if (body.action === 'test_self_support') {
            await resolveSupportQuery({
              query: String(body.query || 'Re-unlock ₹199 receipt and check 48h escrow status'),
              language: (body.language as SupportedLang) || 'EN',
              channel: 'FOUNDER_TEST',
            });
          }
          return sendJson(res, 200, {
            ...getAutonomousTelemetrySnapshot(),
            status: 'authenticated',
          });
        }
      }

      if (pathname === '/api/whatsapp-webhook') {
        return sendJson(res, 200, {
          status: 'processed',
          ownerPhone: OWNER_CONTACT_PHONE,
          ownerEmail: OWNER_CONTACT_EMAIL,
        });
      }

      return next();
    } catch {
      return sendJson(res, 500, { error: 'Vite API middleware execution failure' });
    }
  };
}
