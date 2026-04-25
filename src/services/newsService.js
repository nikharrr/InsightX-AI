const API_BASE_URL = "http://localhost:8001";

export async function fetchNews(category = "All") {
  const res = await fetch(
    `${API_BASE_URL}/api/feed?category=${encodeURIComponent(category)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch news");
  }

  const data = await res.json();

  if (data.status !== "success") {
    throw new Error("News API returned error");
  }

  return data.articles || [];
}

export function mapNewsArticles(articles) {
  return articles.map((a, idx) => ({
    id: a.id,
    category: a.category || "Global Trends",
    title: a.title,
    hindiTitle: a.title,
    marathiTitle: a.title,
    summary: a.source || "",
    hindiSummary: a.source || "",
    marathiSummary: a.source || "",
    image: a.image_url || a.img_url || a.thumbnail || "",
    url: a.url,
    content: a.content || "",
    isImportant: idx < 2,
  }));
}