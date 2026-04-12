import asyncio
from dotenv import load_dotenv

load_dotenv()
from db.supabase_client import supabase

async def delete_broken_articles():
    print("Finding articles without an img_url...")
    res = supabase.table("articles_raw").select("id").is_("img_url", "null").execute()
    articles = res.data or []
    
    if not articles:
        print("No articles found with missing img_url.")
        return
        
    ids = [a["id"] for a in articles]
    print(f"Found {len(ids)} articles to delete.")
    
    tables_to_clean = [
        "insights",
        "user_reading_history",
        "user_article_interactions",
        "articles_enriched",
        "article_pipeline_states",
        "article_embeddings"
    ]
    
    for tbl in tables_to_clean:
        try:
            print(f"Cleaning child table: {tbl}")
            supabase.table(tbl).delete().in_("article_id", ids).execute()
        except Exception as e:
            if "Could not find" in str(e):
                print(f"Table {tbl} doesn't exist, skipping...")
            else:
                print(f"Failed cleaning {tbl}: {e}")
                
    print("Deleting from articles_raw...")
    try:
        del_res = supabase.table("articles_raw").delete().in_("id", ids).execute()
        print(f"Successfully deleted {len(del_res.data or [])} articles from raw!")
    except Exception as e:
        print(f"Failed deleting raw: {e}")

if __name__ == "__main__":
    asyncio.run(delete_broken_articles())
