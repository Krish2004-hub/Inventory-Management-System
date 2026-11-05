# Inventory Management System

A full-stack Inventory Management System built to manage products, monitor stock levels, and visualize inventory information through an interactive dashboard.

## Features

- **Product Management:** Add, view, update, and delete products.
- **Search:** Search products easily.
- **Stock Filtering:** Filter products based on stock status.
- **Dashboard:** View inventory summary cards and stock information.
- **Analytics:** Visualize stock distribution and category-wise inventory.
- **Low Stock Alerts:** Identify products that need restocking.
- **Backend Validation:** Validate incoming product data.
- **Exception Handling:** Handle API errors with structured error responses.

## Tech Stack

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Hibernate
- MySQL
- Maven

### Frontend
- React 19
- Vite
- JavaScript
- HTML5
- CSS3

## Project Structure

```text
Inventory-Management-Project/
│
├── backend/
│   └── Spring Boot application
│
├── frontend/
│   └── React application
│
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the application:

- Java 21
- MySQL Server
- Node.js and npm
- Git

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/Krish2004-hub/Inventory-Management-System.git
cd Inventory-Management-System
```

### 2. Configure the database

Create the MySQL database:

```sql
CREATE DATABASE inventory_management;
```

Configure the database credentials using environment variables:

- `DB_URL` — MySQL connection URL (defaults to `jdbc:mysql://localhost:3306/inventory_management`)
- `DB_USERNAME` — MySQL username (defaults to `root`)
- `DB_PASSWORD` — MySQL password

Do not commit database passwords or other credentials to GitHub.

### 3. Run the backend

Open a terminal:

```bash
cd backend
```

On Windows, run:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend API:

`http://localhost:8080/api/products`

### 4. Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## API Endpoint

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products` | Retrieve products |
| POST | `/api/products` | Add a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |

## Future Enhancements

- User authentication and authorization
- Role-based access control
- Advanced reporting
- Export inventory reports
- Cloud deployment

## Author

**Kishore**

GitHub: https://github.com/Krish2004-hub
