/**
 * MTP PLATFORM — Rutas de pagos.
 */
import { Router } from 'express';
import { Payment, User } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import { logActivity } from '../helpers.js';
import { createPayment, verifyNotification, generateOrderId, redsysHealth } from '../payments/redsys.js';
import { createBizumPayment, bizumHealth } from '../payments/bizum.js';

const r = Router();
const PRICES = {
  profesional: { amount: 2900, label: 'Membresía Profesional (mensual)' },
  premium:     { amount: 7900, label: 'Membresía Premium (mensual)' },
  nft:         { amount: 500,  label: 'Minteo de NFT en ETTIOS' },
};

r.get('/health', (_req, res) => res.json({ redsys: redsysHealth(), bizum: bizumHealth(), prices: PRICES }));

r.post('/redsys/create', requireAuth, async (req, res, next) => {
  try {
    const { concept } = req.body || {};
    if (!PRICES[concept]) return res.status(400).json({ error: 'concept inválido' });
    const orderId = generateOrderId();
    const { amount, label } = PRICES[concept];
    await Payment.create({ order_id: orderId, user_id: req.user.id, method: 'redsys', concept, amount, status: 'pendiente' });
    const form = createPayment({ orderId, amount, description: label, userId: req.user.id });
    await logActivity({ userId: req.user.id, action: 'payment_init', entity: 'payment', entityId: orderId,
                        details: `Redsys · ${concept} · ${amount/100} €`, ip: req.ip });
    res.json({ order_id: orderId, method: 'redsys', amount, label, form });
  } catch (e) { next(e); }
});

r.post('/bizum/create', requireAuth, async (req, res, next) => {
  try {
    const { concept, phone } = req.body || {};
    if (!PRICES[concept]) return res.status(400).json({ error: 'concept inválido' });
    if (!phone) return res.status(400).json({ error: 'phone es obligatorio' });
    const orderId = generateOrderId();
    const { amount, label } = PRICES[concept];
    await Payment.create({ order_id: orderId, user_id: req.user.id, method: 'bizum', concept, amount, phone, status: 'pendiente' });
    const form = createBizumPayment({ orderId, amount, phone, description: label, userId: req.user.id });
    await logActivity({ userId: req.user.id, action: 'payment_init', entity: 'payment', entityId: orderId,
                        details: `Bizum · ${concept} · ${amount/100} €`, ip: req.ip });
    res.json({ order_id: orderId, method: 'bizum', amount, label, phone: form.phone_masked, form });
  } catch (e) { next(e); }
});

r.post('/notify', async (req, res, next) => {
  try {
    const v = verifyNotification(req.body);
    if (!v.valid) return res.status(400).send('FIRMA_INVALIDA');
    const order = await Payment.findOne({ order_id: v.orderId });
    if (!order) return res.status(404).send('ORDEN_NO_ENCONTRADA');
    if (order.status !== 'pendiente') return res.send('OK');

    order.status = v.status;
    order.response_code = v.response_code;
    order.authorization_code = v.authorization_code;
    order.completed_at = new Date();
    await order.save();

    if (v.status === 'aprobado' && (order.concept === 'profesional' || order.concept === 'premium')) {
      await User.findByIdAndUpdate(order.user_id, { membership: order.concept });
    }
    await logActivity({ userId: order.user_id, action: 'payment_' + v.status, entity: 'payment',
                        entityId: v.orderId, details: `${order.method} · ${order.concept} · ${order.amount/100} €`, ip: req.ip });
    res.send('OK');
  } catch (e) { next(e); }
});

r.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const rows = await Payment.find({ user_id: req.user.id }).sort({ created_at: -1 }).limit(50).lean();
    res.json(rows);
  } catch (e) { next(e); }
});

r.get('/:orderId', requireAuth, async (req, res, next) => {
  try {
    const row = await Payment.findOne({ order_id: req.params.orderId, user_id: req.user.id }).lean();
    if (!row) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(row);
  } catch (e) { next(e); }
});

export default r;
