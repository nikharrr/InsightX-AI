import { useState } from 'react';
import { MapPin, Calendar, CloudSun, User, LogOut, TrendingUp, MonitorPlay} from 'lucide-react';

export default function Home({ articles, profile, lang, onProfileClick, onArticleClick, fetchFeed }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [subTab, setSubTab] = useState('top'); // 'top' or 'forYou'
  
  const importantNews = articles.filter(n => n.isImportant);
  let feedNews = articles.filter(n => !n.isImportant);

  if (activeCategory !== 'All') {
    feedNews = articles.filter(n => n.category === activeCategory);
  }

  // Define forYouNews logic
  const userData = JSON.parse(localStorage.getItem('insightx_user') || '{}');
  const userInterests = userData.interests || [];
  
  const forYouNews = articles.filter(news => {
    // Priority 1: Match profile-specific content
    const hasProfileImpact = news.personalImpact && news.personalImpact[profile];
    
    // Priority 2: Match user interests (if any)
    const matchesInterest = userInterests.some(interest => 
      news.category.toLowerCase().includes(interest.toLowerCase()) || 
      news.title.toLowerCase().includes(interest.toLowerCase())
    );

    return hasProfileImpact || matchesInterest;
  });

  // Pre-defined categories
  const categories = ['All', 'Tech Innovation', 'AI & Future', 'Startups', 'Science', 'Global Trends', 'Sports', 'Entertainment', 'Lifestyle', 'Education', 'Economy', 'Careers', 'Politics'];

  const handleLogout = () => {
    localStorage.removeItem('insightx_user');
    window.location.hash = 'landing';
    window.location.reload(); // Hard reset for clean state
  };

  return (
    <div className="fade-in bg-white" style={{ minHeight: '100vh' }}>
      <header className="header">
        <div className="header-left">
          <div className="context-item">
            <MapPin size={14} />
            <span>Pune, IN</span>
          </div>
          <div className="context-item divider">|</div>
          <div className="context-item">
            <Calendar size={14} />
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="context-item divider">|</div>
          <div className="context-item">
            <CloudSun size={14} />
            <span>30°C</span>
          </div>
        </div>

        <div className="header-center">
          <div className="logo-text" onClick={() => window.location.hash = 'landing'} style={{ cursor: 'pointer' }}>
            InsightX <span>AI</span>
          </div>
          <div className="tagline">
            {profile === 'youngExplorer' ? (lang==='en'?'Learn the World!':'दुनिया सीखें!') : (lang==='en'?'Understand the World Around You':'दुनिया को समझें')}
          </div>
        </div>

        <div className="header-right">
          <button className="profile-icon" onClick={onProfileClick} title="Switch Profile">
            <User size={18} />
          </button>
          <button className="profile-icon logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* 1️⃣ LEFT SIDEBAR: Quick Reads */}
        <aside className="sidebar left-sidebar">
          <div className="sidebar-header">
            <TrendingUp size={16} />
            <h2 className="sidebar-title">Quick Reads</h2>
          </div>
          <div className="sidebar-scroll no-scrollbar">
            {articles.map(news => (
              <div key={`quick-${news.id}`} className="quick-read-item" onClick={() => onArticleClick(news.id)}>
                <span className="quick-tag">{news.category}</span>
                <h4 className="quick-headline">{lang === 'en' ? news.title : news.hindiTitle}</h4>
              </div>
            ))}
          </div>
        </aside>

        {/* 2️⃣ CENTER MAIN FEED */}
        <main className="center-feed p-4">
          <div className="feed-container">
            {/* 🎯 Layout: Title -> Categories -> SubTabs -> Cards */}
            <div className="profile-header fade-in">
              <h1 className="profile-title">
                {profile === 'investor' ? 'Market Portfolio & Insights' : 
                 profile === 'student' ? 'Academic & Campus Trends' : 
                 profile === 'youngExplorer' ? 'Fun Stories & Discoveries' : 
                 'Daily Digest & Global Updates'}
              </h1>
            </div>

            {/* Categories - Available for ALL profiles */}
            <div className="category-tabs fade-in">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`pill-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat);
                    if (cat === 'All') setSubTab('top');
                    if (fetchFeed) fetchFeed(cat);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

          {/* Sub Tabs for "All" Category */}
          {activeCategory === 'All' && (
            <div className="sub-tabs-container fade-in">
              <button 
                className={`sub-tab ${subTab === 'top' ? 'tab-active active' : 'tab-inactive'}`} 
                onClick={() => setSubTab('top')}
              >
                Top Stories
              </button>
              <button 
                className={`sub-tab ${subTab === 'forYou' ? 'tab-active active' : 'tab-inactive'}`} 
                onClick={() => setSubTab('forYou')}
              >
                For You
              </button>
            </div>
          )}

          {/* Content rendering */}
          <div className="feed-content-area fade-in">
            {activeCategory === 'All' ? (
              subTab === 'top' ? (
                /* Top Stories Tab */
                <div className="news-grid-vertical">
                  {importantNews.map(news => (
                    <div 
                      key={news.id} 
                      className={`news-card-horizontal ${profile === 'youngExplorer' ? 'young-explorer-card' : ''}`} 
                      onClick={() => onArticleClick(news.id)}
                    >
                      <div className="card-content">
                        <span className="category-tag-inline">{news.category}</span>
                        <h3 className="card-title">{lang === 'en' ? news.title : news.hindiTitle}</h3>
                        <p className="card-summary">{lang === 'en' ? news.summary : news.hindiSummary}</p>
                      </div>
                      {news.image && (
                        <div className="card-thumbnail-fixed">
                          <img src={news.image} alt="" className="news-image" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* For You Tab */
                <div className="news-grid-vertical">
                   {forYouNews.map(news => (
                     <div 
                        key={`foryou-${news.id}`} 
                        className={`news-card-horizontal ${profile === 'youngExplorer' ? 'young-explorer-card' : ''}`} 
                        onClick={() => onArticleClick(news.id)}
                     >
                       <div className="card-content">
                         <span className="category-tag-inline">{news.category}</span>
                         <h3 className="card-title">{lang === 'en' ? news.title : news.hindiTitle}</h3>
                         <p className="card-summary">{lang === 'en' ? news.summary : news.hindiSummary}</p>
                       </div>
                       {news.image && (
                         <div className="card-thumbnail-fixed">
                           <img src={news.image} alt="" className="news-image" />
                         </div>
                       )}
                     </div>
                  ))}
                </div>
              )
            ) : (
              /* Other Categories */
              <div className="news-grid-vertical">
                {feedNews.map(news => (
                   <div 
                      key={news.id} 
                      className={`news-card-horizontal ${profile === 'youngExplorer' ? 'young-explorer-card' : ''}`} 
                      onClick={() => onArticleClick(news.id)}
                   >
                     <div className="card-content">
                       <span className="category-tag-inline">{news.category}</span>
                       <h3 className="card-title">{lang === 'en' ? news.title : news.hindiTitle}</h3>
                       <p className="card-summary">{lang === 'en' ? news.summary : news.hindiSummary}</p>
                     </div>
                     {news.image && (
                       <div className="card-thumbnail-fixed">
                         <img src={news.image} alt="" className="news-image" />
                       </div>
                     )}
                   </div>
                ))}
                {feedNews.length === 0 && (
                  <p className="text-muted mt-2">No news found for this category.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

        {/* 3️⃣ RIGHT SIDEBAR: Visual Stories */}
        <aside className="sidebar right-sidebar">
          <div className="sidebar-header">
            <MonitorPlay size={16} />
            <h2 className="sidebar-title">Visual Stories</h2>
          </div>
          <div className="sidebar-scroll no-scrollbar">
            {articles.map(news => (
               <div key={`visual-${news.id}`} className="visual-story-card-overlay visual-card" onClick={() => onArticleClick(news.id)}>
                <img src={news.image} alt="" className="visual-bg" />
                <div className="visual-overlay">
                  <h4 className="visual-overlay-title">{lang === 'en' ? news.title : news.hindiTitle}</h4>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
