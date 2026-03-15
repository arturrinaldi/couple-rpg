import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Gift, ShoppingBag, Plus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const Rewards = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReward, setNewReward] = useState({ title: '', cost: 50 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    const { data, error } = await supabase.from('rewards').select('*').order('cost', { ascending: true });
    if (error) console.error(error);
    else setRewards(data || []);
  };

  const handleBuyReward = async (reward) => {
    if ((profile?.coins || 0) < reward.cost) {
      alert('Not enough coins! Go complete some quests!');
      return;
    }

    // Deduct coins
    const { error } = await supabase
      .from('profiles')
      .update({ coins: profile.coins - reward.cost })
      .eq('id', user.id);

    if (error) alert(error.message);
    else {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#ffffff']
      });
      alert(`Claimed: ${reward.title}! Make sure to show this to your partner!`);
      refreshProfile();
    }
  };

  const handleCreateReward = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('rewards').insert([{
      title: newReward.title,
      cost: newReward.cost,
      created_by: user.id
    }]);

    if (error) alert(error.message);
    else {
      setShowAddModal(false);
      setNewReward({ title: '', cost: 50 });
      fetchRewards();
    }
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--medieval-gold)', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="medieval-font" style={{ fontSize: '1.8rem', color: 'var(--medieval-gold)' }}>Treasury Shop</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--medieval-stone)', padding: '8px 16px', borderRadius: '4px', border: '2px solid var(--medieval-gold)', boxShadow: '0 4px 0 rgba(0,0,0,0.3)' }}>
          <Star size={18} color="var(--medieval-gold)" fill="var(--medieval-gold)" />
          <span className="medieval-font" style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>{profile?.coins || 0}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        {rewards.length === 0 ? (
          <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px', color: 'var(--text-dim)', border: '2px dashed var(--glass-border)', borderRadius: '12px' }}>
            <p className="medieval-font">O baú de tesouros está vazio...</p>
          </div>
        ) : (
          rewards.map(reward => (
            <div key={reward.id} className="glass-card fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '3px solid var(--medieval-stone)' }}>
              <div style={{ background: 'var(--medieval-stone)', width: '70px', height: '70px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '2px solid var(--medieval-gold)', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
                <ShoppingBag color="var(--medieval-gold)" size={32} />
              </div>
              <h3 className="medieval-font" style={{ fontSize: '1.1rem', marginBottom: '12px', minHeight: '44px', color: 'var(--text-main)' }}>{reward.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--medieval-gold)', fontWeight: 800, marginBottom: '20px', fontSize: '1.1rem' }}>
                <Star size={16} fill="currentColor" />
                <span>{reward.cost} G</span>
              </div>
              <button 
                onClick={() => handleBuyReward(reward)}
                className="btn-primary medieval-font" 
                style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
                disabled={(profile?.coins || 0) < reward.cost}
              >
                Comprar
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={() => setShowAddModal(true)} className="medieval-font" style={{ width: '100%', background: 'rgba(251, 191, 36, 0.05)', color: 'var(--medieval-gold)', padding: '16px', borderRadius: '8px', border: '2px dashed var(--medieval-gold)', cursor: 'pointer', transition: 'all 0.2s' }}>
          <Plus size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          Propor Nova Recompensa
        </button>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(18, 12, 24, 0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '450px', padding: '32px', border: '6px double var(--medieval-gold)' }}>
            <h2 className="medieval-font" style={{ marginBottom: '24px', fontSize: '2rem', color: 'var(--medieval-gold)', textAlign: 'center' }}>Novo Item no Bazar</h2>
            <form onSubmit={handleCreateReward}>
              <div className="input-group">
                <label className="medieval-font">Nome da Recompensa</label>
                <input 
                  type="text" 
                  value={newReward.title} 
                  onChange={(e) => setNewReward({...newReward, title: e.target.value})} 
                  placeholder="Ex: Jantar Especial" 
                  required 
                />
              </div>
              <div className="input-group">
                <label className="medieval-font">Preço em Ouro</label>
                <input 
                  type="number" 
                  value={newReward.cost} 
                  onChange={(e) => setNewReward({...newReward, cost: parseInt(e.target.value)})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="medieval-font" style={{ flex: 1, background: 'none', border: '2px solid var(--glass-border)', color: 'var(--text-dim)', padding: '12px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" className="btn-primary medieval-font" style={{ flex: 1 }}>Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
