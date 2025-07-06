const { dbHelper } = require('./database/database');

// Sample data for testing
const sampleData = {
    users: [
        {
            fullName: 'Admin User',
            username: 'admin',
            email: 'admin@busycanvas.com',
            password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            phone: '+91 98765 43210',
            role: 'admin',
            isEmailVerified: 1,
            newsletterSubscription: 1
        },
        {
            fullName: 'John Artist',
            username: 'johnartist',
            email: 'john@busycanvas.com',
            password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            phone: '+91 98765 43211',
            role: 'artist',
            isEmailVerified: 1,
            newsletterSubscription: 1
        },
        {
            fullName: 'Jane Customer',
            username: 'janecustomer',
            email: 'jane@example.com',
            password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
            phone: '+91 98765 43212',
            role: 'user',
            isEmailVerified: 1,
            newsletterSubscription: 0
        }
    ],
    gallery: [
        {
            artistId: 2,
            title: 'Sunset Landscape',
            description: 'A beautiful sunset over mountains',
            category: 'landscape',
            style: 'realistic',
            medium: 'oil-painting',
            dimensions: '24" x 36"',
            price: 5000,
            images: JSON.stringify(['sunset-landscape-1.jpg']),
            tags: JSON.stringify(['landscape', 'sunset', 'mountains']),
            colors: JSON.stringify(['orange', 'red', 'blue']),
            techniques: JSON.stringify(['oil painting', 'layering']),
            isFeatured: 1
        },
        {
            artistId: 2,
            title: 'Portrait of a Woman',
            description: 'Elegant portrait in classical style',
            category: 'portrait',
            style: 'realistic',
            medium: 'acrylic',
            dimensions: '16" x 20"',
            price: 3000,
            images: JSON.stringify(['portrait-woman-1.jpg']),
            tags: JSON.stringify(['portrait', 'woman', 'classical']),
            colors: JSON.stringify(['brown', 'gold', 'cream']),
            techniques: JSON.stringify(['acrylic', 'portrait']),
            isFeatured: 1
        },
        {
            artistId: 2,
            title: 'Abstract Composition',
            description: 'Modern abstract art piece',
            category: 'abstract',
            style: 'abstract',
            medium: 'mixed-media',
            dimensions: '20" x 24"',
            price: 4000,
            images: JSON.stringify(['abstract-composition-1.jpg']),
            tags: JSON.stringify(['abstract', 'modern', 'composition']),
            colors: JSON.stringify(['blue', 'green', 'yellow']),
            techniques: JSON.stringify(['mixed media', 'collage']),
            isFeatured: 0
        }
    ],
    orders: [
        {
            userId: 3,
            orderNumber: 'BC20241201001',
            customerName: 'Jane Customer',
            customerEmail: 'jane@example.com',
            customerPhone: '+91 98765 43212',
            artworkType: 'portrait',
            artworkStyle: 'realistic',
            canvasSize: 'medium',
            colorScheme: 'warm',
            urgency: 'standard',
            budget: '3000-5000',
            specialInstructions: 'Portrait of my grandmother',
            referenceImages: JSON.stringify(['ref1.jpg', 'ref2.jpg']),
            status: 'in-progress',
            pricing: JSON.stringify({
                basePrice: 2500,
                rushFee: 0,
                customSizeFee: 0,
                totalAmount: 2500
            })
        }
    ],
    classes: [
        {
            userId: 3,
            bookingNumber: 'CL20241201001',
            studentName: 'Jane Customer',
            studentEmail: 'jane@example.com',
            studentPhone: '+91 98765 43212',
            studentAge: 25,
            classType: 'beginner',
            artMedium: 'watercolor',
            classDuration: '2hour',
            classSize: 'small',
            preferredDate: '2024-12-15',
            preferredTime: '14:00',
            experienceLevel: 'beginner',
            learningGoals: 'Learn basic watercolor techniques',
            budget: '1000-2000',
            status: 'confirmed'
        }
    ],
    contact: [
        {
            name: 'Test Contact',
            email: 'test@example.com',
            phone: '+91 98765 43213',
            subject: 'General Inquiry',
            message: 'This is a test contact form submission',
            category: 'general',
            status: 'new',
            priority: 'medium'
        }
    ]
};

async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');

        // Insert sample users
        console.log('Inserting sample users...');
        for (const user of sampleData.users) {
            await dbHelper.run(
                `INSERT OR IGNORE INTO users (fullName, username, email, password, phone, role, isEmailVerified, newsletterSubscription) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [user.fullName, user.username, user.email, user.password, user.phone, user.role, user.isEmailVerified, user.newsletterSubscription]
            );
        }

        // Insert sample gallery items
        console.log('Inserting sample gallery items...');
        for (const item of sampleData.gallery) {
            await dbHelper.run(
                `INSERT OR IGNORE INTO gallery (artistId, title, description, category, style, medium, dimensions, price, images, tags, colors, techniques, isFeatured) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [item.artistId, item.title, item.description, item.category, item.style, item.medium, item.dimensions, item.price, item.images, item.tags, item.colors, item.techniques, item.isFeatured]
            );
        }

        // Insert sample orders
        console.log('Inserting sample orders...');
        for (const order of sampleData.orders) {
            await dbHelper.run(
                `INSERT OR IGNORE INTO orders (userId, orderNumber, customerName, customerEmail, customerPhone, artworkType, artworkStyle, canvasSize, colorScheme, urgency, budget, specialInstructions, referenceImages, status, pricing) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [order.userId, order.orderNumber, order.customerName, order.customerEmail, order.customerPhone, order.artworkType, order.artworkStyle, order.canvasSize, order.colorScheme, order.urgency, order.budget, order.specialInstructions, order.referenceImages, order.status, order.pricing]
            );
        }

        // Insert sample classes
        console.log('Inserting sample classes...');
        for (const classItem of sampleData.classes) {
            await dbHelper.run(
                `INSERT OR IGNORE INTO classes (userId, bookingNumber, studentName, studentEmail, studentPhone, studentAge, classType, artMedium, classDuration, classSize, preferredDate, preferredTime, experienceLevel, learningGoals, budget, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [classItem.userId, classItem.bookingNumber, classItem.studentName, classItem.studentEmail, classItem.studentPhone, classItem.studentAge, classItem.classType, classItem.artMedium, classItem.classDuration, classItem.classSize, classItem.preferredDate, classItem.preferredTime, classItem.experienceLevel, classItem.learningGoals, classItem.budget, classItem.status]
            );
        }

        // Insert sample contacts
        console.log('Inserting sample contacts...');
        for (const contact of sampleData.contact) {
            await dbHelper.run(
                `INSERT OR IGNORE INTO contact (name, email, phone, subject, message, category, status, priority) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [contact.name, contact.email, contact.phone, contact.subject, contact.message, contact.category, contact.status, contact.priority]
            );
        }

        console.log('Database initialization completed successfully!');
        console.log('\nSample data inserted:');
        console.log('- 3 users (admin, artist, customer)');
        console.log('- 3 gallery items');
        console.log('- 1 sample order');
        console.log('- 1 sample class booking');
        console.log('- 1 sample contact submission');
        console.log('\nDefault login credentials:');
        console.log('Email: admin@busycanvas.com, Password: password');
        console.log('Email: john@busycanvas.com, Password: password');
        console.log('Email: jane@example.com, Password: password');

    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    } finally {
        await dbHelper.close();
    }
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase }; 