# ScoreKeep

A modern board game score tracking application built with Next.js, React, and TypeScript.

## Features

- **Session Management**: Create and track board game sessions
- **Player Statistics**: View win rates and game counts for each player
- **Game Library**: Add and manage your board game collection
- **Score Tracking**: Record scores with flexible scoring systems
- **Recent Activity**: Quick access to your latest game sessions
- **Popular Games**: See your most played games
- **Dark/Light Theme**: Toggle between themes for comfortable viewing

## Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest with React Testing Library
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scorekeep
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── games/             # Game management pages
│   ├── new-session/       # New session creation
│   ├── players/           # Player management
│   └── sessions/          # Session history
├── components/            # Reusable React components
│   ├── ui/               # Base UI components
│   └── score-templates/  # Game-specific scoring
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── __tests__/           # Test files
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

Run the test suite:

```bash
npm test
```

For coverage report:

```bash
npm run test:coverage
```

## Deployment

### Netlify Deployment

This project is optimized for Netlify deployment with the following configuration:

**Automatic Deployment:**
1. Connect your GitHub repository to Netlify
2. Netlify will automatically detect the Next.js project
3. Build settings are configured in `netlify.toml`
4. Deploy automatically on every push to main branch

**Manual Deployment:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod
```

**Build Configuration:**
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 18
- Uses `@netlify/plugin-nextjs` for optimal Next.js support

**Features:**
- ✅ Automatic deployments from GitHub
- ✅ Security headers configured
- ✅ Caching optimization for static assets
- ✅ Next.js dynamic routes support
- ✅ Client-side routing handled

### Environment Variables

If you need environment variables for production:
1. Add them in Netlify dashboard under Site settings > Environment variables
2. Prefix client-side variables with `NEXT_PUBLIC_`

## License

This project is private and not licensed for public use.