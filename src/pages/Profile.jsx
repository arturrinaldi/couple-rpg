import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, User, Link as LinkIcon, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [partnerUsername, setPartnerUsername] = useState('');
  const [username, setUsername] = useState(profile?.username || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const updates = {
      id: user.id,
      username,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    
    if (error) alert(error.message);
    else {
      alert('Profile updated!');
      refreshProfile();
    }
    setLoading(false);
  };

  const handleLinkPartner = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Find partner by username
    const { data: partner, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', partnerUsername)
      .single();

    if (findError) {
      alert('Partner not found. Make sure they created an account and set a username.');
    } else if (partner.id === user.id) {
      alert("You can't be your own partner! (Or can you... but not in this app)");
    } else {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ partner_id: partner.id })
        .eq('id', user.id);

      if (updateError) alert(updateError.message);
      else {
        alert('Partner linked successfully!');
        refreshProfile();
      }
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.5rem' }}>Settings</h1>
      </header>

      <div className="glass-card fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="var(--primary)" />
          My Profile
        </h3>
        <form onSubmit={handleUpdateProfile}>
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Your adventure name"
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            <Save size={18} />
            Save Profile
          </button>
        </form>
      </div>

      <div className="glass-card fade-in" style={{ padding: '24px', animationDelay: '0.1s' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LinkIcon size={18} color="var(--secondary)" />
          Link Partner
        </h3>
        {profile?.partner_id ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>✓ You are linked to a partner!</p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '4px' }}>Partner ID: {profile.partner_id}</p>
          </div>
        ) : (
          <form onSubmit={handleLinkPartner}>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '16px' }}>Enter your partner's username to connect your adventures.</p>
            <div className="input-group">
              <label>Partner's Username</label>
              <input 
                type="text" 
                value={partnerUsername} 
                onChange={(e) => setPartnerUsername(e.target.value)} 
                placeholder="Partner's name"
                required 
              />
            </div>
            <button type="submit" className="btn-secondary" style={{ width: '100%' }} disabled={loading}>
              <LinkIcon size={18} />
              Connect Partner
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
