# Stock Analysis App

A Next.js application for analyzing stock data using TypeScript, Prisma, and TailwindCSS with a local SQLite database and user authentication.

## Features

- User authentication with signup, login, email verification, and password reset
- Add stock data with issuer name, financial metrics, and quarter/year information
- View a list of all entered stock data
- Unique constraint on issuer name per quarter and year

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Prisma with SQLite
- **Authentication**: JWT, bcryptjs, nodemailer
- **Styling**: TailwindCSS

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up the database:

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

3. Configure environment variables in `.env`:

   - `DATABASE_URL="file:./dev.db"`
   - `JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"`
   - Email settings (for local testing, use Ethereal: https://ethereal.email/):
     - `EMAIL_SERVER_HOST="smtp.ethereal.email"`
     - `EMAIL_SERVER_PORT="587"`
     - `EMAIL_SERVER_USER="your-ethereal-user"`
     - `EMAIL_SERVER_PASSWORD="your-ethereal-password"`
     - `EMAIL_FROM="noreply@stockanalysis.com"`

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The app stores user and stock data:

- **User**: id, email, password (hashed), name, verified, verificationToken, resetToken, etc.
- **StockData**: issuerName, netProfit, eps, outstandingShares, currentPrice, totalEquity, totalDebt, dividends, quarter, year

Each issuer's data is unique per quarter and year.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/verify` - Verify email with token
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password with token

### Stock Data
- `GET /api/stockdata` - Retrieve all stock data
- `POST /api/stockdata` - Add new stock data

## Email Setup

For production, configure a real SMTP server (e.g., Gmail, SendGrid). For development, use Ethereal for testing emails.

## Deployment

This app uses a local SQLite database, so it's suitable for development and single-user scenarios. For production, consider migrating to a cloud database like PostgreSQL and a proper email service.
