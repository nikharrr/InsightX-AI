import asyncio
import os
from dotenv import load_dotenv

load_dotenv()
from pipeline.ingestor import NewsIngestor

async def main():
    print("Running Ingestion specifically targeting new GNews records...")
    ingestor = NewsIngestor()
    
    # Let's specifically look for some new AI/Tech news!
    result = await ingestor.run_query_ingestion("AI technology general")
    print(result.model_dump())

if __name__ == "__main__":
    asyncio.run(main())
