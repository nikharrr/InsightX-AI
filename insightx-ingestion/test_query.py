import asyncio
from dotenv import load_dotenv
load_dotenv()
from db.supabase_client import get_recent_articles

async def test():
    try:
        articles = await get_recent_articles(limit=2)
        print("SUCCESS:", articles)
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    asyncio.run(test())
