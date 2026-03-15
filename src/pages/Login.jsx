import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/');
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error, data } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          username: email.split('@')[0], 
        }
      }
    });
    
    if (error) {
      setError(error.message);
    } else {
      // Since email confirmation is disabled, user is auto-logged in or can login immediately
      if (data?.user) {
         navigate('/');
      } else {
         setError("Conta criada com sucesso! Você já pode entrar.");
         setIsSignUp(false);
      }
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card fade-in" style={{ padding: '40px', width: '100%', maxWidth: '450px', border: '6px double var(--medieval-gold)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 16px' }}>
            <Heart color="var(--primary)" fill="var(--primary)" size={80} style={{ filter: 'drop-shadow(0 0 10px var(--primary-glow))' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontWeight: 900 }}>DQ</div>
          </div>
          <h1 className="logo medieval-font" style={{ fontSize: '3rem', marginBottom: '8px', color: 'var(--medieval-gold)' }}>{isSignUp ? 'New Journey' : 'Duo Quest'}</h1>
          <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            {isSignUp ? 'Begin your romantic adventure...' : 'Welcome back, brave lover.'}
          </p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
          <div className="input-group">
            <label className="medieval-font">Royal Mail (Email)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="knight@kingdom.com" />
          </div>
          <div className="input-group">
            <label className="medieval-font">Secret Code (Password)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          
          <button type="submit" className="btn-primary medieval-font" style={{ width: '100%', marginTop: '12px', fontSize: '1.2rem' }} disabled={loading}>
            {loading ? 'Casting Spell...' : (isSignUp ? 'Embarcar na Missão' : 'Entrar no Reino')}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '8px' }}>
              {isSignUp ? 'Já possui uma conta?' : 'Ainda não começou sua jornada?'}
            </p>
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="medieval-font"
              style={{ background: 'none', border: 'none', color: 'var(--medieval-gold)', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem' }}
            >
              {isSignUp ? 'Fazer Login' : 'Criar Conta de Casal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
