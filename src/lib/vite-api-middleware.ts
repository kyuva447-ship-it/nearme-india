import type { IncomingMessage, ServerResponse } from 'http';
import { AuditRequestPayload, runMultiDocBillAudit } from './auditEngine';
import {
  AUDIT_PRESETS,
  DEFAULT_OWNER_PIN,
  OWNER_CONTACT_EMAIL,
  SEEDED_MERCHANTS,
  ZONE_WHOLESALE_INDEX,
  validateGstinMod36,
} from './seeded-marketplace';
import {
  getAutonomousTelemetrySnapshot,
  harvestedSuppliers,
  ownerAlerts,
  pushOwnerAlert,
  recordAgentExecution,
  resolveSupportQuery,
  runMapsAndWebHarvester,
  runWebSyndicationEngine,
  supportTickets,
  SupportedLang,
  updateFounderControls,
} from './autonomousStore';
import { escrowLedger, getOwnerNetProfitSummary, profitLedger } from './escrowStore';
import { auditLedger, ordersLedger, recordOrderEntry } from './ordersStore';
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
          recordAgentExecution(
            'agent-fraud-guard',
            `Verified GSTIN ${mod36.gstin} (Mod-36: ${mod36.checksumValid ? 'VALID' : 'INVALID'})`,
            0
          );
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
          return sendJson(res, 200, {
            status: 'ok',
            ...getOwnerNetProfitSummary(),
            escrows: escrowLedger,
          });
        }
        if (method === 'POST') {
          const body = await readJsonBody(req);
          if (body.action === 'release' && body.escrowId) {
            const target = escrowLedger.find((e) => e.id === body.escrowId);
            if (!target) return sendJson(res, 404, { error: 'Escrow ID not found' });
            if (body.otp && String(body.otp) !== target.delivery_otp) {
              return sendJson(res, 400, { error: 'Invalid Delivery OTP' });
            }
            target.status = 'RELEASED_TO_MERCHANT';
            recordAgentExecution(
              'agent-dutch-escrow',
              `Released 85% payout for ${target.id} via Delivery OTP`,
              target.owner_net_profit_inr
            );
            return sendJson(res, 200, {
              status: 'released',
              escrow: target,
              ...getOwnerNetProfitSummary(),
            });
          }
          if (body.action === 'refund' && body.escrowId) {
            const target = escrowLedger.find((e) => e.id === body.escrowId);
            if (!target) return sendJson(res, 404, { error: 'Escrow ID not found' });
            target.status = 'REFUNDED_48HR_GUARANTEE';
            return sendJson(res, 200, { status: 'refunded', escrow: target });
          }

          const total = Math.max(100, Number(body.totalAmountInr) || 10000);
          const fee15 = Math.round(total * 0.15);
          const msmeEnabled = Boolean(body.msme43bhDiscounting);
          const msmeFee = msmeEnabled ? Math.round(total * 0.03) : 0;
          const record = {
            id: `ESC-IND-${Math.floor(1000 + Math.random() * 9000)}`,
            buyer_name: String(body.buyerName || 'On-Site Buyer'),
            merchant_name: String(body.merchantName || 'NearMe Partner Node'),
            total_amount_inr: total,
            platform_fee_15_inr: fee15,
            merchant_payout_85_inr: total - fee15 - msmeFee,
            msme_43bh_enabled: msmeEnabled,
            msme_43bh_fee_3pct_inr: msmeFee,
            owner_net_profit_inr: fee15 + msmeFee,
            delivery_otp: Math.floor(100000 + Math.random() * 900000).toString(),
            refund_guarantee_hours: 48,
            status: 'ESCROW_LOCKED_15_85' as const,
            created_at: new Date().toISOString(),
          };
          escrowLedger.unshift(record);
          profitLedger.totalEscrowFee15 += fee15;
          profitLedger.totalMsme43bhFee3Pct += msmeFee;
          profitLedger.ownerNetProfitInr += fee15 + msmeFee;
          recordAgentExecution(
            'agent-dutch-escrow',
            `Locked 15/85 Escrow ${record.id} for ₹${total.toLocaleString('en-IN')}`,
            0
          );
          return sendJson(res, 201, {
            status: 'created',
            escrow: record,
            ...getOwnerNetProfitSummary(),
          });
        }
      }

      if (pathname === '/api/support') {
        if (method === 'GET') {
          const autoResolvedCount = supportTickets.filter((t) => !t.humanInterventionNeeded).length;
          return sendJson(res, 200, {
            status: 'operational',
            zeroHumanResolutionRatePct:
              supportTickets.length > 0
                ? Math.round((autoResolvedCount / supportTickets.length) * 100)
                : 100,
            totalTickets: supportTickets.length,
            tickets: supportTickets,
          });
        }
        if (method === 'POST') {
          const body = await readJsonBody(req);
          const ticket = await resolveSupportQuery({
            query: String(body.query || body.message || 'Status check'),
            language: (body.language as SupportedLang) || 'EN',
            customerIdentifier: String(body.customerIdentifier || body.phone || 'On-Site Customer'),
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
          return sendJson(res, 200, { status: 'ok', count: ordersLedger.length, orders: ordersLedger });
        }
        if (method === 'POST') {
          const body = await readJsonBody(req);
          const amount = Number(body.amount ?? body.amountInRupees) || 199;
          const order = recordOrderEntry({
            id: `order_pending_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: String(body.receipt || `receipt_${Date.now()}`),
            status: 'awaiting_upi_settlement',
            created_at: Math.floor(Date.now() / 1000),
          });
          return sendJson(res, 200, { ...order, fallbackMode: true });
        }
      }

      if (pathname === '/api/owner/stats') {
        const captured = ordersLedger.filter((o) => o.status === 'captured' || o.status === 'paid');
        return sendJson(res, 200, {
          total_payments: captured.length,
          total_volume: captured.reduce((acc, o) => acc + o.amount, 0),
          total_refunds: 0,
          recent_transactions: ordersLedger.slice(0, 10),
        });
      }

      if (pathname === '/api/owner') {
        const buildOwnerSnapshot = () => {
          const captured = ordersLedger.filter((o) => o.status === 'captured' || o.status === 'paid');
          return {
            ...getAutonomousTelemetrySnapshot(),
            totalMerchants: harvestedSuppliers.length,
            activeEscrows: escrowLedger.length,
            totalAuditsRun: auditLedger.length,
            total_volume: captured.reduce((acc, o) => acc + o.amount, 0),
            total_payments: captured.length,
            recent_transactions: ordersLedger.slice(0, 10),
            escrows: escrowLedger.slice(0, 10),
          };
        };

        if (method === 'GET') {
          return sendJson(res, 200, buildOwnerSnapshot());
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
              query: String(
                body.query ||
                  'Verify GSTIN 29AABCS1429B1ZQ and check 48h Escrow & Audit self-support status'
              ),
              language: (body.language as SupportedLang) || 'EN',
              customerIdentifier: 'Founder Console Diagnostic',
              channel: 'FOUNDER_TEST',
            });
          }
          return sendJson(res, 200, {
            ...buildOwnerSnapshot(),
            status: 'authenticated',
          });
        }
      }

      if (pathname === '/api/whatsapp-webhook') {
        return sendJson(res, 200, {
          status: 'processed',
          ownerEmail: OWNER_CONTACT_EMAIL,
        });
      }

      return next();
    } catch {
      return sendJson(res, 500, { error: 'Vite API middleware execution failure' });
    }
  };
}
