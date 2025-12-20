import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  LogOut,
  PlusCircle,
  LayoutDashboard,
  BrainCircuit,
  CheckCircle,
  XCircle,
  Mail,
  Loader2,
  ArrowLeft,
  Wallet,
  Trash2,
  Info,
  Landmark,
  Calculator,
  TrendingUp,
  PieChart,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

// ==========================================
// 1)A - DESIGN SYSTEM & ANIMATIONS (CSS)
// ==========================================
const injectCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; background-color: #f8fafc; }

  /* TOOLTIPS PROFESSIONNELS */
  .tooltip-trigger { position: relative; display: inline-flex; align-items: center; cursor: help; color: #3b82f6; margin-left: 6px; }
  .tooltip-text { 
    visibility: hidden; width: 220px; background-color: #0f172a; color: #ffffff; text-align: center;
    border-radius: 12px; padding: 12px; position: absolute; z-index: 1000; bottom: 140%; left: 50%;
    margin-left: -110px; opacity: 0; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 11px; line-height: 1.5; pointer-events: none; border: 1px solid #1e293b;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  }
  .tooltip-trigger:hover .tooltip-text { visibility: visible; opacity: 1; transform: translateY(-5px); }

  /* EFFETS DE BOUTONS MENU - FIX NAVIGATION */
  .menu-btn:hover { border-color: #3b82f6 !important; transform: translateY(-3px); box-shadow: 0 15px 30px -5px rgba(0,0,0,0.08); }
  .menu-btn b { color: #1e293b !important; font-size: 16px; transition: color 0.2s; display: block; }
  .menu-btn:hover b { color: #3b82f6 !important; }

  /* INPUTS HAUT CONTRASTE */
  input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  input[type=number] { -moz-appearance: textfield; }
  input { transition: all 0.2s ease; outline: none; }
  input:focus { 
    border-color: #3b82f6 !important; background-color: #fff !important; 
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
  }

  /* MODAL / POPUP CUSTOM */
  .custom-modal {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 10000;
  }
  .modal-content {
    background: white; padding: 32px; border-radius: 28px; width: 90%; maxWidth: 400px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  }

  /* DELETE BUTTON */
  .btn-delete { cursor: pointer; color: #ef4444; transition: transform 0.2s; }
  .btn-delete:hover { transform: scale(1.15); }

  /* LINKEDIN LINK */
  .linkedin-link { 
    color: #64748b; 
    text-decoration: none; 
    font-size: 13px; 
    transition: color 0.2s; 
    display: flex; 
    align-items: center; 
    gap: 6px;
  }
  .linkedin-link:hover { color: #3b82f6; }
`;

function App() {
  // ==========================================
  // 1)B - ÉTATS (STATES)
  // ==========================================
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [view, setView] = useState<'menu' | 'add' | 'list' | 'ia'>('menu');
  const [notification, setNotification] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [biens, setBiens] = useState<any[]>([]);

  const [form, setForm] = useState({
    nom: '',
    loyer: '',
    charges: '',
    prix: '',
    ville: '',
    surface: '',
    credit: false,
    loue: true,
    emprunt: '',
    mens: '',
    remb: '',
    rev: '',
  });

  // ==========================================
  // 2)A - LOGIQUE CORE (SUPABASE)
  // ==========================================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );
    return () => subscription.unsubscribe();
  }, []);

  const fetchBiens = async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('biens')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    setBiens(data || []);
  };

  useEffect(() => {
    if (view === 'list' || view === 'ia') fetchBiens();
  }, [view, session]);

  const showNotify = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async () => {
    if (!session?.user) return;
    const { error } = await supabase.from('biens').insert([
      {
        nom: form.nom,
        loyer_mensuel: form.loue ? parseFloat(form.loyer) || 0 : 0,
        charges_mensuelles: parseFloat(form.charges) || 0,
        prix_achat: parseFloat(form.prix) || 0,
        ville: form.ville,
        surface_m2: parseFloat(form.surface) || 0,
        a_credit: form.credit,
        montant_emprunt: parseFloat(form.emprunt) || 0,
        mensualite: parseFloat(form.mens) || 0,
        montant_rembourse: parseFloat(form.remb) || 0,
        user_id: session.user.id,
      },
    ]);

    if (error) showNotify(error.message, 'error');
    else {
      showNotify('Bien ajouté au patrimoine ! ✨', 'success');
      setForm({
        ...form,
        nom: '',
        loyer: '',
        charges: '',
        prix: '',
        ville: '',
        surface: '',
        credit: false,
        loue: true,
      });
      setView('menu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous supprimer ce bien ?')) return;
    const { error } = await supabase.from('biens').delete().eq('id', id);
    if (!error) {
      showNotify('Bien supprimé', 'success');
      fetchBiens();
    }
  };

  // ==========================================
  // 2)B - LOGIQUE IA & CALCULS
  // ==========================================
  const totalDette = biens.reduce(
    (acc, b) => acc + ((b.montant_emprunt || 0) - (b.montant_rembourse || 0)),
    0
  );
  const totalInvesti = biens.reduce((acc, b) => acc + (b.prix_achat || 0), 0);
  const totalMensualites = biens.reduce(
    (acc, b) => acc + (b.mensualite || 0),
    0
  );
  const totalLoyers = biens.reduce((acc, b) => acc + (b.loyer_mensuel || 0), 0);

  const revAnnuels = parseFloat(form.rev) || 0;
  const revMensuels = revAnnuels / 12;
  const tauxEndettement =
    revMensuels > 0 ? ((totalMensualites / revMensuels) * 100).toFixed(1) : '0';

  const runAiAnalysis = () => {
    if (revAnnuels === 0) {
      showNotify('Veuillez entrer vos revenus', 'error');
      return;
    }
    setAiAnalysis('loading');
    setTimeout(() => {
      const conseil =
        revAnnuels > 60000
          ? "Votre TMI est élevée. L'IA préconise une SCI à l'IS pour éviter l'impôt sur le revenu et capitaliser sereinement."
          : "Le régime LMNP au réel est votre meilleur allié : les amortissements comptables rendront vos loyers totalement nets d'impôts.";
      setAiAnalysis({
        score:
          parseFloat(tauxEndettement) < 33
            ? 'Profil Premium'
            : 'Profil Restreint',
        conseil: conseil,
        capacite: Math.max(0, revMensuels * 0.35 - totalMensualites).toFixed(0),
      });
    }, 1500);
  };

  if (loading)
    return (
      <div style={centerPage}>
        <Loader2 className="animate-spin" size={48} color="#3b82f6" />
      </div>
    );

  return (
    <div style={appWrapper}>
      <style>{injectCSS}</style>

      {notification && (
        <div
          style={{
            ...toastStyle,
            backgroundColor:
              notification.type === 'success' ? '#10b981' : '#ef4444',
          }}
        >
          {notification.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* MODAL IA - CUSTOM DESIGN */}
      {aiAnalysis && aiAnalysis !== 'loading' && (
        <div className="custom-modal" onClick={() => setAiAnalysis(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  padding: 12,
                  backgroundColor: '#f5f3ff',
                  borderRadius: 16,
                }}
              >
                <BrainCircuit color="#8b5cf6" />
              </div>
              <h3 style={{ margin: 0, fontSize: 20 }}>Analyse Stratégique</h3>
            </div>
            <div style={{ marginBottom: 20 }}>
              <span
                style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Verdict Bancaire
              </span>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color:
                    aiAnalysis.score === 'Profil Premium'
                      ? '#10b981'
                      : '#f59e0b',
                }}
              >
                {aiAnalysis.score}
              </div>
            </div>
            <div
              style={{
                padding: 20,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 20,
                fontSize: 13,
                lineHeight: 1.6,
                color: '#475569',
                marginBottom: 20,
              }}
            >
              "{aiAnalysis.conseil}"
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 25,
              }}
            >
              <div>
                <span
                  style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}
                >
                  RESTE À EMPRUNTER
                </span>
                <div
                  style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6' }}
                >
                  {aiAnalysis.capacite}€ / mois
                </div>
              </div>
            </div>
            <button onClick={() => setAiAnalysis(null)} style={mainBtn}>
              Fermer le rapport
            </button>
          </div>
        </div>
      )}

      {aiAnalysis === 'loading' && (
        <div className="custom-modal">
          <div
            className="modal-content"
            style={{ textAlign: 'center', padding: 40 }}
          >
            <Loader2
              className="animate-spin"
              size={48}
              color="#8b5cf6"
              style={{ margin: '0 auto 20px' }}
            />
            <b style={{ display: 'block', fontSize: 18 }}>
              L'IA analyse votre empire...
            </b>
            <span
              style={{
                fontSize: 13,
                color: '#94a3b8',
                marginTop: 8,
                display: 'block',
              }}
            >
              Optimisation fiscale & bancaire
            </span>
          </div>
        </div>
      )}

      <div style={mainCard}>
        {!session ? (
          <div style={centerContent}>
            <div style={iconCircle}>
              <Landmark size={44} color="#3b82f6" />
            </div>
            <h1 style={titleStyle}>ImmoGestion Pro</h1>
            <p style={{ color: '#64748b', marginBottom: 32, fontSize: 15 }}>
              Pilotez vos actifs comme un professionnel.
            </p>
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>
                Votre Email{' '}
                <Tooltip text="Entrez votre email pour recevoir un lien d'accès sécurisé sans mot de passe." />
              </label>
              <input
                placeholder="Ex: invest@immo.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputField}
              />
              <button
                onClick={() =>
                  supabase.auth
                    .signInWithOtp({ email })
                    .then(() => showNotify('Lien envoyé ! 📧', 'success'))
                }
                style={mainBtn}
              >
                <Mail size={20} /> Se connecter
              </button>
            </div>

            {/* LIEN LINKEDIN */}
            <div style={{ marginTop: 30, textAlign: 'center' }}>
              <a
                href="https://www.linkedin.com/in/leopaullaisne"
                target="_blank"
                rel="noopener noreferrer"
                className="linkedin-link"
                style={{ justifyContent: 'center' }}
              >
                Créé par Léo-Paul Laisne
              </a>
            </div>
          </div>
        ) : (
          <div>
            {/* DISCLAIMER */}
            <div style={disclaimerBox}>
              <AlertCircle
                size={16}
                color="#f59e0b"
                style={{ flexShrink: 0 }}
              />
              <span style={{ fontSize: 11, lineHeight: 1.5, color: '#78716c' }}>
                Ceci n'est pas un conseil en investissement. Je partage
                simplement le fruit de ma réflexion personnelle.
              </span>
            </div>

            <header style={headerStyle}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                Dashboard
              </h2>
              <button onClick={() => supabase.auth.signOut()} style={logoutBtn}>
                <LogOut size={20} />
              </button>
            </header>

            {/* --- MENU PRINCIPAL (FIXED) --- */}
            {view === 'menu' && (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <button
                  onClick={() => setView('add')}
                  className="menu-btn"
                  style={menuBtnStyle}
                >
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#eff6ff',
                      borderRadius: 16,
                    }}
                  >
                    <PlusCircle size={28} color="#3b82f6" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <b>Ajouter un bien</b>
                    <span
                      style={{
                        fontSize: 12,
                        color: '#64748b',
                        display: 'block',
                      }}
                    >
                      Nouvelle acquisition
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setView('list')}
                  className="menu-btn"
                  style={menuBtnStyle}
                >
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#ecfdf5',
                      borderRadius: 16,
                    }}
                  >
                    <Wallet size={28} color="#10b981" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <b>Mon Patrimoine</b>
                    <span
                      style={{
                        fontSize: 12,
                        color: '#64748b',
                        display: 'block',
                      }}
                    >
                      Performance & Détails
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setView('ia')}
                  className="menu-btn"
                  style={menuBtnStyle}
                >
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: '#f5f3ff',
                      borderRadius: 16,
                    }}
                  >
                    <BrainCircuit size={28} color="#8b5cf6" />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <b>Conseils IA</b>
                    <span
                      style={{
                        fontSize: 12,
                        color: '#64748b',
                        display: 'block',
                      }}
                    >
                      Analyse & Stratégie
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* --- FORMULAIRE ACQUISITION --- */}
            {view === 'add' && (
              <div style={formWrapper}>
                <button onClick={() => setView('menu')} style={backBtn}>
                  <ArrowLeft size={18} /> Retour au menu
                </button>
                <h3
                  style={{
                    marginTop: 5,
                    marginBottom: 25,
                    fontSize: 20,
                    fontWeight: 800,
                  }}
                >
                  Fiche Acquisition
                </h3>

                <div style={inputGroup}>
                  <label style={labelStyle}>
                    Nom de l'actif{' '}
                    <Tooltip text="Nom clair (ex: Studio Centre) pour identifier ce bien." />
                  </label>
                  <input
                    placeholder="Ex: Appartement T3"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    style={inputField}
                  />

                  <div style={{ display: 'flex', gap: 15 }}>
                    <div style={{ flex: 2 }}>
                      <label style={labelStyle}>
                        Ville{' '}
                        <Tooltip text="Indispensable pour l'analyse des prix du marché par l'IA." />
                      </label>
                      <input
                        placeholder="Ville"
                        value={form.ville}
                        onChange={(e) =>
                          setForm({ ...form, ville: e.target.value })
                        }
                        style={inputField}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>
                        Surface{' '}
                        <Tooltip text="Surface habitable réelle en m²." />
                      </label>
                      <input
                        type="number"
                        placeholder="m²"
                        value={form.surface}
                        onChange={(e) =>
                          setForm({ ...form, surface: e.target.value })
                        }
                        style={inputField}
                      />
                    </div>
                  </div>

                  <label style={labelStyle}>
                    Prix d'achat global (€){' '}
                    <Tooltip text="Prix net vendeur + frais de notaire + frais d'agence." />
                  </label>
                  <input
                    type="number"
                    placeholder="Prix total"
                    value={form.prix}
                    onChange={(e) => setForm({ ...form, prix: e.target.value })}
                    style={inputField}
                  />

                  <div style={toggleBox}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#1e293b',
                        }}
                      >
                        Génère des revenus ?
                      </span>
                      <Tooltip text="Cochez si vous percevez des loyers pour ce bien." />
                    </div>
                    <input
                      type="checkbox"
                      style={{ width: 20, height: 20, cursor: 'pointer' }}
                      checked={form.loue}
                      onChange={(e) =>
                        setForm({ ...form, loue: e.target.checked })
                      }
                    />
                  </div>

                  {form.loue && (
                    <div style={{ display: 'flex', gap: 15 }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>
                          Loyer HC{' '}
                          <Tooltip text="Revenu mensuel hors charges." />
                        </label>
                        <input
                          type="number"
                          placeholder="Loyer"
                          value={form.loyer}
                          onChange={(e) =>
                            setForm({ ...form, loyer: e.target.value })
                          }
                          style={inputField}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>
                          Charges{' '}
                          <Tooltip text="Charges de copropriété par mois." />
                        </label>
                        <input
                          type="number"
                          placeholder="Charges"
                          value={form.charges}
                          onChange={(e) =>
                            setForm({ ...form, charges: e.target.value })
                          }
                          style={inputField}
                        />
                      </div>
                    </div>
                  )}

                  <div style={toggleBox}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#1e293b',
                        }}
                      >
                        Financement crédit ?
                      </span>
                      <Tooltip text="Activez pour renseigner vos mensualités bancaires." />
                    </div>
                    <input
                      type="checkbox"
                      style={{ width: 20, height: 20, cursor: 'pointer' }}
                      checked={form.credit}
                      onChange={(e) =>
                        setForm({ ...form, credit: e.target.checked })
                      }
                    />
                  </div>

                  {form.credit && (
                    <div style={subForm}>
                      <label style={labelStyle}>
                        Capital Emprunté{' '}
                        <Tooltip text="Montant total emprunté à la banque au départ." />
                      </label>
                      <input
                        type="number"
                        placeholder="Capital"
                        value={form.emprunt}
                        onChange={(e) =>
                          setForm({ ...form, emprunt: e.target.value })
                        }
                        style={inputField}
                      />
                      <div style={{ display: 'flex', gap: 15, marginTop: 8 }}>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>
                            Mensualité{' '}
                            <Tooltip text="Votre prélèvement mensuel prêt + assurance." />
                          </label>
                          <input
                            type="number"
                            placeholder="€ / mois"
                            value={form.mens}
                            onChange={(e) =>
                              setForm({ ...form, mens: e.target.value })
                            }
                            style={inputField}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>
                            Déjà remboursé{' '}
                            <Tooltip text="Montant du capital déjà amorti à ce jour." />
                          </label>
                          <input
                            type="number"
                            placeholder="Amorti"
                            value={form.remb}
                            onChange={(e) =>
                              setForm({ ...form, remb: e.target.value })
                            }
                            style={inputField}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={handleSave} style={saveBtn}>
                  Enregistrer l'actif
                </button>
              </div>
            )}

            {/* --- LISTE PATRIMOINE --- */}
            {view === 'list' && (
              <div style={formWrapper}>
                <button onClick={() => setView('menu')} style={backBtn}>
                  <ArrowLeft size={18} /> Retour
                </button>
                <div style={summaryCard}>
                  <div>
                    <span
                      style={{
                        fontSize: 10,
                        opacity: 0.8,
                        textTransform: 'uppercase',
                        fontWeight: 800,
                      }}
                    >
                      Valeur Nette
                    </span>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>
                      {(totalInvesti - totalDette).toLocaleString()}€
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: 10,
                        opacity: 0.8,
                        textTransform: 'uppercase',
                        fontWeight: 800,
                      }}
                    >
                      Encours Bancaire
                    </span>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 900,
                        color: '#fca5a5',
                      }}
                    >
                      {totalDette.toLocaleString()}€
                    </div>
                  </div>
                </div>

                <h3 style={{ marginBottom: 16, fontSize: 18 }}>
                  Inventaire des biens
                </h3>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 15 }}
                >
                  {biens.map((b) => {
                    const cf =
                      (b.loyer_mensuel || 0) -
                      (b.charges_mensuelles || 0) -
                      (b.mensualite || 0);
                    return (
                      <div key={b.id} style={bienCardStyle}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: 16,
                                color: '#1e293b',
                              }}
                            >
                              {b.nom}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: '#94a3b8',
                                marginTop: 3,
                              }}
                            >
                              {b.ville} • {b.surface_m2} m²
                            </div>
                          </div>
                          <Trash2
                            size={20}
                            onClick={() => handleDelete(b.id)}
                            className="btn-delete"
                          />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderTop: '1px solid #f8fafc',
                            paddingTop: 14,
                            marginTop: 14,
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontSize: 10,
                                color: '#94a3b8',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                              }}
                            >
                              Rendement
                            </span>
                            <div
                              style={{
                                fontWeight: 800,
                                color: '#10b981',
                                fontSize: 15,
                              }}
                            >
                              {(
                                ((b.loyer_mensuel * 12) / b.prix_achat) * 100 ||
                                0
                              ).toFixed(1)}
                              %
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                fontSize: 10,
                                color: '#94a3b8',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                              }}
                            >
                              Cashflow
                            </span>
                            <div
                              style={{
                                fontWeight: 900,
                                fontSize: 15,
                                color: cf >= 0 ? '#3b82f6' : '#ef4444',
                              }}
                            >
                              {cf > 0 ? '+' : ''}
                              {cf.toFixed(0)}€
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- VUE IA STRATÉGIQUE --- */}
            {view === 'ia' && (
              <div style={formWrapper}>
                <button onClick={() => setView('menu')} style={backBtn}>
                  <ArrowLeft size={18} /> Retour
                </button>
                <div
                  style={{
                    ...bienCardStyle,
                    backgroundColor: '#f5f3ff',
                    border: '1.5px solid #ddd6fe',
                    marginBottom: 20,
                    padding: 20,
                  }}
                >
                  <label
                    style={{
                      ...labelStyle,
                      color: '#6b21a8',
                      marginTop: 0,
                      marginBottom: 8,
                    }}
                  >
                    Revenus Annuels Bruts (€){' '}
                    <Tooltip text="Entrez votre salaire annuel pour que l'IA calcule votre taux d'endettement réel." />
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 50000"
                    value={form.rev}
                    onChange={(e) => setForm({ ...form, rev: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && runAiAnalysis()}
                    style={{
                      ...inputField,
                      backgroundColor: '#fff',
                      borderColor: '#c4b5fd',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 15,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{ ...bienCardStyle, textAlign: 'center', margin: 0 }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: '#94a3b8',
                        fontWeight: 800,
                      }}
                    >
                      ENDETTEMENT <Tooltip text="Limite conseillée : 35%." />
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 900,
                        color:
                          parseFloat(tauxEndettement) > 35
                            ? '#ef4444'
                            : '#10b981',
                      }}
                    >
                      {tauxEndettement}%
                    </div>
                  </div>
                  <div
                    style={{ ...bienCardStyle, textAlign: 'center', margin: 0 }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: '#94a3b8',
                        fontWeight: 800,
                      }}
                    >
                      LOYERS MENSUELS{' '}
                      <Tooltip text="Total de vos loyers bruts." />
                    </div>
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 900,
                        color: '#3b82f6',
                      }}
                    >
                      {totalLoyers.toFixed(0)}€
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    ...bienCardStyle,
                    padding: 25,
                    backgroundColor: '#fff',
                    border: '1.5px dashed #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 15,
                    }}
                  >
                    <ShieldCheck size={24} color="#10b981" />
                    <b style={{ fontSize: 15 }}>Santé Financière</b>
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: '#64748b',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    Votre cashflow net total est de{' '}
                    <b>{(totalLoyers - totalMensualites).toFixed(0)}€/mois</b>.
                    {parseFloat(tauxEndettement) < 35
                      ? " Vous avez encore une marge d'emprunt pour un nouveau projet !"
                      : " Votre capacité d'emprunt est saturée."}
                  </p>
                </div>

                <button
                  style={{
                    ...mainBtn,
                    backgroundColor: '#8b5cf6',
                    marginTop: 20,
                  }}
                  onClick={runAiAnalysis}
                >
                  <BrainCircuit size={22} /> Lancer l'Analyse IA
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// COMPOSANTS RÉUTILISABLES
const Tooltip = ({ text }: { text: string }) => (
  <div className="tooltip-trigger">
    <Info size={14} />
    <span className="tooltip-text">{text}</span>
  </div>
);

// STYLES OBJECTS
const appWrapper: any = {
  minHeight: '100vh',
  width: '100vw',
  backgroundColor: '#f8fafc',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  top: 0,
  left: 0,
};

const mainCard: any = {
  backgroundColor: '#fff',
  width: '92%',
  maxWidth: '440px',
  borderRadius: '32px',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
  padding: '32px',
};

const inputField: any = {
  padding: '16px',
  borderRadius: '16px',
  border: '1.5px solid #e2e8f0',
  fontSize: '16px',
  backgroundColor: '#f8fafc',
  color: '#0f172a',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: '6px',
};

const labelStyle: any = {
  fontSize: '11px',
  fontWeight: '800',
  color: '#94a3b8',
  marginTop: '18px',
  textTransform: 'uppercase',
  display: 'flex',
  alignItems: 'center',
  letterSpacing: '0.8px',
};

const saveBtn: any = {
  padding: '18px',
  backgroundColor: '#10b981',
  color: '#fff',
  border: 'none',
  borderRadius: '18px',
  cursor: 'pointer',
  fontWeight: '800',
  marginTop: '25px',
  width: '100%',
  fontSize: 16,
};

const mainBtn: any = {
  width: '100%',
  padding: '18px',
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '18px',
  cursor: 'pointer',
  fontWeight: '800',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 12,
  fontSize: 16,
};

const summaryCard: any = {
  display: 'flex',
  justifyContent: 'space-between',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  padding: '28px',
  borderRadius: '28px',
  color: '#fff',
  marginBottom: 28,
};

const bienCardStyle: any = {
  padding: '22px',
  borderRadius: '24px',
  border: '1.5px solid #f1f5f9',
  backgroundColor: '#fff',
  marginBottom: 15,
};

const toggleBox: any = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px',
  backgroundColor: '#f8fafc',
  borderRadius: '18px',
  marginTop: 15,
  border: '1.5px solid #f1f5f9',
};

const subForm: any = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '20px',
  borderLeft: '4px solid #3b82f6',
  backgroundColor: '#f8fafc',
  marginTop: 12,
  borderRadius: '0 20px 20px 0',
};

const centerPage: any = {
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f8fafc',
};

const centerContent: any = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 10,
};

const headerStyle: any = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 35,
};

const logoutBtn: any = {
  background: '#f1f5f9',
  border: 'none',
  padding: '12px',
  borderRadius: '15px',
  cursor: 'pointer',
  color: '#94a3b8',
};

const backBtn: any = {
  background: 'none',
  border: 'none',
  color: '#94a3b8',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 20,
  fontWeight: 800,
  padding: 0,
  fontSize: 15,
};

const toastStyle: any = {
  position: 'fixed',
  top: '24px',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '16px 32px',
  color: '#fff',
  borderRadius: '100px',
  zIndex: 99999,
  fontWeight: 800,
  fontSize: 14,
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
};

const titleStyle: any = {
  fontSize: '30px',
  fontWeight: '800',
  color: '#0f172a',
  margin: 0,
  letterSpacing: '-1px',
};

const iconCircle: any = {
  width: '84px',
  height: '84px',
  backgroundColor: '#eff6ff',
  borderRadius: '28px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 20,
};

const inputGroup: any = {
  display: 'flex',
  flexDirection: 'column',
};

const formWrapper: any = {};

const menuBtnStyle: any = {
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1.5px solid #f1f5f9',
  background: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 18,
  padding: 22,
  borderRadius: 24,
  width: '100%',
  outline: 'none',
};

const disclaimerBox: any = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
  padding: '14px 18px',
  backgroundColor: '#fef3c7',
  border: '1.5px solid #fde68a',
  borderRadius: '16px',
  marginBottom: 20,
};

export default App;
