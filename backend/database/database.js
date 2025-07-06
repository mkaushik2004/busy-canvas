const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.dirname(process.env.DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initTables();
    }
});

// Initialize database tables
function initTables() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'user',
        profileImage TEXT,
        isEmailVerified INTEGER DEFAULT 0,
        emailVerificationToken TEXT,
        emailVerificationExpire TEXT,
        resetPasswordToken TEXT,
        resetPasswordExpire TEXT,
        newsletterSubscription INTEGER DEFAULT 0,
        preferences TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        orderNumber TEXT UNIQUE NOT NULL,
        customerName TEXT NOT NULL,
        customerEmail TEXT NOT NULL,
        customerPhone TEXT NOT NULL,
        artworkType TEXT NOT NULL,
        artworkStyle TEXT NOT NULL,
        canvasSize TEXT NOT NULL,
        colorScheme TEXT,
        urgency TEXT NOT NULL,
        budget TEXT NOT NULL,
        specialInstructions TEXT,
        referenceImages TEXT,
        status TEXT DEFAULT 'pending',
        progress TEXT,
        pricing TEXT,
        timeline TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
    )`);

    // Classes table
    db.run(`CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        bookingNumber TEXT UNIQUE NOT NULL,
        studentName TEXT NOT NULL,
        studentEmail TEXT NOT NULL,
        studentPhone TEXT NOT NULL,
        studentAge INTEGER NOT NULL,
        classType TEXT NOT NULL,
        artMedium TEXT NOT NULL,
        classDuration TEXT NOT NULL,
        classSize TEXT NOT NULL,
        preferredDate TEXT NOT NULL,
        preferredTime TEXT NOT NULL,
        confirmedDate TEXT,
        confirmedTime TEXT,
        experienceLevel TEXT NOT NULL,
        learningGoals TEXT,
        budget TEXT NOT NULL,
        specialRequests TEXT,
        status TEXT DEFAULT 'pending',
        instructorNotes TEXT,
        studentNotes TEXT,
        pricing TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
    )`);

    // Gallery table
    db.run(`CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artistId INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        style TEXT NOT NULL,
        medium TEXT NOT NULL,
        dimensions TEXT NOT NULL,
        price REAL NOT NULL,
        images TEXT NOT NULL,
        tags TEXT,
        colors TEXT,
        techniques TEXT,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        status TEXT DEFAULT 'published',
        isForSale INTEGER DEFAULT 1,
        isSold INTEGER DEFAULT 0,
        isFeatured INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artistId) REFERENCES users (id)
    )`);

    // Comments table
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artworkId INTEGER,
        userId INTEGER,
        content TEXT NOT NULL,
        isApproved INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artworkId) REFERENCES gallery (id),
        FOREIGN KEY (userId) REFERENCES users (id)
    )`);

    // Likes table
    db.run(`CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artworkId INTEGER,
        userId INTEGER,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artworkId) REFERENCES gallery (id),
        FOREIGN KEY (userId) REFERENCES users (id),
        UNIQUE(artworkId, userId)
    )`);

    // Contact table
    db.run(`CREATE TABLE IF NOT EXISTS contact (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        status TEXT DEFAULT 'new',
        priority TEXT DEFAULT 'medium',
        assignedTo INTEGER,
        response TEXT,
        respondedBy INTEGER,
        respondedAt TEXT,
        userAgent TEXT,
        ipAddress TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignedTo) REFERENCES users (id),
        FOREIGN KEY (respondedBy) REFERENCES users (id)
    )`);

    console.log('Database tables initialized');
}

// Helper functions for database operations
const dbHelper = {
    // Run a query with parameters
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    },

    // Get a single row
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    },

    // Get multiple rows
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },

    // Close database connection
    close: () => {
        return new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
};

module.exports = { db, dbHelper }; 