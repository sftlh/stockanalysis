# Stock Analysis Pro 📈

A comprehensive Next.js application for professional stock analysis and portfolio management, featuring advanced analytics, sector comparisons, and intelligent filtering.

## ✨ Features

### 🔐 User Authentication
- Secure signup/login with email verification
- Password reset functionality
- JWT-based authentication
- Protected routes and user sessions

### 📊 Dashboard Analytics
- **Real-time Metrics**: Total stocks, portfolio value, average EPS, high ROE emitters
- **Interactive Charts**:
  - PER vs Emiten (Bar chart with issuer performance)
  - Sector Distribution (Pie chart)
  - ROE vs PBV Analysis (Dual-axis bar chart)
  - Debt-to-Equity Ratio Trends (Line chart with multiple issuers)
- **Smart Filtering**: Advanced filters by issuer, sector, year, quarter, and financial metrics
- **Pagination**: Efficient browsing through large datasets (10 items per page)

### 🏢 Sector Comparison
- Compare stocks across different sectors
- Sector-wise statistics (average PER, ROE, NPL, market cap)
- **Intelligent Highlighting**: Automatic green highlighting for "good stocks" based on valuation metrics
- Detailed financial metrics for each stock

### 📈 Stock Data Management
- Add comprehensive stock data (financial metrics, sector, quarter/year)
- Unique constraints prevent duplicate entries
- Real-time data validation and error handling
- Support for large numerical values (BigInt for outstanding shares)

### 🎨 User Experience
- Modern, responsive design with TailwindCSS
- Dark/light theme elements
- Loading animations and skeleton states
- Mobile-friendly interface
- Intuitive navigation and user feedback

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS, Recharts
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL-ready
- **Authentication**: JWT, bcryptjs, nodemailer
- **Charts**: Recharts library for data visualization
- **Email**: SMTP integration for notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stock-analysis-pro.git
   cd stock-analysis-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # JWT Secret (change this in production)
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

   # Email Configuration (use Ethereal for testing: https://ethereal.email/)
   EMAIL_SERVER_HOST="smtp.ethereal.email"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="your-ethereal-user"
   EMAIL_SERVER_PASSWORD="your-ethereal-password"
   EMAIL_FROM="noreply@stockanalysis.com"
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Usage

### Adding Stock Data
1. Navigate to the "Add Stock Data" page
2. Fill in comprehensive financial information
3. Select appropriate sector and time period
4. Submit to add to your portfolio

### Analyzing Data
- **Dashboard**: View key metrics and trends at a glance
- **Charts**: Interactive visualizations for deep analysis
- **Filters**: Narrow down data by multiple criteria
- **Sector Comparison**: Compare performance across industries

### Managing Portfolio
- View all stocks with pagination
- Filter by issuer name (type-ahead search)
- Sort and analyze by various financial ratios
- Identify undervalued opportunities

## 🗄 Database Schema

### User Model
```prisma
model User {
  id                Int      @id @default(autoincrement())
  email             String   @unique
  password          String
  name              String?
  verified          Boolean  @default(false)
  verificationToken String?  @unique
  resetToken        String?  @unique
  resetTokenExpiry  DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### StockData Model
```prisma
model StockData {
  id                 Int     @id @default(autoincrement())
  issuerName         String
  sector             String?
  netProfit          Float
  eps                Float
  outstandingShares  BigInt  // Supports large share counts
  currentPrice       Float
  totalEquity        Float
  totalDebt          Float
  dividends          Float
  quarter            Int
  year               Int

  @@unique([issuerName, quarter, year])
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Stock Data
- `GET /api/stockdata` - Retrieve all stock entries
- `POST /api/stockdata` - Create new stock entry

## 📧 Email Configuration

### Development (Ethereal)
Use Ethereal for testing email functionality:
1. Visit [ethereal.email](https://ethereal.email)
2. Create account and get SMTP credentials
3. Update `.env` with the provided details

### Production
Configure with a production SMTP service:
- **SendGrid**: Reliable email delivery
- **Gmail**: For personal use
- **AWS SES**: Scalable solution

## 🚀 Deployment

### Environment Setup
1. **Database**: Migrate from SQLite to PostgreSQL for production
2. **Environment Variables**: Set strong secrets and production URLs
3. **Email Service**: Configure production SMTP

### Deployment Platforms
- **Vercel**: Recommended for Next.js apps
- **Netlify**: Alternative option
- **Railway/DigitalOcean**: For full-stack deployment

### Production Checklist
- [ ] Update `DATABASE_URL` to production database
- [ ] Set strong `JWT_SECRET`
- [ ] Configure production email service
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Test new features thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://prisma.io/) - Database toolkit
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [Recharts](https://recharts.org/) - Chart library
- [NextAuth.js](https://next-auth.js.org/) - Authentication inspiration

---

**Built with ❤️ for investors who demand professional-grade analysis tools**
