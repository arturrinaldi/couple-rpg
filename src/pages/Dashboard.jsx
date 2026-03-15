import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sword, Shield, Star, Heart, Trophy, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const xpPercentage = profile ? (profile.xp % 100) : 0;

  return (
    <div className="container">
      <nav className="navbar" style={{ borderRadius: '0 0 20px 20px', marginBottom: '24px', marginX: '-20px' }}>
        <span className="logo">Couple RPG</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <UserIcon size={20} />
          </button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #334155)', border: '3px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : '👤'}
            </div>
            <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'var(--primary)', color: 'white', fontWeight: 'bold', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', border: '2px solid var(--bg-dark)' }}>
              Lvl {profile?.level || 1}
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{profile?.username || user?.email?.split('@')[0]}</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Relationship Warrior</p>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-dim)' }}>EXPERIENCE</span>
            <span style={{ color: 'var(--primary)' }}>{profile?.xp || 0} XP</span>
          </div>
          <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '5px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${xpPercentage}%`, 
                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                boxShadow: '0 0 10px var(--primary-glow)',
                transition: 'width 0.5s ease-out'
              }} 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', marginBottom: '4px' }}>
              <Star size={16} fill="currentColor" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>COINS</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profile?.coins || 0}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '4px' }}>
              <Heart size={16} fill="currentColor" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>LOVE LEVEL</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profile?.love_level || 1}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <button className="glass-card" onClick={() => navigate('/quests')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <Sword color="var(--secondary)" size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.125rem' }}>Quest Board</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Complete tasks to earn XP & Coins</p>
          </div>
          <div style={{ color: 'var(--text-dim)' }}>→</div>
        </button>

        <button className="glass-card" onClick={() => navigate('/rewards')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', border: 'none', color: 'white', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <Trophy color="var(--accent)" size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.125rem' }}>Rewards Shop</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Spend coins on special prizes</p>
          </div>
          <div style={{ color: 'var(--text-dim)' }}>→</div>
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
