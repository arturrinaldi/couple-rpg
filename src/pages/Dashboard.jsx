import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sword, Shield, Star, Heart, Trophy, LogOut, User as UserIcon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const [notifications, setNotifications] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const xpPercentage = profile ? (profile.xp % 100) : 0;

  return (
    <div className="container">
      <nav className="navbar" style={{ background: 'rgba(18, 12, 24, 0.9)', borderBottom: '3px solid var(--medieval-gold)', marginBottom: '32px' }}>
        <span className="logo medieval-font" style={{ color: 'var(--medieval-gold)', fontSize: '1.8rem' }}>Duo Quest</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: 'var(--medieval-gold)', cursor: 'pointer' }}>
            <UserIcon size={24} />
          </button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--medieval-gold)', cursor: 'pointer' }}>
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      {/* Notifications Alert */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          {notifications.map(n => (
            <div key={n.id} className="glass-card fade-in" style={{ padding: '16px', borderLeft: '6px solid var(--medieval-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(251, 191, 36, 0.1)', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Sword size={18} color="var(--medieval-gold)" />
                <p className="medieval-font" style={{ fontSize: '0.9rem', color: 'var(--medieval-gold)' }}>{n.message}</p>
              </div>
              <button 
                onClick={() => markAsRead(n.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card fade-in" style={{ padding: '30px', marginBottom: '32px', border: '4px solid var(--medieval-stone)', position: 'relative', overflow: 'visible' }}>
        <div style={{ position: 'absolute', top: '-15px', right: '20px', background: 'var(--medieval-gold)', color: '#000', padding: '4px 12px', borderRadius: '4px', fontWeight: 900, fontFamily: 'MedievalSharp', boxShadow: '0 4px 0 #b45309' }}>
          LVL {profile?.level || 1}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '12px', background: 'var(--medieval-stone)', border: '4px solid var(--medieval-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)' }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '8px' }} /> : '🧙‍♂️'}
            </div>
          </div>
          <div style={{ minWidth: '200px' }}>
            <h2 className="medieval-font" style={{ fontSize: '1.8rem', color: 'var(--medieval-gold)', marginBottom: '4px' }}>{profile?.username || user?.email?.split('@')[0]}</h2>
            <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Heart size={14} fill="currentColor" /> Eternal Partner
            </p>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '1rem', fontFamily: 'MedievalSharp', fontWeight: 600, color: 'var(--medieval-gold)' }}>
            <span>EXP POINTS</span>
            <span>{profile?.xp || 0} / {((profile?.level || 1) * 100)}</span>
          </div>
          <div style={{ height: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '2px', border: '2px solid var(--medieval-stone)' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${xpPercentage}%`, 
                background: 'linear-gradient(90deg, #be185d, #ec4899)',
                borderRadius: '2px',
                boxShadow: '0 0 15px var(--primary-glow)',
                transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }} 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '2px solid var(--medieval-stone)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--medieval-gold)', marginBottom: '4px' }}>
              <Star size={18} fill="currentColor" />
              <span className="medieval-font" style={{ fontSize: '0.9rem' }}>GOLD COINS</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{profile?.coins || 0}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '2px solid var(--medieval-stone)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '4px' }}>
              <Heart size={18} fill="currentColor" />
              <span className="medieval-font" style={{ fontSize: '0.9rem' }}>LOVE POWER</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{profile?.love_level || 1}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        <button className="glass-card" onClick={() => navigate('/quests')} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', border: '4px solid var(--medieval-stone)', color: 'white', textAlign: 'left', cursor: 'pointer', width: '100%', transition: 'all 0.2s' }}>
          <div style={{ background: 'rgba(190, 24, 93, 0.2)', padding: '16px', borderRadius: '8px', border: '2px solid #be185d' }}>
            <Sword color="var(--primary)" size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="medieval-font" style={{ fontSize: '1.4rem', color: 'var(--medieval-gold)' }}>Questing Grounds</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>Earn gold and glory for the kingdom</p>
          </div>
          <ChevronRight color="var(--medieval-gold)" size={24} />
        </button>

        <button className="glass-card" onClick={() => navigate('/rewards')} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', border: '4px solid var(--medieval-stone)', color: 'white', textAlign: 'left', cursor: 'pointer', width: '100%', transition: 'all 0.2s' }}>
          <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '16px', borderRadius: '8px', border: '2px solid var(--medieval-gold)' }}>
            <Trophy color="var(--medieval-gold)" size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="medieval-font" style={{ fontSize: '1.4rem', color: 'var(--medieval-gold)' }}>Treasury Shop</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>Spend your hard-earned gold</p>
          </div>
          <ChevronRight color="var(--medieval-gold)" size={24} />
        </button>
      </div>

      {!profile?.partner_id && (
        <div className="glass-card fade-in" style={{ marginTop: '24px', padding: '20px', border: '1px dashed var(--primary)', background: 'rgba(244, 114, 182, 0.05)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Partner Link Required</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '16px' }}>Link your account with your partner to start the adventure together!</p>
          <button onClick={() => navigate('/profile')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            Set Partner
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
