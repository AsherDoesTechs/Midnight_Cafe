-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: web_system
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DELETE FROM bookings
WHERE id BETWEEN 12 AND 13;

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `space_id` int NOT NULL,
  `student_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Not Specified',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_identifier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Confirmed','Cancelled','Completed','No Show','In Progress') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Confirmed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `space_id` (`space_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`space_id`) REFERENCES `spaces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (44,3,'123456','Ash Basco','Ash Basco','asherbasco92@gmail.com','091231272312',NULL,'2025-12-12 13:00:00','2025-12-12 17:00:00','Equipments: mic, projector. Food Order: Latte (x1); Espresso (x1); Cappuccino (x1)','Confirmed','2025-12-12 18:25:09'),(45,2,'123456','Paul Vincent','Paul Vincent','jocol30953@crsay.com','081238123123',NULL,'2025-12-13 13:00:00','2025-12-13 16:00:00','Equipments: projector, mic. Food Order: ','Confirmed','2025-12-12 18:36:58');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `combined_orders`
--

DROP TABLE IF EXISTS `combined_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `combined_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `total_amount` decimal(10,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `type` varchar(10) NOT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `guest_uid` varchar(255) DEFAULT NULL,
  `order_id` int DEFAULT NULL,
  `booking_id` int DEFAULT NULL,
  `payment_status` enum('Paid','Pending','Refunded') NOT NULL DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `fk_co_user_link` (`user_id`),
  KEY `fk_co_guest_link` (`guest_uid`),
  CONSTRAINT `fk_co_booking_link` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_co_food_order_link` FOREIGN KEY (`order_id`) REFERENCES `food_orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_co_user_link` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `combined_orders_chk_1` CHECK ((`type` in (_utf8mb4'Food',_utf8mb4'Booking',_utf8mb4'Combined')))
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `combined_orders`
--

