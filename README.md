# Tuitionstime Platform

## Overview

Tuitionstime is a comprehensive tutoring marketplace platform that connects students with qualified tutors. The platform features role-based access for students, tutors, and administrators, with specialized dashboards and functionality for each user type.

## Features

### User Authentication
- Mobile OTP-based authentication (India-friendly)
- Role selection during signup (Student, Tutor, Admin)
- Secure JWT-based session management

### Profile Management
- **Student Profiles**: Basic info, preferred subjects, class level, educational goals
- **Tutor Profiles**: Qualifications, experience, subjects, rates, bio, and verification documents
- Profile photo upload and management

### Role-Based Dashboards
- **Student Dashboard**: Find tutors, manage sessions, track progress
- **Tutor Dashboard**: Manage classes, track earnings, update availability
- **Admin Dashboard**: User management, tutor verification, category management

### Additional Features
- Wallet system for payments and earnings
- Session booking and management
- Assignment tracking
- Rating and review system

## Tech Stack

### Frontend
- Next.js (React framework)
- Redux for state management
- Tailwind CSS with shadcn/ui components
- TypeScript for type safety

### Backend (Planned)
- Node.js with Express
- MongoDB/MySQL database
- JWT authentication
- Twilio/Firebase for OTP delivery

### Deployment
- Vercel for frontend hosting
- MongoDB Atlas/AWS RDS for database
- AWS S3 for file storage

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── assignments/          # Assignment pages
│   ├── dashboard/            # Dashboard pages by role
│   │   ├── admin/            # Admin dashboard pages
│   │   ├── student/          # Student dashboard pages
│   │   └── tutor/            # Tutor dashboard pages
│   ├── login/                # Authentication pages
│   ├── signup/               # User registration pages
│   └── wallet/               # Wallet management pages
├── components/               # Reusable React components
│   ├── auth/                 # Authentication components
│   ├── layout/               # Layout components (Navbar, Sidebar)
│   └── ui/                   # UI components (shadcn/ui)
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions and mock data
├── providers/                # Context providers
├── store/                    # Redux store configuration
│   └── slices/               # Redux slices for state management
├── api-documentation.md      # API documentation
├── database-schema.md        # Database schema documentation
├── implementation-plan.md    # Implementation roadmap
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/tuitionstime.git
   cd tuitionstime
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Roadmap

Refer to the `implementation-plan.md` file for a detailed development roadmap.

## API Documentation

Refer to the `api-documentation.md` file for comprehensive API documentation.

## Database Schema

Refer to the `database-schema.md` file for the database schema design.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.