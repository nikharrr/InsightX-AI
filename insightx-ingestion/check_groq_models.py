import os
import httpx
from dotenv import load_dotenv

load_dotenv()
key = os.getenv('GROQ_API_KEY')
print('GROQ_KEY_SET', bool(key))
if not key:
    raise SystemExit('GROQ_API_KEY not found')
for endpoint in ['https://api.groq.com/openai/v1/models', 'https://api.groq.com/v1/models']:
    print('---', endpoint)
    try:
        resp = httpx.get(endpoint, headers={'Authorization': f'Bearer {key}'}, timeout=20.0)
        print('status', resp.status_code)
        print(resp.text[:2000])
    except Exception as exc:
        print('error', exc)
