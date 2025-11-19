# <img src="./Client/CatchupLogo.png" alt="CatchUp Banner" width="27" /> CatchUp - College Notes Sharing Platform

## Project Overview

CatchUp is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed to facilitate the sharing and management of college notes across different semesters and departments. The platform implements role-based access control, cloud storage integration via Cloudinary, and is fully containerized using Docker for seamless deployment.

##  Team Information

- **Team Member 1:** Toshit Jain - B24CS048
- **Team Member 2:** Y Bhavadish - B24CS052
- **Team Member 3:** Waveson Harit - B24CS051

## Problem Statement

Students often struggle to find quality notes for their courses across different semesters and departments. CatchUp solves this problem by providing:

- Centralized platform for note sharing
- Organized by semester, department, and year
- Quality control through ratings and reviews
- Admin moderation and verification system
- Cloud-based storage for reliability

## Key Features

### For Students
- Browse notes by Semester (1-8), Department (CSE, ECE, EEE, etc.), and Year
- Search and filter notes
- View PDFs in browser or download
- Rate and review PDFs (1-5 stars with written reviews)
- Personal profile with activity tracking
- Dark/Light theme toggle

### For Admins
- Upload PDFs to Cloudinary (up to 10MB)
- Edit/Delete any PDF
- Mark PDFs as "Featured" 
- Verify quality content 
- View analytics dashboard
- Bulk operations (delete/update multiple PDFs)
- Advanced filtering and search

### For Super Admins 
- All admin features
- User management (view all users)
- Role assignment (promote/demote users)
- Delete users
- System-wide analytics

## Tech Stack

### Frontend
- **React 19** - Modern UI library
- **React Router DOM** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database (Atlas Cloud)
- **Mongoose** - MongoDB object modeling
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload middleware
- **Cloudinary** - Cloud storage for PDFs

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Git & GitHub** - Version control
- **VS Code** - Development environment

## Docker Implementation

This project uses Docker for easy deployment and consistent environments across different systems.

## Installation & Setup

### Prerequisites
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- Git (for cloning repository)

### Quick Start with Docker (Recommended)

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/catchup.git
cd catchup
```

2. **Configure Environment Variables**

The `.env` file must be configured and updated:
- Cloudinary credentials
- JWT secret
- MongoDB URI

3. **Start with Docker Compose**
```bash
docker compose up --build
```

**That's it!** Wait 1-2 minutes for containers to build and start.

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Manual Setup (Without Docker)

If you prefer to run without Docker:

**Backend Setup:**
```bash
cd server
npm install
npm run dev
```

**Frontend Setup (new terminal):**
```bash
cd client
npm install
npm run dev
```

## Default Credentials

For testing purposes:

**Super Admin:**
```
Email: superadmin@catchup.com
Password: superadmin123
```

**Student:**
```
Email: student@catchup.com
Password: student123
```

Or register a new account from the Sign Up page.

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['student', 'admin', 'superadmin'],
  profileImage: String,
  cloudinaryImageId: String,
  createdAt: Date
}
```

### PDF Model
```javascript
{
  title: String,
  description: String,
  semester: Enum ['1'-'8'],
  branch: Enum ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'LIBERAL_ARTS'],
  year: Enum ['1'-'4'],
  fileUrl: String,
  cloudinaryId: String,
  fileName: String,
  fileSize: Number,
  uploadedBy: ObjectId (User),
  downloads: Number,
  views: Number,
  averageRating: Number,
  totalRatings: Number,
  isFeatured: Boolean,
  isVerified: Boolean,
  verifiedBy: ObjectId (User),
  verifiedAt: Date,
  createdAt: Date
}
```

### Rating Model
```javascript
{
  pdf: ObjectId (PDF),
  user: ObjectId (User),
  rating: Number (1-5),
  review: String (max 500 chars),
  createdAt: Date
}
```

## Docker Commands Reference
```bash
# Start all services
docker compose up

# Start in background (detached mode)
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild containers
docker compose build

# Remove all data and restart fresh
docker compose down -v
docker compose up --build

# Check running containers
docker ps

# Stop specific service
docker compose stop backend
```

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Cannot Connect to Docker
- Ensure Docker Desktop is running
- Check system tray for Docker whale icon

### Frontend Can't Connect to Backend
- Verify both containers are running: `docker ps`
- Check backend logs: `docker compose logs backend`
- Ensure VITE_API_URL is set correctly in client/.env

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs with salt rounds
- **Role-Based Access Control** - Three-tier permission system
- **Protected Routes** - Frontend and backend route protection
- **Input Validation** - Server-side validation for all inputs
- **Environment Variables** - Sensitive data stored securely

## Extra Features Implemented

1. **Docker Integration**
   - Complete containerization
   - One-command deployment
   - Production-ready setup

2. **Featured & Verified System**
   - Admins can mark quality content
   - Verification tracking with timestamp
   - Visual badges for users

3. **Advanced Admin Dashboard**
   - Real-time statistics
   - Top performers tracking
   - Distribution analytics
   - Bulk operations

4. **Profile Management**
   - Image upload to Cloudinary
   - Activity tracking
   - Personal statistics

5. **Dark/Light Theme**
   - Persistent theme preference
   - Smooth transitions
   - Eye-friendly design

6. **Rating System**
   - 5-star rating
   - Written reviews
   - Update/delete own reviews
   - Average calculation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### PDFs
- `GET /api/pdfs` - Get all PDFs (with filters)
- `GET /api/pdfs/:id` - Get single PDF
- `POST /api/pdfs/upload` - Upload PDF (Admin)
- `PUT /api/pdfs/:id` - Update PDF
- `DELETE /api/pdfs/:id` - Delete PDF
- `GET /api/pdfs/download/:id` - Download PDF

### Admin
- `GET /api/admin/pdfs` - Get all PDFs with advanced filters
- `PUT /api/admin/pdfs/:id/toggle-featured` - Toggle featured
- `PUT /api/admin/pdfs/:id/toggle-verified` - Toggle verified
- `POST /api/admin/pdfs/bulk-delete` - Delete multiple PDFs
- `POST /api/admin/pdfs/bulk-update` - Update multiple PDFs
- `GET /api/admin/pdfs/analytics` - Get analytics data

### Ratings
- `POST /api/ratings/:pdfId` - Add/update rating
- `GET /api/ratings/:pdfId` - Get all ratings
- `GET /api/ratings/user/:pdfId` - Get user's rating
- `DELETE /api/ratings/:pdfId` - Delete rating

### Users (Super Admin)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/profile/stats` - Get profile statistics

## Future Enhancements

- [ ] Real-time notifications using Socket.io
- [ ] Email service integration (SendGrid)
- [ ] PDF preview without download
- [ ] Discussion forums per PDF
- [ ] Bookmark/favorite system
- [ ] Download history tracking

## Learning Outcomes

Through this project, we learned:

1. **Full-Stack Development** - Building complete MERN applications
2. **Docker & Containerization** - Modern deployment practices
3. **Authentication & Authorization** - Secure user management
4. **Cloud Services** - Cloudinary integration
5. **Database Design** - MongoDB schema design
6. **RESTful APIs** - Backend architecture
7. **State Management** - React hooks and context
8. **Git Workflow** - Version control and collaboration

## Contributing

This is an academic project submitted for evaluation. 

## License

Educational Project - Indian Institute of Technology, Bhilai

---
