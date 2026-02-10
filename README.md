# Bajaj Qualifier API

REST API for the Bajaj exam using Node.js.

## Setup

```bash
npm install
```

Create `.env`:
```env
PORT=8080
OFFICIAL_EMAIL=your.email@chitkara.edu.in
GEMINI_API_KEY=your_key
```

Get API key from https://aistudio.google.com

## Run

```bash
npm start
```

## Endpoints

### POST /bfhl

One operation per request:

- `{"fibonacci": 7}` → `[0,1,1,2,3,5,8]`
- `{"prime": [2,4,7,9,11]}` → `[2,7,11]`
- `{"lcm": [12,18,24]}` → `72`
- `{"hcf": [24,36,60]}` → `12`
- `{"AI": "question"}` → one word answer

### GET /health

```json
{"is_success": true, "official_email": "..."}
```

## Deploy

**Railway:**
- Push to GitHub
- Connect repo on railway.app
- Add env vars
- Deploy

**Render:**
- Push to GitHub  
- New web service
- Build: `npm install`, Start: `npm start`
- Add env vars

**Vercel:**
```bash
vercel --prod
```

## Testing

```bash
curl http://localhost:8080/health

curl -X POST http://localhost:8080/bfhl -H "Content-Type: application/json" -d '{"fibonacci": 7}'
```
