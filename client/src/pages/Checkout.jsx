import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';
import { fmt } from '../lib.js';

const PLANS = {
  profesional: { amount: 2900, label: 'Profesional', desc: 'Documentos ilimitados · NFTs a 5€ c/u' },
  premium:     { amount: 7900, label: 'Premium',     desc: 'Todo Profesional + NFTs ilimitados + escribanos digitales' },
  nft:         { amount: 500,  label: 'Mintear NFT', desc: 'Un NFT en ETTIOS Blockchain (Chain ID 2237)' },
};

export default function Checkout() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [concept, setConcept] = useState(params.get('plan') || 'profesional');
  const [method, setMethod] = useState('redsys');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => { api.get('/payments/health').then(setHealth).catch(() => {}); }, []);

  if (!user) {
    return (
      <div className="auth-wrap">
        <div className="auth-box card">
          <h2>Iniciá sesión para pagar</h2>
          <p className="muted mt">Necesitás una cuenta para procesar el pago.</p>
          <Link to="/login" className="btn btn-primary mt">Ingresar</Link>
        </div>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const endpoint = method === 'bizum' ? '/payments/bizum/create' : '/payments/redsys/create';
      const body = method === 'bizum' ? { concept, phone } : { concept };
      const r = await api.post(endpoint, body);
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = r.form.url;
      for (const k of ['Ds_SignatureVersion', 'Ds_MerchantParameters', 'Ds_Signature']) {
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = k;
        inp.value = r.form[k];
        form.appendChild(inp);
      }
      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      setErr(e.message);
      setLoading(false);
    }
  }

  const selected = PLANS[concept];
  const configured = health?.redsys?.configured;
  const bizumAvailable = health?.bizum?.configured && health?.bizum?.enabled;

  return (
    <div className="auth-wrap">
      <div className="auth-box" style={{ maxWidth: 600 }}>
        <Link to="/" className="auth-brand">
          <div className="brand-mark">M<span>T</span>P</div>
          <div><strong style={{ fontSize: '1.05rem' }}>MTP Platform</strong><br /><small style={{ color: 'var(--cyan-600)' }}>Checkout seguro</small></div>
        </Link>
        <div className="card">
          <h2>Confirmar pago</h2>
          <p className="muted">Procesado por <strong>Redsys / CaixaBank Cyberpac</strong>. Tus datos viajan cifrados con HMAC-SHA256.</p>

          {!configured && (
            <div className="alert alert-warn mt">
              ⚠ Credenciales Redsys no configuradas. Editá <code>server/.env</code> con los datos de CaixaBank.
            </div>
          )}
          {err && <div className="alert alert-error mt">{err}</div>}

          <form onSubmit={submit} className="mt">
            <div className="field">
              <label>Concepto</label>
              <div className="plans">
                {Object.entries(PLANS).map(([k, p]) => (
                  <label key={k} className={`plan ${k === 'premium' ? 'is-premium' : ''}`}>
                    <input type="radio" name="concept" value={k} checked={concept === k} onChange={() => setConcept(k)} />
                    <div className="plan-inner">
                      <div className="plan-top">
                        <div className="plan-name">{p.label}</div>
                        <div className="plan-ico">{k === 'premium' ? '★' : k === 'profesional' ? '◆' : '◌'}</div>
                      </div>
                      <div className="plan-price">{fmt(p.amount)}</div>
                      <div className="dim" style={{ fontSize: '.78rem' }}>{p.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Método de pago</label>
              <div className="payment-methods">
                <label className={`pay-method ${method === 'redsys' ? 'active' : ''}`}>
                  <input type="radio" name="method" value="redsys" checked={method === 'redsys'} onChange={() => setMethod('redsys')} />
                  <div>
                    <strong>💳 Tarjeta</strong>
                    <div className="dim" style={{ fontSize: '.78rem' }}>Visa · Mastercard · CaixaBank · TPV virtual</div>
                  </div>
                </label>
                <label className={`pay-method ${method === 'bizum' ? 'active' : ''} ${!bizumAvailable ? 'disabled' : ''}`}>
                  <input type="radio" name="method" value="bizum" checked={method === 'bizum'} onChange={() => bizumAvailable && setMethod('bizum')} disabled={!bizumAvailable} />
                  <div>
                    <strong>📱 Bizum {!bizumAvailable && <span className="badge badge-neutral" style={{ fontSize: '.6rem' }}>no disp.</span>}</strong>
                    <div className="dim" style={{ fontSize: '.78rem' }}>Pagás con tu teléfono y SMS</div>
                  </div>
                </label>
              </div>
            </div>

            {method === 'bizum' && (
              <div className="field">
                <label>Teléfono asociado a Bizum *</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+34 600 12 34 56" />
              </div>
            )}

            <div className="row between mt" style={{ paddingTop: 16, borderTop: '1px solid var(--line)' }}>
              <div>
                <div className="dim" style={{ fontSize: '.78rem' }}>Total a pagar</div>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', letterSpacing: '-.02em' }}>{fmt(selected.amount)}</strong>
              </div>
              <button className="btn btn-primary" disabled={loading || !configured || (method === 'bizum' && !phone)}>
                {loading ? 'Redirigiendo…' : `Pagar con ${method === 'bizum' ? 'Bizum' : 'tarjeta'} →`}
              </button>
            </div>
          </form>
        </div>

        <p className="dim mt" style={{ textAlign: 'center', fontSize: '.8rem' }}>
          Al pagar aceptás los <Link to="/terms">Términos</Link> y la <Link to="/privacy">Política de Privacidad</Link>.
        </p>
      </div>
    </div>
  );
}
