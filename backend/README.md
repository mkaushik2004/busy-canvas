# Busy Canvas Backend API

A comprehensive backend API for Busy Canvas Art Studio built with Node.js, Express, and SQLite.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Order Management**: Complete order lifecycle from creation to completion
- **Class Booking System**: Art class registration and management
- **Gallery Management**: Artwork showcase with likes and comments
- **Contact Form Handling**: Automated email notifications and responses
- **File Upload**: Local file storage for images
- **Email Integration**: Automated email sending for notifications
- **Security**: Rate limiting, input validation, and security headers
- **Internal Database**: SQLite database for data persistence

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Email**: Nodemailer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd busy-canvas/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp config.env.example config.env
   ```
   
   Update `config.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_PATH=./database/busy_canvas.db
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=uploads/
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Initialize Database**
   ```bash
   npm run init-db
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Database Schema

The application uses SQLite with the following main tables:

### Users Table
- User registration and authentication
- Profile management
- Email verification
- Password reset functionality

### Orders Table
- Artwork order management
- Progress tracking
- Pricing calculations
- Status updates

### Classes Table
- Art class bookings
- Student information
- Class scheduling
- Instructor assignments

### Gallery Table
- Artwork showcase
- Categories and styles
- Pricing information
- View and like tracking

### Contact Table
- Contact form submissions
- Response management
- Priority and status tracking

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /logout` - User logout
- `GET /me` - Get current user
- `PUT /updatedetails` - Update user details
- `PUT /updatepassword` - Update password
- `POST /forgotpassword` - Forgot password
- `PUT /resetpassword/:token` - Reset password
- `GET /verify-email/:token` - Verify email
- `POST /resend-verification` - Resend verification email

### Users (`/api/users`)
- `GET /` - Get all users (Admin)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user (Admin)
- `DELETE /:id` - Delete user (Admin)
- `PUT /:id/role` - Update user role (Admin)
- `GET /stats/overview` - User statistics (Admin)

### Orders (`/api/orders`)
- `GET /` - Get user orders
- `GET /:id` - Get specific order
- `POST /` - Create new order
- `PUT /:id` - Update order
- `DELETE /:id` - Delete order
- `PUT /:id/status` - Update order status
- `PUT /:id/progress` - Update order progress
- `POST /:id/notes` - Add order note
- `GET /stats/overview` - Order statistics

### Classes (`/api/classes`)
- `GET /` - Get user class bookings
- `GET /:id` - Get specific class booking
- `POST /` - Book new class
- `PUT /:id` - Update class booking
- `DELETE /:id` - Cancel class booking
- `PUT /:id/confirm` - Confirm class booking
- `POST /:id/notes` - Add class note
- `GET /stats/overview` - Class statistics

### Gallery (`/api/gallery`)
- `GET /` - Get all artworks
- `GET /:id` - Get specific artwork
- `POST /` - Add new artwork
- `PUT /:id` - Update artwork
- `DELETE /:id` - Delete artwork
- `POST /:id/like` - Like artwork
- `DELETE /:id/like` - Unlike artwork
- `POST /:id/comments` - Add comment
- `GET /:id/comments` - Get artwork comments
- `PUT /:id/feature` - Feature artwork (Admin)

### Contact (`/api/contact`)
- `POST /` - Submit contact form
- `GET /` - Get all contacts (Admin)
- `GET /:id` - Get specific contact (Admin)
- `PUT /:id/status` - Update contact status (Admin)
- `POST /:id/respond` - Respond to contact (Admin)
- `DELETE /:id` - Delete contact (Admin)
- `GET /stats` - Contact statistics (Admin)

## File Upload

The application supports file uploads for:
- Profile images
- Artwork images
- Reference images
- Gallery images

Files are stored locally in the `uploads/` directory with organized subdirectories.

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Express-validator for request validation
- **Security Headers**: Helmet for security headers
- **CORS**: Configurable cross-origin resource sharing
- **File Upload Security**: File type and size validation

## Email Integration

The application sends automated emails for:
- Email verification
- Password reset
- Contact form notifications
- Order updates
- Class confirmations

Configure your email settings in `config.env` to enable email functionality.

## Error Handling

Comprehensive error handling with:
- Custom error classes
- Centralized error middleware
- Detailed error responses
- Logging for debugging

## Development

### Running in Development Mode
```bash
npm run dev
```

### Database Management
```bash
# Initialize database tables
npm run init-db

# Database file location
./database/busy_canvas.db
```

### File Structure
```
backend/
├── controllers/     # Route controllers
├── database/        # Database setup and helpers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── uploads/         # File uploads
├── utils/           # Utility functions
├── config.env       # Environment variables
├── package.json     # Dependencies
├── server.js        # Express app setup
└── start.js         # Server startup
```

## Production Deployment

1. **Set environment variables**
   ```env
   NODE_ENV=production
   JWT_SECRET=your_secure_jwt_secret
   ```

2. **Install production dependencies**
   ```bash
   npm install --production
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## API Response Format

All API responses follow a consistent format:

```json
{
  "status": "success|error",
  "message": "Response message",
  "data": {
    // Response data
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team. 