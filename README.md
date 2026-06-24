# TeleHealth Pro – Online Doctor Consultation Platform

TeleHealth Pro is an industry-level, secure, and modern digital healthcare portal. It is designed to connect patient consultations with medical specialists, supporting real-time messaging, WebRTC video calling rooms, prescription receipts, lab files directories, and Stripe-powered consultation fee transactions.

---

## Technical Stack Overview

* **Frontend:** Vite + React.js, Redux Toolkit, React Router DOM, Tailwind CSS, Framer Motion, Chart.js, Lucide icons, Socket.io-client.
* **Backend:** Java 17, Spring Boot 3.2.3, Spring Data JPA, Spring Security, WebSockets, Lombok, JJWT (JWT), MySQL Connector, Stripe Java SDK, Cloudinary SDK.
* **Database:** MySQL.
* **Build Tool:** Maven.

---

## Project Folder Directory

```
TeleHealth Pro/
├── database/
│   └── schema.sql           # Database schema backup definition
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/telehealth/pro/
│   │   │   │   ├── config/      # Database seeders, resource configs, websockets
│   │   │   │   ├── controller/  # REST Controllers (Auth, Patient, Doctor, etc.)
│   │   │   │   ├── dto/         # Request and Response DTO models
│   │   │   │   ├── entity/      # JPA Entity models (User, Patient, Doctor, etc.)
│   │   │   │   ├── repository/  # JPA Query repository interfaces
│   │   │   │   ├── security/    # Security details, Custom User details, JWT filters
│   │   │   │   └── service/     # Stripe, Cloudinary, SMTP email wrappers
│   │   │   └── resources/
│   │   │       └── application.properties # Application properties
│   └── pom.xml                  # Maven dependencies mapping
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI elements (Navbar, Sidebar, Cards, Chat)
│   │   ├── utils/           # Axios interceptors configuration
│   │   ├── store/           # Redux Toolkit auth slice
│   │   ├── pages/           # Public screens, Dashboards, WebRTC rooms
│   │   ├── App.jsx          # Route guards bindings
│   │   ├── index.css        # Tailwind integrations and animations variables
│   │   └── main.jsx         # App mounting
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Coordinates local network containers
└── README.md
```

---

## Local Development Startup

### 1. Database Setup
Ensure you have a local **MySQL** server running, or spin up Docker. Create a database called `telehealth_db`.
Modify the database settings inside the backend `.env` file matching your credentials:
```
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=telehealth_db
DB_PORT=3306
```

### 2. Start the API Server
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Build and compile the project:
   ```bash
   mvn.cmd clean install -DskipTests
   ```
3. Run the Spring Boot application:
   ```bash
   mvn.cmd spring-boot:run
   ```
   *The server runs on port `5000` by default and syncs JPA entities to MySQL tables.*

### 3. Start the React Application
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm modules:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The client application opens on `http://localhost:5173`.*

---

API endpoint validation and context logic tests are built using JUnit and Spring Boot Test:
```bash
cd backend
mvn.cmd test
```
*The testing suite runs standard JUnit integration checks.*

---

## Docker Compose Quickstart

To run the database, server, and client fully dockerized:
1. Ensure Docker Desktop is running.
2. Build and launch all services from the root folder:
   ```bash
   docker-compose up --build
   ```
3. The platform becomes accessible at:
   * **Client Interface:** `http://localhost` (Port 80)
   * **API Gateway:** `http://localhost:5000` (Port 5000)
