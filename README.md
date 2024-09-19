# Enhanced Food Label Compliance and Safety Monitoring System

## Overview

The **Enhanced Food Label Compliance and Safety Monitoring System** is a comprehensive web application built with Next.js. It facilitates the management of users, companies, and food label images, ensuring compliance and safety through advanced OCR and AI-driven analysis. The system incorporates robust authentication, role-based access control, real-time notifications, and seamless integrations with OpenAI and Nodemailer.

## Features

- **User Authentication**
  - Secure registration and login with JWT and OTP verification.
  - Role-based access control (Admin, Manager, Staff, Client).

- **Company Management**
  - Create, update, archive/unarchive companies.
  - Assign staff and managers to companies.
  - View detailed company information and associated images.

- **Image Handling**
  - Upload and manage food label images.
  - Extract text from images using OCR (Tesseract.js).
  - Analyze food safety and compliance with OpenAI's GPT-4.
  - Approve or reject images based on AI analysis.

- **Notifications**
  - Real-time notifications for role changes, company assignments, and image approvals/rejections.

- **Data Export**
  - Export user, company, and image data to Excel for reporting and analysis.

## Technology Stack

- **Frontend**
  - [Next.js](https://nextjs.org/)
  - React
  - Tailwind CSS
  - [shadcn/ui](https://shadcn.com/)
  
- **Backend**
  - Next.js API Routes
  - Prisma ORM
  
- **Services**
  - [OpenAI](https://openai.com/) for AI-driven analysis
  - [Nodemailer](https://nodemailer.com/) for email services
  
- **Others**
  - [Tesseract.js](https://github.com/naptha/tesseract.js) for OCR
  - [Sonner](https://github.com/sonner-ui/sonner) for toast notifications
  - [Lucide React](https://lucide.dev/) for icons

## Setup Guide

### Prerequisites

- **Node.js** (v14 or later)
- **pnpm** package manager

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/iamsven2005/FYP.git
   cd your-repo
    ```

2. **Install Dependencies**
    
    ```bash
    pnpm install
    ```
3. **Configure Environment Variables**

    - Rename .env.example to .env and fill in the required values.
    - Ensure all necessary environment variables are set, including:
        - DATABASE_URL: Your Prisma database connection string.
        - JWT_SECRET: Secret key for JWT signing.
        - OPENAI_API_KEY: API key for OpenAI services.
        - EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD: Credentials for Nodemailer.
        - EMAIL_FROM: The sender email address for outgoing emails.

4. **Run Database Migrations and Seed Data**

    ```bash
    pnpm gen
    pnpm push
    pnpm seed
    ```

    - pnpm gen: Generates the Prisma client.
    - pnpm push: Applies database migrations.
    - pnpm seed: Seeds the database with initial data.

5. **Start Prisma Studio**

    Access Prisma Studio for database management and inspection.
    ```
    pnpm stu
    ```

    Open http://localhost:5555 in your browser to access Prisma Studio.

6. **Start the Development Server**
    ```
    pnpm dev
    ```
    This will start the Next.js development server on http://localhost:3000.

7. **Access the Application**

    Open http://localhost:3000 in your browser to use the application.

## Usage

### Authentication

 - Register a new user via the /api/register endpoint.
 - Login using the /api/login endpoint.
    - Default Roles (Admin, Manager, Staff, Client) bypass OTP verification.
    - Other Users receive an OTP via email for enhanced security.
 - Reset Password through the /api/forgot-password and /api/reset-password endpoints.

### Admin Dashboard
 - **User Management:** View, assign roles, and delete users.
 - **Company Management:** Create, update, archive/unarchive companies, and assign staff and managers.
 - **Image Management:** Upload images, view details, and approve/reject based on compliance.

### API Endpoints

For detailed API documentation, refer to the API Documentation section in the Wiki.

## Detailed Sections

### 1. Project Overview

Provides a high-level introduction, objectives, key features, and technology stack used in the project.

### 2. Setup Guide

Detailed instructions on how to set up the project locally, including cloning the repository, installing dependencies, configuring environment variables, running database migrations, seeding data, starting Prisma Studio, and running the development server.

### 3. Database Schema

 - **Prisma Models:** Detailed explanation of each model in prisma/schema.prisma.
 - **Relationships:** Describe relationships between models (e.g., User ↔ Company).
 - **Seeding Data:** Instructions on using prisma/seed.ts to seed the database with initial data.

### 4. Authentication

 - **JWT Implementation:** Explain how JWTs are created and verified (lib/session.ts).
 - **OTP Verification:** Describe the OTP flow for enhanced security (app/api/login/route.ts, app/api/forgot-password/route.ts, app/api/reset-password/route.ts).
 - **User Roles and Permissions:** Detail different roles (Admin, Manager, Staff, Client) and their permissions.
 - **Session Management:** How sessions are handled and terminated (app/api/session/route.ts).

### 5. Components Documentation

For each React component, include:

 - **Purpose:** What the component does.
 - **Props and State:** Detailed explanation of props and state variables.
 - **Usage:** How and where the component is used within the app.

**Components to Document:**

 - UserManagement.tsx
 - CompanyManagement.tsx
 - EditCompanyDialog.tsx
 - IngredientList.tsx
 - Navbar.tsx
 - Others ui as needed.

### 6. API Documentation

Organize APIs by functionality with details on endpoints, parameters, and responses.

**Structure for Each Endpoint:**

 - Endpoint URL & Method
    - Example: POST /api/login
 - Description
    - What the endpoint does.
 - Request Parameters
    - Headers: Authentication tokens, content types.
    - Body: Required and optional fields with data types.
 - Response
    - Success: Status codes and response body examples.
    - Errors: Possible error messages and status codes.
 - Example Requests and Responses
    - cURL commands or JSON examples.

**Categories:**

 - Users Endpoints
    - GET /api/users
    - PATCH /api/users/[userId]
    - DELETE /api/users/[userId]
 - Authentication
    - POST /api/login
    - POST /api/register
    - POST /api/forgot-password
    - POST /api/reset-password
    - DELETE /api/session
 - Companies Endpoints
    - POST /api/companies
    - GET /api/companies
    - PATCH /api/companies/[id]
    - GET /api/companies/[id]
 - Image Handling
    - POST /api/saveImage
    - GET /api/items
    - PATCH /api/items/[id]/approve
    - PATCH /api/items/[id]/reject
    - GET /api/items/[id]/name
    - GET & POST /api/items/[id]/notify
    - POST /api/items/[id]/notes
 - Roles Management
    - POST /api/roles
    - OpenAI Integration
    - POST /api/openaiCheck
    - PATCH /api/openaiCheck
 - OCR Processing
    - POST /api/ocr

### 7. Utilities

 - **Utility Functions:** Describe utility functions in lib/utils.ts and others.
 - **Database Initialization:** Explain how the database is initialized (lib/db.ts).
 - **Helpers:** Any helper functions or modules used across the project.

### 8. Ingredient Compliance

 - **Data Structures:** Explain how ingredients and their statuses are managed.
 - **Compliance Logic:** Detail the logic for checking ingredient compliance using OpenAI and OCR results.
 - **Approved vs. Not Safe Ingredients:** Criteria and handling.

### 9. Styling and Theming

 - **CSS Framework:** Explain the use of Tailwind CSS and integration with shadcn/ui.
 - **Theming:** How themes are managed using next-themes.
 - **Component Styling:** Best practices for styling components.

### 10. Security Best Practices

 - **Protecting Sensitive Data:** Guidelines on managing .env files and secrets.
 - **JWT Security:** Token expiration, storage, and rotation strategies.
 - **Input Validation:** How inputs are validated across the app.
 - **Error Handling:** Secure error messages to avoid leaking sensitive information.
 - **Rotating Exposed Secrets:** Steps to rotate keys and secrets if compromised.

### 11. Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

### 12. Security

 - Sensitive Data Protection: Ensure .env is added to .gitignore to prevent exposing sensitive information.
 - JWT Security: Tokens have an expiration time and are securely managed.
 - Input Validation: All inputs are validated to prevent security vulnerabilities.
 
For detailed security practices, visit the Security Best Practices section in the Wiki.

### 13. License
This project is licensed under the MIT License.

### 14. Contact
For any inquiries or support, please contact NTUC Support.

