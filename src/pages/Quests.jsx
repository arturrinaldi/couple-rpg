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
      // Create notification for partner
      try {
        await supabase.from('notifications').insert([{
          user_id: profile.partner_id,
          message: `🛡️ Nova missão: ${newQuest.title}!`,
          read: false
        }]);
      } catch (e) {
        console.log("Notifications table not ready yet");
      }
      
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
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--medieval-gold)', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="medieval-font" style={{ fontSize: '1.8rem', color: 'var(--medieval-gold)' }}>Quest Board</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ marginLeft: 'auto', background: 'var(--medieval-stone)', border: '2px solid var(--medieval-gold)', width: '40px', height: '40px', borderRadius: '4px', color: 'var(--medieval-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 0 rgba(0,0,0,0.4)' }}
        >
          <Plus size={24} />
        </button>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--medieval-stone)', padding: '6px', borderRadius: '8px', border: '2px solid var(--glass-border)' }}>
        <button 
          onClick={() => setActiveTab('assigned_to_me')}
          className="medieval-font"
          style={{ 
            flex: 1, padding: '12px', borderRadius: '4px', border: 'none', fontSize: '1rem',
            background: activeTab === 'assigned_to_me' ? 'var(--medieval-gold)' : 'transparent',
            color: activeTab === 'assigned_to_me' ? '#000' : 'var(--text-dim)',
            transition: 'all 0.2s',
            fontWeight: 700
          }}
        >
          Minhas Missões
        </button>
        <button 
          onClick={() => setActiveTab('created_by_me')}
          className="medieval-font"
          style={{ 
            flex: 1, padding: '12px', borderRadius: '4px', border: 'none', fontSize: '1rem',
            background: activeTab === 'created_by_me' ? 'var(--medieval-gold)' : 'transparent',
            color: activeTab === 'created_by_me' ? '#000' : 'var(--text-dim)',
            transition: 'all 0.2s',
            fontWeight: 700
          }}
        >
          Enviadas
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {quests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)', border: '2px dashed var(--glass-border)', borderRadius: '12px' }}>
            <p className="medieval-font" style={{ fontSize: '1.2rem' }}>O quadro de avisos está vazio...</p>
          </div>
        ) : (
          quests.map(quest => (
            <div key={quest.id} className="glass-card fade-in" style={{ padding: '24px', border: '3px solid var(--medieval-stone)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="medieval-font" style={{ fontSize: '1.4rem', color: 'var(--medieval-gold)', marginBottom: '8px' }}>{quest.title}</h3>
                  <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: '1.4' }}>{quest.description}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', minWidth: '80px' }}>
                  <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '4px 8px', borderRadius: '4px', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', border: '1px solid var(--primary)' }}>
                    +{quest.xp_reward} XP
                  </div>
                  <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '4px 8px', borderRadius: '4px', color: 'var(--medieval-gold)', fontWeight: 800, fontSize: '0.8rem', border: '1px solid var(--medieval-gold)' }}>
                    +{quest.coin_reward} G
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--medieval-stone)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: quest.status === 'verified' ? 'var(--accent)' : 'var(--text-dim)', fontFamily: 'MedievalSharp' }}>
                  {quest.status === 'pending' && <Clock size={16} />}
                  {quest.status === 'completed' && <CheckCircle2 size={16} color="var(--medieval-gold)" />}
                  {quest.status === 'verified' && <BadgeCheck size={16} />}
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>{quest.status}</span>
                </div>

                {activeTab === 'assigned_to_me' && quest.status === 'pending' && (
                  <button onClick={() => handleCompleteQuest(quest.id)} className="btn-primary medieval-font" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    Completar
                  </button>
                )}

                {activeTab === 'created_by_me' && quest.status === 'completed' && (
                  <button onClick={() => handleVerifyQuest(quest)} className="btn-primary medieval-font" style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                    Validar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(18, 12, 24, 0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '450px', padding: '32px', border: '6px double var(--medieval-gold)' }}>
            <h2 className="medieval-font" style={{ marginBottom: '24px', fontSize: '2rem', color: 'var(--medieval-gold)', textAlign: 'center' }}>Nova Missão</h2>
            <form onSubmit={handleCreateQuest}>
              <div className="input-group">
                <label className="medieval-font">Título do Pergaminho</label>
                <input 
                  type="text" 
                  value={newQuest.title} 
                  onChange={(e) => setNewQuest({...newQuest, title: e.target.value})} 
                  placeholder="Ex: Lavar a louça sagrada" 
                  required 
                />
              </div>
              <div className="input-group">
                <label className="medieval-font">Descrição da Tarefa</label>
                <input 
                  type="text" 
                  value={newQuest.description} 
                  onChange={(e) => setNewQuest({...newQuest, description: e.target.value})} 
                  placeholder="Detalhes da aventura..." 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="medieval-font">Recompensa XP</label>
                  <input 
                    type="number" 
                    value={newQuest.xp} 
                    onChange={(e) => setNewQuest({...newQuest, xp: parseInt(e.target.value)})} 
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="medieval-font">Recompensa Ouro</label>
                  <input 
                    type="number" 
                    value={newQuest.coins} 
                    onChange={(e) => setNewQuest({...newQuest, coins: parseInt(e.target.value)})} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="medieval-font" style={{ flex: 1, background: 'none', border: '2px solid var(--glass-border)', color: 'var(--text-dim)', padding: '12px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" className="btn-primary medieval-font" style={{ flex: 1 }}>Proclamar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quests;
