# Shift Logger API

Welcome to the **Shift Logger API** project! This API is designed to manage users, plants, and steam generation records in an industrial setting. It provides authentication and authorization mechanisms, role-based access control, and comprehensive data management features.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Modules Overview](#modules-overview)
  - [User Module](#user-module)
  - [Plant Module](#plant-module)
  - [Steam Generation Record Module](#steam-generation-record-module)
- [Authentication and Authorization](#authentication-and-authorization)
- [Error Handling](#error-handling)
---

## Project Overview

The Shift Logger API is a backend application built with NestJS that manages:

- **Users**: Admins and Staff with role-based access control.
- **Plants**: Information about different plants.
- **Steam Generation Records**: Logs of steam generation data associated with plants and users.

The API uses JWT authentication, and all endpoints are secured to ensure that only authorized users can access them.

---

## Features

- **User Management**: Register, authenticate, and manage users with different roles (Admin, Staff).
- **Plant Management**: Create, update, delete, and retrieve plant information.
- **Steam Generation Records**: Log and manage steam generation data linked to specific plants and users.
- **Authentication and Authorization**: Secure the API using JWT tokens, with role-based access control.
- **Data Validation**: Ensure data integrity using DTOs and validation pipes.
- **Error Handling**: Consistent and informative error responses.

---

## Technology Stack

- **Node.js**: JavaScript runtime environment.
- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **TypeORM**: An ORM that supports Active Record and Data Mapper patterns.
- **MySQL**: Relational database management system.
- **Passport.js**: Authentication middleware for Node.js.
- **JWT (JSON Web Tokens)**: For securing API endpoints.

---

## Installation

### Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (Node Package Manager)
- **MySQL** database (MySQL2 preferred for authentication module support)

### Steps

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd shift-logger-api
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

---

## Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory of the project with the following content:

```dotenv
# .env

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
DATABASE_NAME=nest_app_db

# JWT Secret
JWT_SECRET=your_jwt_secret
```

---

## Database Setup

Ensure you have MySQL installed and running on your local machine.

1. **Create the Database**

   - Log into MySQL:

     ```bash
     mysql -u root -p
     ```

   - Create a new database:

     ```sql
     CREATE DATABASE nest_app_db;
     ```

   - Create a new user and grant privileges:

     ```sql
     CREATE USER 'your_database_user'@'localhost' IDENTIFIED BY 'your_database_password';
     GRANT ALL PRIVILEGES ON nest_app_db.* TO 'your_database_user'@'localhost';
     FLUSH PRIVILEGES;
     ```


2. **Run Database Migrations (If Applicable)**

   If you're using TypeORM migrations, run:

   ```bash
   npm run typeorm migration:run
   ```

---

## Running the Application

Start the NestJS application in dev environment using the following command:

```bash
npm run start:dev
```

The API should now be running at `http://localhost:3000` (or the port specified in your configuration).

---

## Project Structure

The project follows a modular structure provided by NestJS. Key directories and their purposes are:

- **src/**: The main source code directory.
  - **user/**: Contains the User module, which manages user-related functionality.
  - **plant/**: Contains the Plant module for managing plant information.
  - **steam-generation-record/**: Contains the Steam Generation Record module for managing steam generation data.
  - **auth/** (if separate): Contains authentication strategies and guards.
- **config/**: Configuration files.
- **.env**: Environment variables file.

---

## Modules Overview

### User Module

- **Purpose**: Manages user registration, authentication, and role-based access control.
- **Entities**:
  - **User**: Represents a user with common properties and a role (Admin or Staff).
  - **Admin**: Contains admin-specific properties.
  - **Staff**: Contains staff-specific properties.
- **Features**:
  - **Authentication**: Uses JWT strategy for authentication.
  - **Authorization**: Implements role-based guards to restrict access to certain endpoints.
- **Relationships**:
  - **One-to-One**: Between `User` and `Admin`/`Staff` entities.
  - **Many-to-Many**: Users can be associated with multiple plants.

### Plant Module

- **Purpose**: Manages plant information and associates plants with users.
- **Entities**:
  - **Plant**: Represents a plant with details like name, address, contact person.
- **Features**:
  - **Plant Management**: Create, update, delete, and retrieve plant information.
  - **User Association**: Assign users to plants.
- **Relationships**:
  - **Many-to-Many**: Plants can be associated with multiple users, and users can be associated with multiple plants.

### Steam Generation Record Module

- **Purpose**: Manages logging of steam generation data associated with plants and users.
- **Entities**:
  - **SteamGenerationRecord**: Represents a record of steam generation data.
- **Features**:
  - **Data Logging**: Create and manage steam generation records.
  - **Associations**: Records are linked to the plant where data was collected and the user who created or updated the record.
- **Relationships**:
  - **Many-to-One**: Each record is associated with one plant.
  - **Many-to-One**: Each record is associated with the user who created or updated it.

---

## Authentication and Authorization

- **Authentication**:
  - Implemented using **JWT** (JSON Web Tokens).
  - Users must log in to receive a token, which must be included in the `Authorization` header for subsequent requests.
- **Authorization**:
  - Role-based access control is enforced using custom guards.
  - Certain endpoints are restricted to users with specific roles (e.g., Admin).

---

## Error Handling

The API uses NestJS's built-in exception filters to provide consistent error responses. Common errors include:

- **Validation Errors**: Occur when input data does not meet the validation criteria.
- **Authentication Errors**: Occur when a user provides invalid credentials or lacks a valid JWT token.
- **Authorization Errors**: Occur when a user tries to access a resource they do not have permission for.
- **Not Found Errors**: Occur when a requested resource does not exist.


