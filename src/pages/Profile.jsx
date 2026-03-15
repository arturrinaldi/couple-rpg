import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, User as UserIcon, Link as LinkIcon, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [partnerEmail, setPartnerEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fix: Sync username when profile loads
  React.useEffect(() => {
    if (profile?.username && !username) {
      setUsername(profile.username);
    }
  }, [profile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Ensure email is also saved/updated
    const updates = {
      id: user.id,
      username,
      email: user.email,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    
    if (error) {
      alert("Erro ao atualizar perfil: " + error.message);
    } else {
      alert('Perfil do Peregrino atualizado!');
      refreshProfile();
    }
    setLoading(false);
  };

  const handleLinkPartner = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emailToSearch = partnerEmail.trim().toLowerCase();

    // Find partner by email
    const { data: partner, error: findError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('email', emailToSearch)
      .single();

    if (findError) {
      alert('Peregrino não encontrado. Verifique se o e-mail está correto e se ele já criou uma conta.');
    } else if (partner.id === user.id) {
      alert("Você não pode ser seu próprio parceiro!");
    } else {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ partner_id: partner.id })
        .eq('id', user.id);

      if (updateError) {
        alert("Erro ao vincular: " + updateError.message);
      } else {
        // Also update the partner's partner_id to create a TWO-WAY link
        await supabase
          .from('profiles')
          .update({ partner_id: user.id })
          .eq('id', partner.id);

        alert(`Você agora está unido a ${partner.username}!`);
        refreshProfile();
      }
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--medieval-gold)', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="medieval-font" style={{ fontSize: '1.8rem', color: 'var(--medieval-gold)' }}>Configurações</h1>
      </header>

      <div className="glass-card fade-in" style={{ padding: '30px', marginBottom: '32px', border: '4px solid var(--medieval-stone)' }}>
        <h3 className="medieval-font" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--medieval-gold)', fontSize: '1.4rem' }}>
          <UserIcon size={24} color="var(--primary)" />
          Seu Perfil
        </h3>
        <form onSubmit={handleUpdateProfile}>
          <div className="input-group">
            <label className="medieval-font">Nome de Aventureiro</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Ex: Sir Lancelot ou Lady Guinevere"
              required 
            />
          </div>
          <button type="submit" className="btn-primary medieval-font" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1.1rem' }} disabled={loading}>
            <Save size={20} />
            Salvar Peregrino
          </button>
        </form>
      </div>

      <div className="glass-card fade-in" style={{ padding: '30px', animationDelay: '0.1s', border: '4px solid var(--medieval-stone)' }}>
        <h3 className="medieval-font" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--medieval-gold)', fontSize: '1.4rem' }}>
          <LinkIcon size={24} color="var(--secondary)" />
          Vincular Parceiro
        </h3>
        {profile?.partner_id ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '8px', border: '2px solid var(--accent)', textAlign: 'center' }}>
            <p className="medieval-font" style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1.1rem' }}>✓ Vocês estão unidos para sempre!</p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '8px' }}>ID do Herói: {profile.partner_id}</p>
          </div>
        ) : (
          <form onSubmit={handleLinkPartner}>
            <p style={{ color: 'var(--text-dim)', fontSize: '1rem', marginBottom: '20px', fontStyle: 'italic' }}>Digite o e-mail de cadastro do seu parceiro para unirem suas forças.</p>
            <div className="input-group">
              <label className="medieval-font">E-mail do Parceiro</label>
              <input 
                type="email" 
                value={partnerEmail} 
                onChange={(e) => setPartnerEmail(e.target.value)} 
                placeholder="Ex: parceiro@reino.com"
                required 
              />
            </div>
            <button type="submit" className="btn-primary medieval-font" style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: '2px solid var(--medieval-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1.1rem' }} disabled={loading}>
              <LinkIcon size={20} />
              Buscar Alma Gêmea
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
