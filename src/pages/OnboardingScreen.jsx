
import { useState } from 'react';
import { GraduationCap, Briefcase, Globe, BrainCircuit, ChevronRight } from 'lucide-react';

export default function OnboardingScreen({ onComplete, lang }) {
  const [formData, setFormData] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('insightx_user') || '{}');
    return {
      name: savedUser.name || '',
      email: savedUser.email || '',
      role: savedUser.role || 'student',
      interests: savedUser.interests || []
    };
  });
  const [interestInput, setInterestInput] = useState('');

  const suggestedInterests = ['AI', 'Technology', 'Finance', 'Space', 'Startups', 'Sports', 'Economy'];

  const profiles = [
    { id: 'student', title: lang==='en'?'Student':'छात्र', icon: <GraduationCap size={20} /> },
    { id: 'investor', title: lang==='en'?'Investor':'निवेशक', icon: <Briefcase size={20} /> },
    { id: 'general', title: lang==='en'?'General':'सामान्‍य', icon: <Globe size={20} /> },
    { id: 'youngExplorer', title: lang==='en'?'Young Explorer':'युवा खोजकर्ता', icon: <BrainCircuit size={20} /> },
  ];

  const addInterest = (interest) => {
    const trimmed = interest.trim();
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, trimmed]
      }));
    }
    setInterestInput('');
  };

  const removeInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const isReturningUser = !!localStorage.getItem('insightx_user');

  const handleEnter = async () => {
    if (isReturningUser || (formData.name && formData.email)) {
      // Merge with existing data if any
      const existingUser = JSON.parse(localStorage.getItem('insightx_user') || '{}');
      const updatedUser = { ...existingUser, ...formData };
      
      // POST to backend ONLY if dealing with a new capture or updates
      try {
        const response = await fetch('http://localhost:8001/api/users/onboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser)
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.user && data.user.id) {
                updatedUser.id = data.user.id;
            }
        } else {
            console.error("Failed to sync user with backend");
            // we proceed gracefully via localstorage anyway for UX flow
        }
      } catch(e) {
          console.error("Backend unreachable", e);
      }
      
      onComplete(updatedUser);
    } else {
      alert('Please enter at least Name and Email');
    }
  };

  return (
    <div className="fade-in onboarding-container">
      <div className="onboarding-card">
        <h2 className="onboarding-title">
          {isReturningUser ? (lang === 'en' ? 'Choose Your Focus' : 'अपना फोकस चुनें') : (lang === 'en' ? 'Welcome to InsightX' : 'InsightX में आपका स्वागत है')}
        </h2>
        <p className="onboarding-subtitle">
          {isReturningUser ? (lang === 'en' ? 'Switch profile or update interests' : 'प्रोफ़ाइल बदलें या रुचियां अपडेट करें') : (lang === 'en' ? 'Let\'s personalize your experience' : 'आइए आपके अनुभव को वैयक्तिकृत करें')}
        </p>

        {!isReturningUser && (
          <>
            <div className="form-group">
              <label>{lang === 'en' ? 'Name' : 'नाम'}</label>
              <input 
                type="text" 
                placeholder={lang === 'en' ? 'Enter your name' : 'अपना नाम दर्ज करें'} 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>{lang === 'en' ? 'Email' : 'ईमेल'}</label>
              <input 
                type="email" 
                placeholder={lang === 'en' ? 'Enter your email' : 'अपना ईमेल दर्ज करें'} 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>{lang === 'en' ? 'Select Profile' : 'प्रोफ़ाइल चुनें'}</label>
          <div className="role-grid">
            {profiles.map(p => (
              <div 
                key={p.id} 
                className={`role-option ${formData.role === p.id ? 'active' : ''}`}
                onClick={() => setFormData({...formData, role: p.id})}
              >
                {p.icon}
                <span>{p.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>{lang === 'en' ? 'What are your interests?' : 'आपकी रुचियां क्या हैं?'}</label>
          <div className="tag-input-wrapper">
            <input 
              type="text" 
              placeholder={lang === 'en' ? 'Type and press Enter or +' : 'टाइप करें और Enter दबाएं'} 
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addInterest(interestInput)}
            />
            <button className="add-tag-btn" onClick={() => addInterest(interestInput)}>+</button>
          </div>
          
          <div className="suggested-interests">
            {suggestedInterests.map(interest => (
              <button 
                key={interest} 
                className="suggested-btn"
                onClick={() => addInterest(interest)}
                disabled={formData.interests.includes(interest)}
              >
                {interest}
              </button>
            ))}
          </div>

          <div className="interest-tags">
            {formData.interests.map(interest => (
              <span key={interest} className="interest-tag">
                {interest}
                <button onClick={() => removeInterest(interest)}>✕</button>
              </span>
            ))}
          </div>
        </div>

        <button className="enter-platform-btn" onClick={handleEnter}>
          {lang === 'en' ? 'Enter Platform' : 'प्लेटफ़ॉर्म में प्रवेश करें'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
