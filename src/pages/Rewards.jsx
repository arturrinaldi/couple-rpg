import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Gift, ShoppingBag, Plus } from 'lucide-react';
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
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.5rem' }}>Rewards</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
          <Gift size={16} color="var(--warning)" fill="var(--warning)" />
          <span style={{ fontWeight: 700 }}>{profile?.coins || 0}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        {rewards.length === 0 ? (
          <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
            <p>No rewards available yet.</p>
          </div>
        ) : (
          rewards.map(reward => (
            <div key={reward.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShoppingBag color="var(--warning)" size={28} />
              </div>
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', height: '40px', display: 'flex', alignItems: 'center' }}>{reward.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontWeight: 800, marginBottom: '16px' }}>
                <Gift size={14} />
                <span>{reward.cost}</span>
              </div>
              <button 
                onClick={() => handleBuyReward(reward)}
                className="btn-primary" 
                style={{ width: '100%', padding: '8px', fontSize: '0.875rem' }}
                disabled={(profile?.coins || 0) < reward.cost}
              >
                Claim
              </button>
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={() => setShowAddModal(true)} className="btn-secondary" style={{ width: '100%', borderStyle: 'dashed' }}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Reward Option
        </button>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px' }}>New Reward</h2>
            <form onSubmit={handleCreateReward}>
              <div className="input-group">
                <label>Reward Name</label>
                <input 
                  type="text" 
                  value={newReward.title} 
                  onChange={(e) => setNewReward({...newReward, title: e.target.value})} 
                  placeholder="e.g. Special Dinner" 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Cost (Coins)</label>
                <input 
                  type="number" 
                  value={newReward.cost} 
                  onChange={(e) => setNewReward({...newReward, cost: parseInt(e.target.value)})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
