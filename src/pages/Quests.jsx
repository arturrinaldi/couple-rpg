import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Plus, CheckCircle2, Clock, ShieldAlert, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const Quests = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('assigned_to_me'); // 'assigned_to_me' or 'created_by_me'
  const [quests, setQuests] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuest, setNewQuest] = useState({ title: '', description: '', xp: 10, coins: 5 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuests();
  }, [activeTab]);

  const fetchQuests = async () => {
    if (!user) return;
    
    let query = supabase.from('quests').select('*').order('created_at', { ascending: false });
    
    if (activeTab === 'assigned_to_me') {
      query = query.eq('assigned_to', user.id);
    } else {
      query = query.eq('created_by', user.id);
    }

    const { data, error } = await query;
    if (error) console.error('Error fetching quests:', error);
    else setQuests(data || []);
  };

  const handleCreateQuest = async (e) => {
    e.preventDefault();
    if (!profile?.partner_id) {
      alert('You need to link a partner first!');
      return;
    }

    const { error } = await supabase.from('quests').insert([{
      title: newQuest.title,
      description: newQuest.description,
      xp_reward: newQuest.xp,
      coin_reward: newQuest.coins,
      created_by: user.id,
      assigned_to: profile.partner_id,
      status: 'pending'
    }]);

    if (error) alert(error.message);
    else {
      setShowAddModal(false);
      setNewQuest({ title: '', description: '', xp: 10, coins: 5 });
      fetchQuests();
    }
  };

  const handleCompleteQuest = async (questId) => {
    const { error } = await supabase
      .from('quests')
      .update({ status: 'completed' })
      .eq('id', questId);

    if (error) alert(error.message);
    else fetchQuests();
  };

  const handleVerifyQuest = async (quest) => {
    const { error } = await supabase
      .from('quests')
      .update({ status: 'verified' })
      .eq('id', quest.id);

    if (error) {
      alert(error.message);
    } else {
      // Award XP and Coins to the partner
      const { data: partnerProfile } = await supabase
        .from('profiles')
        .select('xp, coins, level')
        .eq('id', quest.assigned_to)
        .single();
      
      if (partnerProfile) {
        const newXp = partnerProfile.xp + quest.xp_reward;
        const newCoins = partnerProfile.coins + quest.coin_reward;
        const newLevel = Math.floor(newXp / 100) + 1;

        await supabase.from('profiles').update({
          xp: newXp,
          coins: newCoins,
          level: newLevel
        }).eq('id', quest.assigned_to);
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f472b6', '#8b5cf6', '#10b981']
      });
      
      fetchQuests();
    }
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.5rem' }}>Quests</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ marginLeft: 'auto', background: 'var(--primary)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Plus size={20} />
        </button>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
        <button 
          onClick={() => setActiveTab('assigned_to_me')}
          style={{ 
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontSize: '0.875rem', fontWeight: 600,
            background: activeTab === 'assigned_to_me' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'assigned_to_me' ? 'white' : 'var(--text-dim)',
            transition: 'all 0.2s'
          }}
        >
          My Quests
        </button>
        <button 
          onClick={() => setActiveTab('created_by_me')}
          style={{ 
            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontSize: '0.875rem', fontWeight: 600,
            background: activeTab === 'created_by_me' ? 'var(--bg-card)' : 'transparent',
            color: activeTab === 'created_by_me' ? 'white' : 'var(--text-dim)',
            transition: 'all 0.2s'
          }}
        >
          Sent
        </button>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {quests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
            <p>No quests found.</p>
          </div>
        ) : (
          quests.map(quest => (
            <div key={quest.id} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '4px' }}>{quest.title}</h3>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>{quest.description}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>+{quest.xp_reward} XP</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)' }}>+{quest.coin_reward} Coins</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: quest.status === 'verified' ? 'var(--success)' : 'var(--text-dim)' }}>
                  {quest.status === 'pending' && <Clock size={14} />}
                  {quest.status === 'completed' && <CheckCircle2 size={14} color="var(--warning)" />}
                  {quest.status === 'verified' && <BadgeCheck size={14} />}
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{quest.status}</span>
                </div>

                {activeTab === 'assigned_to_me' && quest.status === 'pending' && (
                  <button onClick={() => handleCompleteQuest(quest.id)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                    Complete
                  </button>
                )}

                {activeTab === 'created_by_me' && quest.status === 'completed' && (
                  <button onClick={() => handleVerifyQuest(quest)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--success)' }}>
                    Verify
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px' }}>New Quest</h2>
            <form onSubmit={handleCreateQuest}>
              <div className="input-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={newQuest.title} 
                  onChange={(e) => setNewQuest({...newQuest, title: e.target.value})} 
                  placeholder="e.g. Wash the dishes" 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <input 
                  type="text" 
                  value={newQuest.description} 
                  onChange={(e) => setNewQuest({...newQuest, description: e.target.value})} 
                  placeholder="Additional details..." 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>XP Reward</label>
                  <input 
                    type="number" 
                    value={newQuest.xp} 
                    onChange={(e) => setNewQuest({...newQuest, xp: parseInt(e.target.value)})} 
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Coin Reward</label>
                  <input 
                    type="number" 
                    value={newQuest.coins} 
                    onChange={(e) => setNewQuest({...newQuest, coins: parseInt(e.target.value)})} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quests;
