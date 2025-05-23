# Care Transit Portal

A modern web application for managing student transportation and employee resources.

## Features

- District Portal: Manage student transportation information
- Employee Portal: Access employee resources and time management tools
- Admin Portal: User management and system settings

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Prisma (PostgreSQL)
- NextAuth.js
- Samsara API Integration

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/caretransitportal.git
cd caretransitportal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/caretransitportal?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
SAMSARA_API_TOKEN="your-samsara-api-token"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and shared code
- `/prisma` - Database schema and migrations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
