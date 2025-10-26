# Partnership Ledger - Next.js

A modern Next.js application for tracking financial transactions between partners with precise timestamp tracking.

## Features

- ✅ React-based UI with TypeScript
- ✅ Server-side API routes
- ✅ Precise timestamp tracking
- ✅ Real-time data updates
- ✅ Responsive design
- ✅ Type safety

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3000

## Vercel Deployment

### Quick Deploy

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

### GitHub Integration

1. Push to GitHub
2. Connect to Vercel
3. Automatic deployment

## API Endpoints

- `GET /api/data` - Get all data
- `POST /api/data` - Save all data
- `POST /api/transaction` - Add transaction
- `PUT /api/transaction/[id]` - Update transaction
- `DELETE /api/transaction/[id]` - Delete transaction

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: CSS Modules
- **Backend**: Next.js API Routes
- **Database**: JSON file
- **Deployment**: Vercel
