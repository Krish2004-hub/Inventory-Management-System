# Inventory Management System

A full-stack web application for managing products, tracking inventory, and monitoring stock levels through an interactive dashboard.

## Features

- Add, view, update, and delete products (CRUD).
- Search products.
- Filter products by stock status.
- Dashboard with inventory summary cards.
- Stock distribution and category-wise analytics.
- Low-stock alerts.
- Backend validation and centralized exception handling.

## Technologies Used

**Backend**
- Java 21
- Spring Boot
- Spring Data JPA
- Hibernate
- MySQL
- Maven

**Frontend**
- React 19
- Vite
- JavaScript
- HTML5
- CSS3

## Project Structure

```text
Inventory-Management-Project/
├── backend/
├── frontend/
├── .gitignore
└── README.md
```

## Prerequisites

- Java 21
- MySQL Server
- Node.js and npm
- Git

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Krish2004-hub/Inventory-Management-System.git
cd Inventory-Management-System
```

### 2. Create the database

```sql
CREATE DATABASE inventory_management;
```

Configure these environment variables for the backend:

- `DB_URL` — MySQL connection URL (default: `jdbc:mysql://localhost:3306/inventory_management`)
- `DB_USERNAME` — MySQL username (default: `root`)
- `DB_PASSWORD` — MySQL password

### 3. Start the backend

Open a terminal:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend API:

`http://localhost:8080/api/products`

### 4. Start the frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL displayed in the terminal, usually:

`http://localhost:5173`

## API Endpoints

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Retrieve all products |
| POST | `/api/products` | Add a product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |

## Future Enhancements

- User authentication and authorization
- Role-based access control
- Inventory report generation
- Cloud deployment

## Author

**Kishore**

GitHub: [Krish2004-hub](https://github.com/Krish2004-hub)