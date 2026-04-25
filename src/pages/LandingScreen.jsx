import { ChevronRight } from 'lucide-react';

export default function LandingScreen({ onEnter, lang }) {
  return (
    <div className="fade-in flex flex-col items-center justify-center p-4" style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '1rem' }}>
          InsightX <span style={{color: 'var(--accent-color)'}}>AI</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-modern)' }}>
          {lang === 'en' ? 'Understand the World Around You' : 'अपने आस-पास की दुनिया को समझें'}
        </p>
      </div>
      
      <button 
        onClick={onEnter}
        style={{
          background: 'var(--primary-color)',
          color: 'white',
          padding: '1rem 3rem',
          fontSize: '1.125rem',
          fontFamily: 'var(--font-modern)',
          fontWeight: '600',
          border: 'none',
          borderRadius: '100px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(15, 23, 42, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(15, 23, 42, 0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(15, 23, 42, 0.2)';
        }}
      >
        {lang === 'en' ? 'Enter Platform' : 'शुरू करें'}
        <ChevronRight size={20} />
      </button>
    </div>
  );
}