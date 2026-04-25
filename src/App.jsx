import React, { useEffect, useState } from "react";

import Home from "./pages/Home";
import ArticlePage from "./pages/ArticlePage";
import LandingScreen from "./pages/LandingScreen";
import OnboardingScreen from "./pages/OnboardingScreen";

import { fetchNews, mapNewsArticles } from "./services/newsService";

import "./App.css";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("landing");
  const [profile, setProfile] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [lang, setLang] = useState("en");
  const [articles, setArticles] = useState([]);

  const fetchFeed = async (cat) => {
    try {
      const rawArticles = await fetchNews(cat);
      const mappedArticles = mapNewsArticles(rawArticles);

      if (cat === "All") {
        setArticles(mappedArticles);
      } else {
        setArticles((prev) => {
          const others = prev.filter(
            (p) =>
              p.category !== cat &&
              !p.id?.toString().startsWith("gnews_")
          );

          return [...mappedArticles, ...others];
        });
      }
    } catch (err) {
      console.error("Error fetching feed:", err);
    }
  };

  useEffect(() => {
    fetchFeed("All");

    const savedUser = localStorage.getItem("insightx_user");

    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setProfile(userData.role);
    }

    const handleHash = () => {
      const hash = window.location.hash.slice(1);

      if (["landing", "profile", "feed", "insight"].includes(hash)) {
        setCurrentScreen(hash);
      } else {
        const initialScreen = savedUser ? "feed" : "landing";
        window.location.hash = initialScreen;
        setCurrentScreen(initialScreen);
      }
    };

    if (!window.location.hash) {
      window.location.hash = savedUser ? "feed" : "landing";
    } else {
      handleHash();
    }

    window.addEventListener("hashchange", handleHash);

    return () => {
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  const navigate = (screen) => {
    window.location.hash = screen;
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const handleOnboardingComplete = (userData) => {
    setProfile(userData.role);
    localStorage.setItem("insightx_user", JSON.stringify(userData));
    navigate("feed");
  };

  const handleProfileSelect = (selectedProfile) => {
    setProfile(selectedProfile);

    const savedUser = JSON.parse(
      localStorage.getItem("insightx_user") || "{}"
    );

    savedUser.role = selectedProfile;
    localStorage.setItem("insightx_user", JSON.stringify(savedUser));

    navigate("feed");
  };

  const handleArticleSelect = (articleId) => {
    setSelectedArticleId(articleId);
    navigate("insight");
  };

  return (
    <div className="app-container">
      {currentScreen === "landing" && (
        <LandingScreen onEnter={() => navigate("profile")} lang={lang} />
      )}

      {currentScreen === "profile" && (
        <OnboardingScreen
          onComplete={handleOnboardingComplete}
          onProfileSelect={handleProfileSelect}
          lang={lang}
        />
      )}

      {currentScreen === "feed" && (
        <Home
          articles={articles}
          profile={profile}
          lang={lang}
          onProfileClick={() => navigate("profile")}
          onArticleClick={handleArticleSelect}
          fetchFeed={fetchFeed}
        />
      )}

      {currentScreen === "insight" && (
        <ArticlePage
          articleId={selectedArticleId}
          articles={articles}
          profile={profile}
          lang={lang}
          setLang={setLang}
          onBack={() => navigate("feed")}
        />
      )}
    </div>
  );
}