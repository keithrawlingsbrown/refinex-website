# RefineX Website

Modern, dark-mode website for RefineX - the spot instance arbitrage signals API.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Code Highlighting**: react-syntax-highlighter
- **Database**: SQLite (better-sqlite3)
- **Icons**: Lucide React

## Project Structure

```
refinex-website/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   └── enterprise/       # Enterprise lead capture
│   ├── docs/                 # Documentation pages
│   ├── api-reference/        # API reference
│   ├── specs/                # Technical specifications
│   ├── pricing/              # Pricing page
│   ├── enterprise/           # Enterprise page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                   # UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── MetricCard.tsx
│   │   ├── SignalBadge.tsx
│   │   ├── Logo.tsx
│   │   └── GridBackground.tsx
│   ├── layout/               # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── sections/             # Page sections
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── QuickstartSection.tsx
│   │   └── LiveMetricsSection.tsx
│   └── forms/                # Form components
│       └── EnterpriseForm.tsx
├── lib/                      # Utilities
│   ├── db.ts                 # SQLite database
│   └── utils.ts              # Helper functions
├── data/                     # Database files (auto-created)
│   └── refinex.db
├── public/                   # Static assets
│   └── og-image.png
└── tailwind.config.ts        # Tailwind configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS)
- npm or yarn or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd refinex-website
```

2. Install dependencies:
```bash
npm install
```

3. Create data directory for SQLite:
```bash
mkdir -p data
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

### Adding New Pages

1. Create a new directory in `app/` with a `page.tsx` file
2. Add metadata export for SEO
3. Add navigation link in `components/layout/Header.tsx`

### Customizing Colors

Edit `tailwind.config.ts` to customize the RefineX brand colors:

```typescript
colors: {
  refinex: {
    navy: '#001036',
    cyan: '#4FE8FF',
    blue: '#1B5BDB',
    // ...
  }
}
```

## Database

The website uses SQLite for storing:
- Enterprise leads
- Waitlist signups
- Support escalations

Database is automatically initialized on first run. No migrations needed.

### Viewing Data

To view database contents:

```bash
sqlite3 data/refinex.db
sqlite> SELECT * FROM enterprise_leads;
```

## API Routes

### POST /api/enterprise

Saves enterprise lead to database.

**Request Body:**
```json
{
  "companyName": "Acme Inc",
  "role": "Engineering Manager",
  "email": "user@acme.com",
  "cloudProviders": "aws_gcp",
  "monthlySpend": "50k-250k",
  "message": "Looking to optimize costs..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead submitted successfully"
}
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Deploy

### Docker

```bash
docker build -t refinex-website .
docker run -p 3000:3000 -v $(pwd)/data:/app/data refinex-website
```

### Environment Variables

No environment variables required for basic deployment. All configuration is in code.

## Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: ~300KB gzipped
- **First Contentful Paint**: <1s
- **Time to Interactive**: <2s

## SEO

- Server-side rendering for all pages
- OpenGraph and Twitter card metadata
- Sitemap auto-generated
- Robots.txt configured

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

Proprietary - RefineX

## Support

For issues or questions:
- Email: support@refinex.io
- GitHub Issues: [repository-url]/issues
