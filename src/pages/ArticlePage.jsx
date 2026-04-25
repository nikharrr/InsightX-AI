import { ArrowUp, ArrowDown, Minus, ArrowLeft, Languages, Headphones, MonitorPlay, ChevronRight, BrainCircuit, CheckCircle2, XCircle } from 'lucide-react';

export default function ArticlePage({ articleId, articles, profile, lang, setLang, onBack }) {
  const baseArticle = articles.find(n => n.id === articleId) || articles[0];
  const [article, setArticle] = React.useState(baseArticle);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [showVideo, setShowVideo] = React.useState(false);
  const [selectedOpt, setSelectedOpt] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('summary');

  React.useEffect(() => {
    if (!articleId) return;
    setIsLoading(true);
    const userData = JSON.parse(localStorage.getItem('insightx_user') || '{}');
    fetch('http://localhost:8001/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
         article_id: articleId && !String(articleId).startsWith('gnews_') ? articleId : null, 
         url: article?.url || null,
         title: article?.title || null,
         content: article?.content || null,
         profile: profile || 'student', 
         user_id: userData.id 
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.profile_used) {
        // Map backend InsightOutput to frontend expected structure
        const nextStepsMapped = data.next_steps ? data.next_steps.map(step => ({ en: step, hi: step })) : [];
        let personalImpacts = [];
        if (data.profile_specific_insights) {
          Object.values(data.profile_specific_insights).filter(Boolean).forEach(val => {
            if (Array.isArray(val)) {
              val.forEach(item => personalImpacts.push({ en: item, hi: item }));
            } else {
              personalImpacts.push({ en: String(val), hi: String(val) });
            }
          });
        }
        
        const mapped = {
          ...baseArticle,
          summary: data.summary || baseArticle.summary,
          hindiSummary: data.summary || baseArticle.hindiSummary,
          confidence: { en: data.fact_check_confidence, hi: data.fact_check_confidence },
          didYouKnow: { en: data.simplified_explainer || '', hi: data.simplified_explainer || '' },
          impactChain: Array.isArray(data.cause_effect) ? data.cause_effect : (data.cause_effect && typeof data.cause_effect === 'object' ? Object.keys(data.cause_effect).map(k => ({ text: k, description: data.cause_effect[k], direction: 'up' })) : [{ text: data.sentiment_label, direction: data.sentiment_label === 'positive' ? 'up' : 'down' }]),
          personalImpact: {
            [profile]: personalImpacts.length ? personalImpacts : [{ en: 'Analyzing impact...', hi: 'Analyzing impact...' }]
          },
          whatToDo: {
            [profile]: nextStepsMapped.length ? nextStepsMapped : [{ en: 'No immediate action required.', hi: 'No immediate action required.' }]
          },
          quiz: data.quiz && data.quiz.length > 0 ? {
            question: { en: data.quiz[0].question || '', hi: data.quiz[0].question || '' },
            options: (data.quiz[0].options || []).map(opt => ({ en: opt, hi: opt })),
            answerIndex: data.quiz[0].answer_index || 0
          } : null
        };
        setArticle(mapped);
      }
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [articleId, profile]);

  if (isLoading) {
    return (
      <div className="fade-in bg-white insight-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column' }}>
         <h2 style={{color: 'var(--primary-color)'}}>AI Agents are analyzing this article...</h2>
         <p style={{color: 'var(--text-secondary)'}}>Extracting facts, checking sentiment, and personalizing insights for you.</p>
         <button onClick={onBack} style={{marginTop: '20px', padding: '10px 20px', borderRadius: '50px', background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer'}}>Cancel</button>
      </div>
    );
  }

  const getLocalizedText = (obj) => {
    return lang === 'en' ? obj.en : (lang === 'hi' ? obj.hi : obj.marathi);
  };

  const getPropText = (obj, enKey, hiKey, mrKey) => {
    return lang === 'en' ? obj[enKey] : (lang === 'hi' ? obj[hiKey] : (obj[mrKey] || obj[hiKey]));
  };

  const renderDirectionIcon = (direction) => {
    switch(direction) {
      case 'up': return <ArrowUp size={24} className="text-accent" style={{color: 'var(--accent-color)'}} />;
      case 'down': return <ArrowDown size={24} style={{ color: '#dc2626' }} />;
      default: return <Minus size={24} className="text-muted" />;
    }
  };

  const cycleLanguage = () => {
    setLang(prev => prev === 'en' ? 'hi' : 'en');
  };

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const textToRead = lang === 'en' ? article.title : article.hindiTitle;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = lang === 'en' ? 'en-US' : 'hi-IN';
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <div className="fade-in bg-white insight-page-wrapper">
      <div className="immersive-container">
        <header className="insight-header">
          <button className="back-btn" onClick={onBack} aria-label="Go Back">
            <ArrowLeft size={20} /> <span>Back to Feed</span>
          </button>
          
          <div className="title-section">
            <h1 className="insight-hero-title">{getPropText(article, 'title', 'hindiTitle', 'marathiTitle')}</h1>
            <p className="insight-hero-subtitle">
              {getPropText(article, 'summary', 'hindiSummary', 'marathiSummary')}
            </p>
          </div>

          <div className="multimodal-actions">
            <button className="pill-action-btn" onClick={cycleLanguage}>
              <Languages size={18} />
              {lang === 'en' ? 'Translate to Hindi' : 'English में पढ़ें'}
            </button>
            <button className="pill-action-btn" onClick={toggleAudio}>
              <Headphones size={18} />
              {isPlaying ? (lang === 'en' ? 'Pause' : 'रोकें') : (lang === 'en' ? 'Listen' : 'सुनें')}
            </button>
            {article.videoSrc && (
              <button className="pill-action-btn" onClick={() => setShowVideo(!showVideo)}>
                <MonitorPlay size={18} />
                {lang === 'en' ? 'AI Video' : 'AI वीडियो'}
              </button>
            )}
          </div>
        </header>

        <div className="article-columns">
          <div className="article-main-col">
            {showVideo && article.videoSrc && (
              <div className="article-video-box">
                <video controls autoPlay loop>
                  <source src={article.videoSrc} type="video/mp4" />
                </video>
              </div>
            )}

            {!showVideo && article.image && (
              <div className="article-hero-image">
                <img src={article.image} alt="Hero" />
              </div>
            )}

            <div className="article-tabs">
              <button 
                className={`article-tab ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => setActiveTab('summary')}
              >
                Summary
              </button>
              <button 
                className={`article-tab ${activeTab === 'full' ? 'active' : ''}`}
                onClick={() => setActiveTab('full')}
              >
                Full Article
              </button>
            </div>

            <div className="article-body-content">
              {activeTab === 'summary' ? (
                <div className="summary-view fade-in">
                   <div className="inline-image image-right">
                     <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80" alt="Detail" />
                     <span className="caption">Contextual Visualization</span>
                   </div>
                   <p className="drop-cap">{getPropText(article, 'summary', 'hindiSummary', 'marathiSummary')}. {lang==='en'?'This development marks a significant shift in the current landscape, bringing forth new opportunities and challenges for stakeholders. Experts suggest that we are entering a pivotal moment where technological and social forces converge.':'यह विकास वर्तमान परिदृश्य में एक महत्वपूर्ण बदलाव का संकेत देता है, जो हितधारकों के लिए नए अवसर और चुनौतियां लेकर आता है।'}</p>
                   
                   <p>{lang==='en'?'The underlying data reveals a steady progression towards broader infrastructure support and global integration. As markets react to these shifting dynamics, the impact is being felt across multiple sectors, reinforcing the need for adaptive strategies and intelligent forecasting.':'अंतर्निहित डेटा व्यापक बुनियादी ढांचे के समर्थन और वैश्विक एकीकरण की ओर निरंतर प्रगति को प्रकट करता है।'}</p>
                </div>
              ) : (
                <div className="full-view fade-in">
                   <div className="inline-image image-left">
                     <img src="https://images.unsplash.com/photo-1544006659-f0b21f04cb1b?auto=format&fit=crop&w=400&q=80" alt="Innovation" />
                     <span className="caption">Expert Analysis</span>
                   </div>
                   <p className="drop-cap">{lang==='en'?'In an era defined by rapid transformation, the recent developments in our local and global systems present a compelling narrative of innovation and resilience. This extensive report underscores how fundamental shifts in resources and technology are reshaping established norms across the globe. As we delve deeper into the core drivers of this change, it becomes evident that the intersection of digital infrastructure and human ingenuity is at the forefront of the next economic cycle.':'तेजी से बदलाव के युग में, हमारी स्थानीय और वैश्विक प्रणालियों में हालिया घटनाक्रम नवाचार और लचीलेपन की एक सम्मोहक कहानी पेश करते हैं।'}</p>
                   
                   <p>{lang==='en'?'Detailed analysis from top-tier research institutions highlights the critical role of systematic integration. By aligning strategic goals with technological capabilities, organizations are finding new ways to drive growth while maintaining operational stability in uncertain times. The data suggests that companies adopting a "technology-first" mindset are outperforming their peers by a significant margin. This performance gap is expected to widen as AI-driven automation becomes the standard rather than the exception.':'शीर्ष शोध संस्थानों का विस्तृत विश्लेषण व्यवस्थित एकीकरण की महत्वपूर्ण भूमिका को उजागर करता है।'}</p>
                   
                   <p>{lang==='en'?'Furthermore, the social implications of these changes are becoming increasingly apparent. From educational transformations to shifting economic models, the ripple effects are pervasive, touching every aspect of modern life. Educational institutions are already beginning to pivot their curricula toward the skills of the future, focusing on high-level cognitive tasks that complement machine efficiency. This shift represents a fundamental rebranding of the workforce as we know it, with a premium placed on adaptability and lifelong learning.':'इसके अलावा, इन परिवर्तनों के सामाजिक प्रभाव तेजी से स्पष्ट होते जा रहे हैं।'}</p>

                   <p>{lang==='en'?'Looking ahead, the long-term sustainability of these advancements will depend heavily on regulatory frameworks and ethical considerations. Policymakers are now tasked with the difficult challenge of fostering innovation while protecting public interests. Early indicators suggest a trend toward more unified global standards, which could significantly reduce friction in international trade and data exchange. As new data emerge daily, the ability to interpret and act on this information will be the primary differentiator for leaders in the coming decade.':'आगे बढ़ते हुए, इन प्रगतियों की दीर्घकालिक स्थिरता नियामक ढांचे और नैतिक विचारों पर निर्भर करेगी।'}</p>

                   <p>{lang==='en'?'In conclusion, while the path forward presents its share of complexities, the opportunities for positive impact have never been greater. By embracing these shifts with a focus on collaborative problem-solving and ethical implementation, we can ensure that the benefits of this transformation are shared broadly across society. The key takeaway for stakeholders is clear: remain agile, stay informed, and prioritize inclusive growth in every strategic decision.':'अंत में, जबकि आगे का रास्ता अपनी जटिलताओं का हिस्सा प्रस्तुत करता है, सकारात्मक प्रभाव के अवसर कभी इतने महान नहीं रहे हैं।'}</p>
                </div>
              )}
            </div>
          </div>

          <aside className="article-right-col">
            <div className="sticky-panel">
              <div className="chain-header">
                <h2 className="chain-title">
                  {profile === 'youngExplorer' ? 'How It Works' : 'Chain Reaction'}
                </h2>
                <div className="impact-badge high">High Impact</div>
              </div>

              <div className="vertical-chain">
                {article.impactChain.map((node, i) => (
                  <div key={i} className="chain-node-card">
                    <div className={`chain-icon-box ${node.direction}`}>
                      {renderDirectionIcon(node.direction)}
                    </div>
                    <div className="chain-content-box">
                      <div className="chain-label">{lang === 'en' ? node.text : (node.hindiText || node.text)}</div>
                      <div className="chain-desc">{lang === 'en' ? (node.description || 'Direct influence on market metrics') : (node.hindiDescription || node.description || 'बाजार मेट्रिक्स पर सीधा प्रभाव')}</div>
                    </div>
                  </div>
                ))}
              </div>

              {profile !== 'youngExplorer' && (
                <div className="watch-next-sidebar" style={{ marginTop: '2.5rem' }}>
                  <h3 className="chain-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                    {lang === 'en' ? 'Watch Next' : 'आगे क्या देखना है'}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {(article.watchNext || []).map((watch, i) => (
                      <div key={i} className="chain-node-card" style={{ padding: '1rem', alignItems: 'center' }}>
                        <ChevronRight size={16} color="var(--accent-color)" />
                        <span className="font-medium text-sm">{getLocalizedText(watch)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* 🔻 BELOW ARTICLE (FULL WIDTH) */}
        <div className="article-footer-sections">
           <div className="footer-grid">
              {/* Personal Impact */}
              <section className="footer-insight-card" style={{ marginBottom: 0 }}>
                 <h2 className="footer-section-title">
                   {profile === 'youngExplorer' ? 'Why It Matters To You' : 'What this means for you'}
                 </h2>
                 <div className="profile-badge">{profile} profile</div>
                 <ul className="footer-list">
                   {(article.personalImpact[profile] || article.personalImpact.general).map((impact, i) => (
                     <li key={i}>{getLocalizedText(impact)}</li>
                   ))}
                 </ul>
              </section>

              {/* Action Suggestions */}
              <section className="footer-insight-card" style={{ marginBottom: 0 }}>
                <h2 className="footer-section-title">
                  {profile === 'youngExplorer' ? 'Things You Can Do!' : 'Action Suggestions'}
                </h2>
                <ul className="footer-list">
                  {(article.whatToDo[profile] || article.whatToDo.general).map((action, i) => (
                    <li key={i}>{getLocalizedText(action)}</li>
                  ))}
                </ul>
              </section>
           </div>
        </div>
      </div>

        {/* Quiz for Young Explorer */}
        {profile === 'youngExplorer' && article.quiz && (
          <div className="quiz-box fade-in">
            <h3 className="font-heading text-lg mb-2" style={{color: '#86198f', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <BrainCircuit size={20} /> Quick Quiz!
            </h3>
            <p className="mb-3 font-medium" style={{color: '#701a75'}}>{getLocalizedText(article.quiz.question)}</p>
            <div>
              {article.quiz.options.map((opt, i) => {
                let statusClass = '';
                if (selectedOpt !== null) {
                  if (i === article.quiz.answerIndex) statusClass = 'correct';
                  else if (i === selectedOpt) statusClass = 'wrong';
                }
                return (
                  <button 
                    key={i} 
                    className={`quiz-option ${statusClass}`}
                    onClick={() => { if(selectedOpt === null) setSelectedOpt(i); }}
                    disabled={selectedOpt !== null}
                  >
                    <span style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                      {getLocalizedText(opt)}
                      {statusClass === 'correct' && <CheckCircle2 size={18} />}
                      {statusClass === 'wrong' && <XCircle size={18} />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}


        {/* Confidence & Disclaimer */}
        <section className="disclaimer text-sm text-muted">
          <div className="confidence-badge">
            {lang === 'en' ? 'AI Confidence' : 'AI सटीकता'}: {article.confidence && getLocalizedText(article.confidence)}
          </div>
          <p className="font-modern">{article.disclaimer ? getLocalizedText(article.disclaimer) : (lang === 'en' ? 'Disclaimer: Content generated by AI.' : 'अस्वीकरण: AI द्वारा जनरेट की गई सामग्री।')}</p>
        </section>
      </div>
  );
}