LOCK TABLES `combined_orders` WRITE;
/*!40000 ALTER TABLE `combined_orders` DISABLE KEYS */;
INSERT INTO `combined_orders` VALUES (1,12.00,'Completed','Food','2025-12-03 02:42:42',1,NULL,1,NULL,'Pending'),(5,11610.00,'Pending','Booking','2025-12-03 05:41:42',NULL,NULL,NULL,NULL,'Pending'),(6,3800.00,'Pending','Booking','2025-12-03 05:43:10',NULL,NULL,NULL,NULL,'Pending'),(7,3600.00,'Confirmed','Booking','2025-12-04 10:45:12',NULL,NULL,NULL,NULL,'Paid'),(8,5200.00,'Confirmed','Booking','2025-12-04 11:02:02',NULL,'a02b8851-7fa1-47e2-aced-6b7c3da6018f',NULL,NULL,'Paid'),(9,5470.00,'Confirmed','Booking','2025-12-04 11:09:07',NULL,'a043beb9-6a80-4975-ba28-3ec40e922d23',NULL,NULL,'Paid'),(10,1320.00,'Confirmed','Booking','2025-12-04 13:16:08',NULL,'ec6cde9e-a4ed-4af8-9ee4-c5d6ce35f4d1',NULL,NULL,'Paid'),(11,650.00,'Confirmed','Booking','2025-12-04 13:16:15',NULL,'e5249ff9-a561-40ce-8dec-4d679f9e1653',NULL,NULL,'Paid'),(12,3540.00,'Confirmed','Booking','2025-12-04 13:23:36',NULL,'9439b6ee-0c55-4584-98d0-7a1e65d9aecd',NULL,NULL,'Paid'),(13,2180.00,'Confirmed','Booking','2025-12-04 13:29:23',NULL,'be199ec0-46ff-4e08-ad49-ebd60d36411a',NULL,NULL,'Paid'),(15,490.00,'Confirmed','Booking','2025-12-04 14:20:56',NULL,'b8bcd4b7-34a6-44a1-9889-380841986e71',NULL,NULL,'Paid'),(16,490.00,'Confirmed','Booking','2025-12-04 14:33:34',NULL,'23caee1b-d8cc-422f-86ed-66cf35e0ce08',NULL,NULL,'Paid'),(17,500.00,'Pending','Booking','2025-12-04 14:36:38',NULL,'a5ccdfb0-7f23-4ede-a742-3366733ece31',NULL,NULL,'Paid'),(18,400.00,'Confirmed','Booking','2025-12-04 14:40:15',NULL,'f3c6015f-d8c2-4ce1-8cf5-3a00950e85db',NULL,NULL,'Paid'),(19,2230.00,'Confirmed','Booking','2025-12-04 14:45:24',NULL,'dbcce25c-e7f5-4248-9cf7-a300f35d5e50',NULL,NULL,'Paid'),(20,2270.00,'Confirmed','Booking','2025-12-04 14:51:37',NULL,'0fa19137-72ae-48db-9a58-82b82a7886eb',NULL,NULL,'Paid'),(21,4250.00,'Confirmed','Booking','2025-12-05 04:35:39',NULL,'cef8b987-eea7-4200-a15d-919dad215f12',NULL,NULL,'Paid'),(22,3900.00,'Confirmed','Booking','2025-12-05 04:36:39',NULL,'105d1c4d-4c8e-48d8-bd87-ae492956cff0',NULL,NULL,'Paid'),(23,1830.00,'Confirmed','Booking','2025-12-09 01:40:05',NULL,'f2c500f8-ea6c-4ede-8643-7244d93d65b5',NULL,NULL,'Paid'),(24,3300.00,'Confirmed','Booking','2025-12-09 10:26:31',NULL,'7be6d284-a543-464a-be00-b6826af1e194',NULL,NULL,'Paid'),(25,4550.00,'Confirmed','Booking','2025-12-09 10:43:38',NULL,'d1106b97-5c44-4bca-8dbe-f47757899fbb',NULL,NULL,'Paid'),(26,3600.00,'Confirmed','Booking','2025-12-09 10:46:16',NULL,'33d49d62-07a5-4238-b512-c999862cae68',NULL,NULL,'Paid'),(27,2700.00,'Confirmed','Booking','2025-12-09 10:49:54',NULL,'13b7bca1-1e24-4a86-9dc3-2e9b4b0f05b6',NULL,NULL,'Paid'),(28,3570.00,'Confirmed','Booking','2025-12-09 10:55:20',NULL,'c6cd3241-1509-4be0-8213-c3e20664f9b1',NULL,NULL,'Paid'),(29,3900.00,'Confirmed','Booking','2025-12-09 11:28:41',NULL,'7b5ae92e-405e-445f-96d8-cabb19ffebe5',NULL,NULL,'Paid'),(30,3150.00,'Confirmed','Booking','2025-12-09 12:21:53',NULL,'6ad8ee7a-5754-43b4-9f16-ab415d09f641',NULL,NULL,'Paid'),(31,3620.00,'Confirmed','Booking','2025-12-09 12:30:54',NULL,'7b6fa068-b0da-45f9-9ce9-aea602b05d8b',NULL,NULL,'Paid'),(32,5570.00,'Confirmed','Booking','2025-12-09 12:37:44',NULL,'ada0f39e-6d17-4acd-b63b-8b241243bd9f',NULL,NULL,'Paid'),(33,7720.00,'Confirmed','Booking','2025-12-09 13:00:39',NULL,'d2938e22-cf1d-4d6a-811c-2bd2568e28e7',NULL,NULL,'Paid'),(34,2600.00,'Confirmed','Booking','2025-12-09 13:03:31',NULL,'b82033a2-2270-4f53-b483-b45e01c288a6',NULL,NULL,'Paid'),(35,3640.00,'Confirmed','Booking','2025-12-09 13:04:55',NULL,'b5db5905-3e75-4dc6-8291-5bcfa0d582c8',NULL,NULL,'Paid'),(36,5500.00,'Confirmed','Booking','2025-12-09 13:18:26',NULL,'c36e3328-c29c-485b-9227-927addb00a16',5,NULL,'Paid'),(37,5960.00,'Confirmed','Booking','2025-12-09 13:23:14',NULL,'a331c34b-ac26-489a-8def-5dc7a731b932',6,NULL,'Paid'),(38,2600.00,'Confirmed','Booking','2025-12-09 13:31:46',NULL,'9cfdc114-0530-48c3-817c-7d5e1a8008e5',NULL,NULL,'Paid'),(39,5820.00,'Confirmed','Booking','2025-12-09 13:34:14',NULL,'59dfc486-59ef-45f3-97a2-c2b4073e93bb',7,NULL,'Paid'),(40,2600.00,'Confirmed','Booking','2025-12-09 13:38:03',NULL,'c03f4555-c027-4ba6-ace8-fdc178b03cc3',NULL,NULL,'Paid'),(41,4550.00,'Confirmed','Booking','2025-12-09 14:00:26',NULL,'0e65497b-65ce-4903-b082-f49511465036',9,NULL,'Paid'),(42,3550.00,'Confirmed','Booking','2025-12-10 05:58:05',NULL,'4b5166d5-5b7a-426c-a0bb-c010535239e8',13,NULL,'Paid'),(43,1300.00,'Confirmed','Booking','2025-12-12 15:03:43',NULL,'81b8d18f-abb0-4658-8ad0-756bae2b4bf4',NULL,NULL,'Paid'),(44,3140.00,'Confirmed','Booking','2025-12-12 15:12:57',NULL,'1c1689c7-cebd-458a-bf51-17a40b8bb6af',14,NULL,'Paid'),(45,2970.00,'Confirmed','Booking','2025-12-12 18:25:09',NULL,'4f9b9617-886f-41a6-871d-d4a53c7f37f4',15,44,'Paid'),(46,1350.00,'Confirmed','Booking','2025-12-12 18:36:58',NULL,'7c1362a8-5137-486d-949d-5d6c9d0d2c22',NULL,45,'Paid');
/*!40000 ALTER TABLE `combined_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `submission_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
INSERT INTO `contact_messages` VALUES (1,'Test','test@example.com','Hello!','2025-12-02 21:03:12'),(2,'Asher Basco','Asherbasco92@gmail.com','Hello Testing!!','2025-12-02 21:05:44');
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_ideas`
--

DROP TABLE IF EXISTS `custom_ideas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `custom_ideas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Draft','Submitted','Processing','Completed','Rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `custom_ideas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_ideas`
--

LOCK TABLES `custom_ideas` WRITE;
/*!40000 ALTER TABLE `custom_ideas` DISABLE KEYS */;
INSERT INTO `custom_ideas` VALUES (1,4,'Triple Chocolate Lava Cake','A molten chocolate volcano with a crunchy cocoa-cookie crust, a gooey triple-layer lava core (dark, milk, and white chocolate), topped with crackling chili-cocoa dust, espresso drizzle, and a scoop of smoky caramel ice cream that melts into the center like an erupting dessert bomb.','Draft','2025-12-04 13:14:53','2025-12-04 13:14:53'),(2,4,'Triple Cream Chocolate','Super Sweet Drinks\n','Draft','2025-12-09 01:20:25','2025-12-09 01:20:25'),(3,4,'Banana Shake','Super Delicious Fruit Shake','Draft','2025-12-09 01:20:39','2025-12-09 01:20:39'),(4,4,'Smoothie','Great , Sugarry Drink','Draft','2025-12-12 14:30:31','2025-12-12 14:30:31'),(5,16,'Chocolate Smoothie','Chocolate Syrup with Drinked Ice','Draft','2025-12-12 15:31:36','2025-12-12 15:31:36');
/*!40000 ALTER TABLE `custom_ideas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `food_order_items`
--

DROP TABLE IF EXISTS `food_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `food_order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `price_per_unit` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_food_order_item_link` (`order_id`),
  CONSTRAINT `fk_food_order_item_link` FOREIGN KEY (`order_id`) REFERENCES `food_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `food_order_items`
--

LOCK TABLES `food_order_items` WRITE;
/*!40000 ALTER TABLE `food_order_items` DISABLE KEYS */;
INSERT INTO `food_order_items` VALUES (1,2,'Chicken Caesar Wrap',1,6.50),(2,2,'Bottled Water',2,1.50),(9,5,'Lemon Iced Tea',10,90.00),(10,5,'Iced Matcha Latte',1,160.00),(11,5,'Mocha',1,170.00),(12,5,'Espresso',1,100.00),(13,5,'Latte',1,150.00),(14,5,'Cappuccino',1,120.00),(15,6,'Lemon Iced Tea',1,90.00),(16,6,'Iced Matcha Latte',6,160.00),(17,6,'Mocha',3,170.00),(18,6,'Espresso',5,100.00),(19,7,'Iced Matcha Latte',4,160.00),(20,7,'Lemon Iced Tea',7,90.00),(27,9,'Mocha',4,170.00),(28,9,'Iced Matcha Latte',5,160.00),(29,9,'Lemon Iced Tea',5,90.00),(30,9,'Espresso',1,100.00),(31,9,'Latte',1,150.00),(32,9,'Cappuccino',1,120.00),(51,13,'Iced Matcha Latte',1,160.00),(52,13,'Lemon Iced Tea',1,90.00),(53,13,'Mocha',1,170.00),(54,13,'Blueberry Muffin',3,95.00),(55,13,'Chocolate Croissant',3,105.00),(56,13,'Sparkling Water',4,70.00),(57,14,'Iced Matcha Latte',4,160.00),(58,14,'Espresso',7,100.00),(59,15,'Latte',1,150.00),(60,15,'Espresso',1,100.00),(61,15,'Cappuccino',1,120.00);
/*!40000 ALTER TABLE `food_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `food_orders`
--

DROP TABLE IF EXISTS `food_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `food_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `total_price` decimal(10,2) NOT NULL,
  `total_items` int NOT NULL,
  `status` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completion_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `food_orders_chk_1` CHECK ((`status` in (_utf8mb4'Pending',_utf8mb4'Preparing',_utf8mb4'Completed',_utf8mb4'Cancelled')))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `food_orders`
--

LOCK TABLES `food_orders` WRITE;
/*!40000 ALTER TABLE `food_orders` DISABLE KEYS */;
INSERT INTO `food_orders` VALUES (1,15.00,3,'Completed','2025-12-03 02:42:42','2025-12-03 02:42:42',NULL),(2,9.50,3,'Pending','2025-12-03 02:42:42','2025-12-03 02:42:42',NULL),(5,1600.00,15,'Pending','2025-12-09 13:18:26','2025-12-09 13:18:26',NULL),(6,2060.00,15,'Pending','2025-12-09 13:23:14','2025-12-09 13:23:14',NULL),(7,1270.00,11,'Pending','2025-12-09 13:34:14','2025-12-09 13:34:14',NULL),(9,2300.00,17,'Pending','2025-12-09 14:00:26','2025-12-09 14:00:26',NULL),(13,1300.00,13,'Pending','2025-12-10 05:58:05','2025-12-10 05:58:05',NULL),(14,1340.00,11,'Pending','2025-12-12 15:12:57','2025-12-12 15:12:57',NULL),(15,370.00,3,'Pending','2025-12-12 18:25:09','2025-12-12 18:25:09',NULL);
/*!40000 ALTER TABLE `food_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(2048) DEFAULT NULL,
  `category` enum('coffee','drink','pastry','dessert','meal') NOT NULL,
  `diet_tags` varchar(1024) DEFAULT NULL,
  `status` enum('available','out-of-stock','coming-soon','archived') NOT NULL DEFAULT 'available',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (1,'Cappuccino','Foamy espresso perfection.',120.00,'/uploads/image-1765274957817.png','coffee','dairy','available'),(2,'Latte','Smooth espresso with milk.',150.00,'/uploads/image-1765274948958.png','coffee','dairy','available'),(3,'Espresso','Strong and bold espresso shot.',100.00,'/uploads/image-1765274942359.png','coffee','','available'),(4,'Mocha','Chocolate meets espresso.',170.00,'/uploads/image-1765274926044.png','coffee','dairy','available'),(20,'Iced Matcha Latte','Refreshing green tea with milk.',160.00,'/uploads/image-1765274902543.png','drink','dairy','available'),(21,'Lemon Iced Tea','Freshly brewed iced tea.',90.00,'/uploads/image-1765274883302.png','drink','','available'),(22,'Sparkling Water','Plain bottled carbonated water.',70.00,'/uploads/image-1765274908648.png','drink','vegan, keto','available'),(40,'Blueberry Muffin','Soft and fluffy with fresh berries.',95.00,'/uploads/image-1765274918138.png','pastry','','available'),(41,'Chocolate Croissant','Flaky and buttery with chocolate.',105.00,'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=60','pastry','dairy','available'),(42,'Apple Turnover','Flaky pastry filled with spiced apples.',115.00,'/uploads/image-1765274866613.png','pastry','dairy','available'),(60,'Vegan Brownie','Rich and dairy-free.',110.00,'/uploads/image-1765274859162.png','dessert','vegan','available'),(61,'Cheesecake Slice','Creamy, sweet, delicious.',145.00,'/uploads/image-1765274847803.png','dessert','dairy','out-of-stock'),(62,'Tiramisu Cup','Coffee-flavored Italian dessert with mascarpone.',160.00,'/uploads/image-1765274833626.png','dessert','dairy','available'),(80,'Chicken Alfredo Pasta','Creamy pasta goodness',220.00,'/uploads/image-1765274988633.png','meal','dairy','coming-soon'),(81,'Beef Burger','Juicy grilled beef patty.',190.00,'/uploads/image-1765274980099.png','meal','','archived'),(82,'Club Sandwich','Toasted bread with turkey, bacon, lettuce, and tomato.',185.00,'/uploads/image-1765274824983.png','meal','','coming-soon'),(83,'Lentil Soup','Hearty, plant-based soup.',175.00,'/uploads/image-1765274816609.png','meal','dairy','out-of-stock'),(84,'Orange Juice','a sweet claming oj for non-coffee lovers!!',2.25,'/uploads/image-1765274808489.png','drink','','available'),(85,'macchiato','powdered Coffee',20.05,'/uploads/image-1765243458953.jpg','coffee','dairy','available');
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spaces`
--

DROP TABLE IF EXISTS `spaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spaces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `capacity` int NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `price_per_hour` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spaces`
--

LOCK TABLES `spaces` WRITE;
/*!40000 ALTER TABLE `spaces` DISABLE KEYS */;
INSERT INTO `spaces` VALUES (1,'Study Pod',4,1,50.00,'2025-12-03 02:42:42'),(2,'Collaboration Hub',10,1,300.00,'2025-12-03 02:42:42'),(3,'New Meeting Room',10,1,0.00,'2025-12-03 05:39:43');
/*!40000 ALTER TABLE `spaces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_activity_logs`
--

DROP TABLE IF EXISTS `user_activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `action_description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `log_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_activity_user` (`user_id`),
  CONSTRAINT `fk_user_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activity_logs`
--

LOCK TABLES `user_activity_logs` WRITE;
/*!40000 ALTER TABLE `user_activity_logs` DISABLE KEYS */;
INSERT INTO `user_activity_logs` VALUES (1,4,'2025-12-04 19:40:06','User logged out.','Auth'),(2,4,'2025-12-04 19:40:11','User logged in via Access Code.','Auth'),(3,4,'2025-12-04 19:40:22','User logged out.','Auth'),(4,8,'2025-12-04 19:40:33','New guest session started.','Auth'),(5,8,'2025-12-04 19:40:52','User logged out.','Auth'),(6,4,'2025-12-04 19:51:22','User logged in via Access Code.','Auth'),(7,4,'2025-12-04 19:52:58','User logged out.','Auth'),(8,4,'2025-12-04 20:39:41','User logged in via Access Code.','Auth'),(9,4,'2025-12-04 21:25:25','User logged out.','Auth'),(10,4,'2025-12-04 21:26:09','User logged in via Access Code.','Auth'),(11,4,'2025-12-04 21:51:15','User logged out.','Auth'),(12,4,'2025-12-04 21:51:50','User logged in via Access Code.','Auth'),(13,4,'2025-12-04 22:20:14','User logged out.','Auth'),(14,4,'2025-12-04 22:20:25','User logged in via Access Code.','Auth'),(15,4,'2025-12-04 22:52:15','User logged out.','Auth'),(16,4,'2025-12-05 12:19:16','User logged in via Access Code.','Auth'),(17,4,'2025-12-05 12:20:09','User logged out.','Auth'),(18,4,'2025-12-05 12:31:39','User logged in via Access Code.','Auth'),(19,4,'2025-12-05 12:37:25','User logged out.','Auth'),(20,4,'2025-12-09 09:13:41','User logged in via Access Code.','Auth'),(21,4,'2025-12-09 09:14:03','User logged out.','Auth'),(22,4,'2025-12-09 09:18:06','User logged in via Access Code.','Auth'),(23,4,'2025-12-09 09:20:56','User logged out.','Auth'),(24,4,'2025-12-09 09:24:42','User logged in via Access Code.','Auth'),(25,4,'2025-12-09 09:36:00','User logged out.','Auth'),(26,9,'2025-12-09 09:37:52','New guest session started.','Auth'),(27,9,'2025-12-09 09:41:42','User logged out.','Auth'),(28,9,'2025-12-09 09:42:00','User logged in via Access Code.','Auth'),(29,9,'2025-12-09 09:42:06','User logged out.','Auth'),(30,4,'2025-12-09 09:42:33','User logged in via Access Code.','Auth'),(31,4,'2025-12-09 09:43:10','User logged out.','Auth'),(32,10,'2025-12-09 09:43:20','New guest session started.','Auth'),(33,10,'2025-12-09 09:43:25','User logged out.','Auth'),(34,11,'2025-12-09 09:43:26','New guest session started.','Auth'),(35,11,'2025-12-09 09:44:15','User logged out.','Auth'),(36,12,'2025-12-09 09:47:14','User logged in via Magic Link.','Auth'),(37,12,'2025-12-09 09:47:14','User logged in via Magic Link.','Auth'),(38,12,'2025-12-09 09:47:32','User logged in via Access Code.','Auth'),(39,12,'2025-12-09 09:47:47','User profile updated.','Update'),(40,12,'2025-12-09 09:47:51','User logged out.','Auth'),(41,12,'2025-12-09 09:47:59','User logged in via Access Code.','Auth'),(42,12,'2025-12-09 09:48:05','User logged out.','Auth'),(43,12,'2025-12-09 09:48:19','User logged in via Access Code.','Auth'),(44,12,'2025-12-09 09:48:35','User logged out.','Auth'),(45,12,'2025-12-09 09:48:52','User logged in via Access Code.','Auth'),(46,12,'2025-12-09 09:48:53','User logged in via Access Code.','Auth'),(47,12,'2025-12-09 09:49:15','User logged out.','Auth'),(48,11,'2025-12-09 09:56:23','User logged in via Access Code.','Auth'),(49,11,'2025-12-09 09:57:01','User logged out.','Auth'),(50,12,'2025-12-09 18:20:29','User logged in via Access Code.','Auth'),(51,12,'2025-12-09 18:35:55','User logged out.','Auth'),(52,12,'2025-12-09 18:35:55','User logged out.','Auth'),(53,12,'2025-12-09 18:43:15','User logged in via Access Code.','Auth'),(54,12,'2025-12-09 18:50:53','User logged out.','Auth'),(55,12,'2025-12-09 18:51:24','User logged in via Access Code.','Auth'),(56,12,'2025-12-09 18:53:36','User logged out.','Auth'),(57,12,'2025-12-09 18:54:48','User logged in via Access Code.','Auth'),(58,12,'2025-12-09 19:23:32','User logged in via Access Code.','Auth'),(59,12,'2025-12-09 19:28:53','User logged out.','Auth'),(60,12,'2025-12-09 20:19:20','User logged in via Access Code.','Auth'),(61,12,'2025-12-09 20:55:16','User logged in via Access Code.','Auth'),(62,12,'2025-12-09 20:58:19','User logged out.','Auth'),(63,12,'2025-12-09 20:58:25','User logged in via Access Code.','Auth'),(64,12,'2025-12-09 21:21:23','User logged out.','Auth'),(65,12,'2025-12-09 21:22:27','User logged in via Access Code.','Auth'),(66,12,'2025-12-09 21:26:04','User logged out.','Auth'),(67,12,'2025-12-09 21:27:47','User logged in via Access Code.','Auth'),(68,12,'2025-12-09 22:01:16','User logged out.','Auth'),(69,13,'2025-12-10 13:54:10','User logged in via Access Code.','Auth'),(70,13,'2025-12-10 14:00:49','User logged out.','Auth'),(71,4,'2025-12-12 22:26:34','User logged in via Access Code.','Auth'),(72,4,'2025-12-12 22:30:39','User logged out.','Auth'),(73,14,'2025-12-12 22:32:07','New guest session started.','Auth'),(74,14,'2025-12-12 22:32:12','User logged out.','Auth'),(75,15,'2025-12-12 22:32:21','New guest session started.','Auth'),(76,15,'2025-12-12 22:32:55','User logged out.','Auth'),(77,13,'2025-12-12 22:36:20','User logged in via Access Code.','Auth'),(78,13,'2025-12-12 22:36:31','User logged out.','Auth'),(79,16,'2025-12-12 22:43:36','User logged in via Access Code.','Auth'),(80,16,'2025-12-12 22:43:45','User logged out.','Auth'),(81,16,'2025-12-12 22:59:41','User logged in via Access Code.','Auth'),(82,16,'2025-12-12 23:07:45','User profile updated.','Update'),(83,16,'2025-12-12 23:07:50','User logged out.','Auth'),(84,16,'2025-12-12 23:08:19','User logged in via Access Code.','Auth'),(85,16,'2025-12-12 23:08:21','User logged in via Access Code.','Auth'),(86,16,'2025-12-12 23:08:56','User logged out.','Auth'),(87,16,'2025-12-12 23:10:19','User logged in via Access Code.','Auth'),(88,16,'2025-12-12 23:10:38','User logged out.','Auth'),(89,16,'2025-12-12 23:10:46','User logged in via Access Code.','Auth'),(90,16,'2025-12-12 23:10:50','User logged out.','Auth'),(91,16,'2025-12-12 23:10:54','User logged in via Access Code.','Auth'),(92,16,'2025-12-12 23:11:02','User logged out.','Auth'),(93,16,'2025-12-12 23:11:24','User logged in via Access Code.','Auth'),(94,16,'2025-12-12 23:19:33','User logged out.','Auth'),(95,19,'2025-12-12 23:24:43','New guest session started.','Auth'),(96,19,'2025-12-12 23:27:58','User logged out.','Auth'),(97,16,'2025-12-12 23:28:11','User logged in via Access Code.','Auth'),(98,16,'2025-12-12 23:34:57','User logged out.','Auth'),(99,16,'2025-12-13 01:57:35','User logged in via Access Code.','Auth'),(100,16,'2025-12-13 02:26:04','User logged out.','Auth'),(101,16,'2025-12-13 02:32:42','User logged in via Access Code.','Auth'),(102,16,'2025-12-13 02:38:14','User profile updated.','Update'),(103,16,'2025-12-13 02:38:26','User logged out.','Auth'),(104,16,'2025-12-13 02:38:32','User logged in via Access Code.','Auth'),(105,16,'2025-12-13 02:38:35','User logged out.','Auth'),(106,16,'2025-12-13 02:38:40','User logged in via Access Code.','Auth'),(107,16,'2025-12-13 02:38:47','User profile updated.','Update'),(108,16,'2025-12-13 02:38:49','User logged out.','Auth');
/*!40000 ALTER TABLE `user_activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `menu_item_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorite` (`user_id`,`menu_item_id`),
  KEY `menu_item_id` (`menu_item_id`),
  CONSTRAINT `user_favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_favorites_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
INSERT INTO `user_favorites` VALUES (5,4,2),(6,4,3),(2,4,4),(3,4,20),(4,4,21),(8,12,1),(9,12,2),(10,12,3),(11,12,4),(12,12,20),(13,12,21),(19,16,1),(20,16,2),(21,16,3);
/*!40000 ALTER TABLE `user_favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `role` enum('customer','guest','admin') NOT NULL DEFAULT 'customer',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `access_code` varchar(10) DEFAULT NULL,
  `access_code_expires` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `student_id` (`student_id`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `student_id_2` (`student_id`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `student_id_3` (`student_id`),
  UNIQUE KEY `access_code` (`access_code`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'alice.smith@university.edu','Alice Smith','S9001',1,'2025-12-03 02:42:42',NULL,'customer','2025-12-03 03:49:58',NULL,NULL),(2,'bob.jones@university.edu','Bob Jones',NULL,1,'2025-12-03 02:42:42',NULL,'customer','2025-12-03 03:49:58',NULL,NULL),(3,'guest_1764732797666@temp.com',NULL,NULL,1,'2025-12-03 03:33:18',NULL,'guest','2025-12-03 04:13:28','GUEST1234','2025-12-04 04:13:28'),(4,'silentgrindyt@gmail.com','Ash Basco',NULL,1,'2025-12-03 03:33:56','2025-12-12 14:30:39','customer','2025-12-12 14:30:39','f57f32d819','2025-12-13 14:26:29'),(5,NULL,'Guest_1764735432187',NULL,1,'2025-12-03 04:17:12',NULL,'guest','2025-12-03 04:17:12','06f2622171','2025-12-04 04:17:12'),(6,NULL,'Guest_1764755442779',NULL,1,'2025-12-03 09:50:42',NULL,'guest','2025-12-03 09:50:42','0809a630ba','2025-12-04 09:50:43'),(7,NULL,'Guest_1764838249367',NULL,1,'2025-12-04 08:50:49',NULL,'guest','2025-12-04 08:50:49','53d7b10761','2025-12-05 08:50:49'),(8,NULL,'Guest_1764848433820',NULL,1,'2025-12-04 11:40:33','2025-12-04 11:40:52','guest','2025-12-04 11:40:52','b678386220','2025-12-05 11:40:34'),(9,NULL,'Guest_1765244272814',NULL,1,'2025-12-09 01:37:52','2025-12-09 01:42:06','guest','2025-12-09 01:42:06','2f368c0d42','2025-12-10 01:37:53'),(10,NULL,'Guest_1765244600799',NULL,1,'2025-12-09 01:43:20','2025-12-09 01:43:25','guest','2025-12-09 01:43:25','ce261f2236','2025-12-10 01:43:21'),(11,NULL,'Guest_1765244606850',NULL,1,'2025-12-09 01:43:26','2025-12-09 01:57:01','guest','2025-12-09 01:57:01','122ab270a3','2025-12-10 01:43:27'),(12,'asherbasco92@gmail.com','Asher123',NULL,1,'2025-12-09 01:44:46','2025-12-09 14:01:16','customer','2025-12-12 14:34:04','9fe50d7490','2025-12-13 14:34:05'),(13,'johnricovincentllada5@gmail.com',NULL,NULL,1,'2025-12-10 05:53:33','2025-12-12 14:36:31','customer','2025-12-12 14:36:31','d6f3ebcde3','2025-12-13 14:35:45'),(14,NULL,'Guest_1765549927631',NULL,1,'2025-12-12 14:32:07','2025-12-12 14:32:12','guest','2025-12-12 14:32:12','9e7f4e1dca','2025-12-13 14:32:08'),(15,NULL,'Guest_1765549941206',NULL,1,'2025-12-12 14:32:21','2025-12-12 14:32:55','guest','2025-12-12 14:32:55','f621bc8d73','2025-12-13 14:32:21'),(16,'dellehugel@gmail.com','Gil Bryan',NULL,1,'2025-12-12 14:42:15','2025-12-12 18:38:49','customer','2025-12-12 18:38:49','8b4d54fac9','2025-12-13 14:49:38'),(17,NULL,' dellehugel@gmail.com',NULL,1,'2025-12-12 14:50:51',NULL,'guest','2025-12-12 14:51:44','3b2bfc6b04','2025-12-13 14:51:44'),(18,'funfacts.trend@gmail.com',NULL,NULL,1,'2025-12-12 14:53:56',NULL,'customer','2025-12-12 14:53:56','f9628db878','2025-12-13 14:53:57'),(19,NULL,'Guest_1765553083872',NULL,1,'2025-12-12 15:24:43','2025-12-12 15:27:58','guest','2025-12-12 15:27:58','5b679630b9','2025-12-13 15:24:44');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-13  2:41:22
