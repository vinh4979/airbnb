CREATE DATABASE IF NOT EXISTS db_airbnb;
USE db_airbnb;

CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    birth_day DATE,
    gender ENUM('male', 'female', 'other') NOT NULL,
    role ENUM('guest', 'host', 'admin') NOT NULL DEFAULT 'guest'
);

CREATE TABLE Personal_details (
    detail_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    government_id VARCHAR(50),
    address TEXT,
    emergency_contact VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE Locations (
    location_id INT PRIMARY KEY AUTO_INCREMENT,
    country VARCHAR(50) NOT NULL,
    province VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL
);

CREATE TABLE Properties (
    property_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    location_id INT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    max_guests INT NOT NULL,
    type ENUM('apartment', 'house', 'villa', 'condo', 'other') NOT NULL,
    status ENUM('active', 'inactive', 'pending', 'maintenance') NOT NULL DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (location_id) REFERENCES Locations(location_id)
);

CREATE TABLE Amenities (
    amenity_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(255)
);

CREATE TABLE Property_Amenities (
    property_id INT,
    amenity_id INT,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES Properties(property_id),
    FOREIGN KEY (amenity_id) REFERENCES Amenities(amenity_id)
);

CREATE TABLE Policies (
    policy_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    valid_until DATE
);

CREATE TABLE Property_Policies (
    property_id INT,
    policy_id INT,
    PRIMARY KEY (property_id, policy_id),
    FOREIGN KEY (property_id) REFERENCES Properties(property_id),
    FOREIGN KEY (policy_id) REFERENCES Policies(policy_id)
);

CREATE TABLE Favorites (
    user_id INT,
    property_id INT,
    PRIMARY KEY (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (property_id) REFERENCES Properties(property_id)
);

CREATE TABLE Bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT,
    user_id INT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('pending', 'paid', 'refunded') NOT NULL DEFAULT 'pending',
    FOREIGN KEY (property_id) REFERENCES Properties(property_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE AvailabilityCalendar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT,
    date DATE NOT NULL,
    status ENUM('available', 'booked', 'blocked') NOT NULL DEFAULT 'available',
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (property_id) REFERENCES Properties(property_id)
);

CREATE TABLE PropertyReviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT,
    user_id INT,
    booking_id INT,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES Properties(property_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);

CREATE TABLE Messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT,
    receiver_id INT,
    property_id INT,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sender_id) REFERENCES User(user_id),
    FOREIGN KEY (receiver_id) REFERENCES User(user_id),
    FOREIGN KEY (property_id) REFERENCES Properties(property_id)
);

CREATE TABLE PropertyImages (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT,
    image_url VARCHAR(255) NOT NULL,
    image_type ENUM('living_room', 'bedroom', 'kitchen', 'bathroom', 'exterior', 'view', 'dining_area', 'other') NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    caption VARCHAR(255),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES Properties(property_id)
);

CREATE TABLE Cancellations (
    cancellation_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    user_id INT,
    reason TEXT,
    cancellation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    refund_amount DECIMAL(10, 2),
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

INSERT INTO User (name, email, password, phone, birth_day, gender, role)
VALUES 
    ('John Smith', 'johnsmith@email.com', 'hashed_password_1', '1234567890', '1990-05-15', 'male', 'guest'),
    ('Emma Johnson', 'emmajohnson@email.com', 'hashed_password_2', '2345678901', '1985-12-10', 'female', 'host'),
    ('Michael Brown', 'michaelbrown@email.com', 'hashed_password_3', '3456789012', '1992-08-22', 'male', 'guest'),
    ('Olivia Davis', 'oliviadavis@email.com', 'hashed_password_4', '4567890123', '1988-03-30', 'female', 'admin'),
    ('William Wilson', 'williamwilson@email.com', 'hashed_password_5', '5678901234', '1995-11-05', 'male', 'host');

ALTER TABLE User ADD COLUMN avatar VARCHAR(255);