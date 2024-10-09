-- -------------------------------------------------------------
-- TablePlus 6.1.2(568)
--
-- https://tableplus.com/
--
-- Database: db_airbnb
-- Generation Time: 2024-10-09 01:57:08.7180
-- -------------------------------------------------------------


CREATE TABLE `Amenities` (
  `amenity_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`amenity_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `Bookings` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `property_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `guests` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_status` enum('pending','paid','refunded') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`booking_id`),
  KEY `property_id` (`property_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Bookings_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `Properties` (`property_id`),
  CONSTRAINT `Bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Cancellations` (
  `cancellation_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `reason` text,
  `cancellation_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`cancellation_id`),
  KEY `booking_id` (`booking_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Cancellations_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `Bookings` (`booking_id`),
  CONSTRAINT `Cancellations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Favorites` (
  `user_id` int NOT NULL,
  `property_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`property_id`),
  KEY `property_id` (`property_id`),
  CONSTRAINT `Favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`),
  CONSTRAINT `Favorites_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `Properties` (`property_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Locations` (
  `location_id` int NOT NULL AUTO_INCREMENT,
  `country` varchar(50) NOT NULL,
  `province` varchar(50) NOT NULL,
  `city` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `Personal_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `government_id` varchar(50) DEFAULT NULL,
  `address` text,
  `emergency_contact` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`detail_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `Personal_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Policies` (
  `policy_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `valid_until` date DEFAULT NULL,
  PRIMARY KEY (`policy_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Properties` (
  `property_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `base_price` decimal(10,2) NOT NULL,
  `max_guests` int NOT NULL,
  `type` enum('apartment','house','villa','condo','other') NOT NULL,
  `status` enum('active','inactive','pending','maintenance') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`property_id`),
  KEY `user_id` (`user_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `Properties_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`),
  CONSTRAINT `Properties_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `Locations` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Property_Amenities` (
  `property_id` int NOT NULL,
  `amenity_id` int NOT NULL,
  PRIMARY KEY (`property_id`,`amenity_id`),
  KEY `amenity_id` (`amenity_id`),
  CONSTRAINT `Property_Amenities_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `Properties` (`property_id`),
  CONSTRAINT `Property_Amenities_ibfk_2` FOREIGN KEY (`amenity_id`) REFERENCES `Amenities` (`amenity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Property_Policies` (
  `property_id` int NOT NULL,
  `policy_id` int NOT NULL,
  PRIMARY KEY (`property_id`,`policy_id`),
  KEY `policy_id` (`policy_id`),
  CONSTRAINT `Property_Policies_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `Properties` (`property_id`),
  CONSTRAINT `Property_Policies_ibfk_2` FOREIGN KEY (`policy_id`) REFERENCES `Policies` (`policy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `PropertyImages` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `property_id` int DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `image_type` enum('living_room','bedroom','kitchen','bathroom','exterior','view','dining_area','other') NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `caption` varchar(255) DEFAULT NULL,
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `property_id` (`property_id`),
  CONSTRAINT `PropertyImages_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `Properties` (`property_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `PropertyReviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `property_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `booking_id` int DEFAULT NULL,
  `rating` tinyint NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `property_id` (`property_id`),
  KEY `user_id` (`user_id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `PropertyReviews_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `Properties` (`property_id`),
  CONSTRAINT `PropertyReviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`),
  CONSTRAINT `PropertyReviews_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `Bookings` (`booking_id`),
  CONSTRAINT `PropertyReviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `User` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `birth_day` date DEFAULT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `role` enum('guest','host','admin') NOT NULL DEFAULT 'guest',
  `avatar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO User (name, email, password, phone, birth_day, gender, role)
VALUES
('John Doe', 'john.doe@example.com', 'hashed_password1', '123-456-7890', '1990-05-15', 'male', 'guest'),
('Jane Smith', 'jane.smith@example.com', 'hashed_password2', '098-765-4321', '1988-07-22', 'female', 'host'),
('Chris Johnson', 'chris.johnson@example.com', 'hashed_password3', '555-123-4567', '1995-11-30', 'other', 'admin'),
('Emily Davis', 'emily.davis@example.com', 'hashed_password4', '444-987-6543', '1992-03-14', 'female', 'guest'),
('Michael Brown', 'michael.brown@example.com', 'hashed_password5', '333-111-2222', '1985-09-07', 'male', 'host');

INSERT INTO Amenities (name, icon)
VALUES
('Free Wi-Fi', 'wifi_icon.png'),
('Swimming Pool', 'pool_icon.png'),
('Air Conditioning', 'ac_icon.png'),
('Parking', 'parking_icon.png'),
('Gym', 'gym_icon.png');


INSERT INTO Policies (name, description, valid_until)
VALUES
('Cancellation Policy', 'Free cancellation up to 24 hours before the booking date.', '2024-12-31'),
('Check-in Policy', 'Check-in is available from 2 PM to 10 PM.', NULL),
('Pet Policy', 'Pets are allowed upon request. Charges may apply.', '2025-01-15'),
('No Smoking Policy', 'Smoking is not allowed inside the property.', NULL),
('Damage Policy', 'Guests are responsible for any damages caused during their stay.', NULL);

INSERT INTO Locations (country, province, city, address)
VALUES
('United States', 'California', 'Los Angeles', '123 Main St, Downtown'),
('France', 'Provence-Alpes-Côte d\'Azur', 'Nice', '45 Rue de la Liberté'),
('Japan', 'Tokyo', 'Shibuya', '1-2-3 Dogenzaka, Shibuya-ku'),
('Australia', 'Queensland', 'Gold Coast', '98 Surfer Paradise Blvd'),
('Italy', 'Tuscany', 'Florence', 'Piazza del Duomo 15');

INSERT INTO Properties (user_id, location_id, name, description, base_price, max_guests, type, status)
VALUES
(1, 1, 'Cozy Apartment in City Center', 'A modern apartment located in the heart of the city with all the necessary amenities.', 75.00, 4, 'apartment', 'active'),
(2, 2, 'Luxury Beachfront Villa', 'A luxurious villa with private access to the beach and a swimming pool.', 350.00, 8, 'villa', 'active'),
(3, 3, 'Mountain Cabin Retreat', 'A secluded cabin in the mountains perfect for a peaceful getaway.', 120.00, 6, 'house', 'inactive'),
(4, 4, 'Downtown Condo with City View', 'A stylish condo offering a breathtaking view of the city skyline.', 200.00, 5, 'condo', 'active'),
(5, 5, 'Charming Country House', 'A spacious house in the countryside, ideal for family vacations.', 180.00, 7, 'house', 'pending');

INSERT INTO PropertyImages (property_id, image_url, image_type, is_primary, caption)
VALUES
(1, 'https://example.com/images/living_room1.jpg', 'living_room', 1, 'Spacious living room with modern furniture'),
(2, 'https://example.com/images/bedroom1.jpg', 'bedroom', 1, 'Cozy bedroom with ocean view'),
(3, 'https://example.com/images/kitchen1.jpg', 'kitchen', 0, 'Fully equipped modern kitchen'),
(4, 'https://example.com/images/bathroom1.jpg', 'bathroom', 0, 'Clean and bright bathroom'),
(5, 'https://example.com/images/exterior1.jpg', 'exterior', 1, 'Beautiful villa exterior with garden view');

INSERT INTO Bookings (property_id, user_id, check_in, check_out, guests, total_price, status, payment_status)
VALUES
(1, 1, '2024-10-15', '2024-10-20', 2, 375.00, 'confirmed', 'paid'),
(2, 2, '2024-11-01', '2024-11-05', 4, 1400.00, 'pending', 'pending'),
(3, 3, '2024-11-10', '2024-11-12', 3, 240.00, 'cancelled', 'refunded'),
(4, 4, '2024-12-01', '2024-12-07', 5, 1200.00, 'confirmed', 'paid'),
(5, 5, '2024-12-15', '2024-12-18', 6, 540.00, 'pending', 'pending');

INSERT INTO PropertyReviews (property_id, user_id, booking_id, rating, comment)
VALUES
(1, 1, 1, 5, 'Amazing stay! The apartment was clean and perfectly located.'),
(2, 2, 2, 4, 'Beautiful villa, but the Wi-Fi connection was weak.'),
(3, 3, 3, 3, 'The cabin was cozy but lacked basic amenities like heating.'),
(4, 4, 4, 5, 'Fantastic city view from the condo. Would love to stay again!'),
(5, 5, 5, 4, 'Charming country house, but some areas need maintenance.');

INSERT INTO Property_Policies (property_id, policy_id)
VALUES
(1, 1),  -- Bất động sản 1 áp dụng chính sách 1
(1, 2),  -- Bất động sản 1 áp dụng chính sách 2
(2, 2),  -- Bất động sản 2 áp dụng chính sách 2
(3, 3),  -- Bất động sản 3 áp dụng chính sách 3
(4, 1);  -- Bất động sản 4 áp dụng chính sách 1

INSERT INTO Property_Amenities (property_id, amenity_id)
VALUES
(1, 1),  -- Bất động sản 1 có tiện nghi 1
(1, 2),  -- Bất động sản 1 có tiện nghi 2
(2, 2),  -- Bất động sản 2 có tiện nghi 2
(2, 3),  -- Bất động sản 2 có tiện nghi 3
(3, 1);  -- Bất động sản 3 có tiện nghi 1

INSERT INTO Favorites (user_id, property_id)
VALUES
(1, 1),  -- Người dùng 1 yêu thích bất động sản 1
(1, 2),  -- Người dùng 1 yêu thích bất động sản 2
(2, 2),  -- Người dùng 2 yêu thích bất động sản 2
(2, 3),  -- Người dùng 2 yêu thích bất động sản 3
(3, 1);  -- Người dùng 3 yêu thích bất động sản 1



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;