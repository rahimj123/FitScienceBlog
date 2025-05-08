# FitScience Daily

A healthcare-focused blog platform showcasing challenges and technological solutions in the healthcare industry with monetization through ads and affiliate links.

## Features

- Responsive, modern UI built with React and Tailwind CSS
- Article catalog with categories and search functionality
- Featured articles section for highlighted content
- Newsletter subscription for user engagement
- Contact form for inquiries
- Integration with advertising platforms (Google Ads, Amazon Affiliate)
- SEO-friendly article URLs and metadata
- Social media sharing functionality
- PostgreSQL database for content management

## Tech Stack

- **Frontend**: React, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tools**: Vite, TypeScript
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use the provided development database)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/fitscience-daily.git
cd fitscience-daily
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Copy the `.env.example` file to `.env` and fill in your database credentials and any API keys.

4. Initialize the database
```bash
npm run db:push
npm run db:seed
```

5. Start the development server
```bash
npm run dev
```

6. Open your browser at `http://localhost:5000`

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set the required environment variables in Vercel
4. Deploy!

## License

[MIT](LICENSE)