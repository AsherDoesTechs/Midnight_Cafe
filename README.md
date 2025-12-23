# ☕ Midnight Cafe Web Application

A modern, responsive, and interactive cafe web application that allows users to browse the menu, place orders, manage a cart, book tables, and send inquiries. Built with a clean UI and smooth user experience in mind.

---

PROBLEMS:
BOOKING 12:00PM STILL ACCESSED TO BOOKING EVEN THOUGH CLOSING TIME IS 01:00 AM
EMAIL PROBLEM
1] ❌ Error sending email: Error: connect ECONNREFUSED 108.177.125.108:587
[1] at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1634:16) {
[1] errno: -4078,
[1] code: 'ESOCKET',
[1] syscall: 'connect',
[1] address: '108.177.125.108',
[1] port: 587,
[1] command: 'CONN'
[1] }

## 🌟 Features

### **1. Navigation**

- Home, Menu, Booking, and Contact links
- Smooth scrolling navigation for internal homepage sections
- Mobile-responsive hamburger menu
- Active link indication for current section
- **Back to Top button** for easy navigation back to the top of the page

### **2. Cart Management**

- Add items to cart
- Remove individual items
- Automatically calculates total number of items
- Automatically calculates total cart value
- Clear entire cart
- Modal-based cart UI
- "Proceed to Checkout" button (redirects to booking/checkout page)
- Cart stored in **localStorage** for persistence

### **3. Booking System**

- Booking Form: name, email, date, time, number of guests
- Stores booking data in **localStorage**
- Redirects to a **Booking Summary** page
- Responsive booking layout
- Form validation (empty fields, email format, etc.)

### **4. Contact Form**

- Users can send messages with name, email, and message
- Success alert after form submission
- Displays cafe contact details: Phone, Email, Address

### **5. Responsive Design**

- Fully responsive for mobile, tablet, and desktop
- Built using Tailwind CSS for quick layout, spacing, and styling
- Mobile-first design

### **6. General UX Functionalities (Additional Basic Features)**

- Animated scrolling for internal links
- Button hover effects
- Image responsiveness
- Modal animations
- Sticky navigation (optional)
- **"Back to Top"** button added for smooth user experience

---

## 🔧 Key Functionalities

### **1. Cart System**

- Add to Cart
- Remove from Cart
- Clear Cart
- Update Cart Count
- Calculate Total Price
- Cart Modal Popup
- Checkout redirect

### **2. Booking System**

- Booking form submission
- Store booking details in localStorage
- Show booking summary
- Validate date/time inputs
- Prevent booking conflicts (future enhancement)
- Sign up, Login, Logout (Locally)
- Password reset (Locally)
- Save order and booking history (Locally)

### **3. Contact System**

- Submit message
- Input validation
- Display contact info
- Success confirmation alert
- Email / SMS confirmation (Locally)

### **4. Back to Top Button**

- Appears after scrolling down
- Smooth scroll to top (hero section)

---

## 🧩 Additional Useful Functionalities You Missed (Added Here)

These are features your current app already has or should ideally include:

### **✨ Basic Quality-of-Life Improvements**

- **"Back to Top" button** for easier navigation
- **Loading animations** for pages (UI polish)
- **404 / Error Handling pages**
- **Reusable UI components** for headers, cards, and modals

### **✨ Better Menu Experience**

- Menu categories UI sections
- Responsive grid layout for items
- Item modal popup (description + larger image)
- Dynamic price formatting

---

## 🚀 Future Enhancements (Expanded for Scalability)

### **1. User Authentication**

- Personalized recommendations

### **2. Payment Integration**

- Stripe / PayPal checkout
- Send digital receipt after order
- Payment verification status

### **3. Notifications**

- Real-time order status (Preparing → Ready → Completed)
- WebSockets or Firebase

### **4. Menu Filtering & Search** ✅ Done All!!

- Filter by categories (coffee, pastries, drinks, meals)
- Dietary preferences filter
- Price sorting
- Search bar with auto-suggestions

### **5. Admin Dashboard**

- Manage menu items (CRUD)
- Track user activity
- Booking overview calendar
- Sales analytics
- Order management system

### **6. Ratings & Reviews**

- Users can rate items
- Display review averages
- Review moderation (admin)

### **7. Performance Enhancements**

- Lazy load images ✅
- Minify JS/CSS ✅
- Remove unused Tailwind styles ✅
- Optimized image compression ✅
- Server-side rendering (future)

### **8. Security Enhancements**

- Input sanitization
- CSRF protection
- Secure cookies
- HTTPS deployment

---

## 📁 Tech Stack

- **Frontend:** React, HTML, Tailwind CSS, JavaScript
- **State Management:** LocalStorage
- **UI/UX:** Tailwind, Custom Animations
- **Backend (Future):** Node.js / Express / MongoDB or MySQL (Optional)

---

## 📌 Installation & Setup
