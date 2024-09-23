# Enhanced Food Label Compliance and Safety Monitoring System

## Overview

The **Enhanced Food Label Compliance and Safety Monitoring System** is a Next.js web application designed for NTUC FairPrice. It automates the scanning and verification of food labels to ensure compliance with Singapore regulations. By utilizing OCR and AI, it enhances label verification efficiency and accuracy. The system includes role-based access control, real-time notifications, and integrates with OpenAI and Nodemailer for advanced functionality.

## Features

- **Automated Label Scanning**
  - Extracts text from product labels using OCR technology to streamline the verification process.

- **Compliance Checking**
  - Assesses Halal and Healthy statuses with advanced Machine Learning models to ensure regulatory adherence.

- **User Authentication**
  - Secure login system utilizing JWT-based authentication and OTP verification for enhanced security.

- **Role-Based Access Control**
  - Different functionalities and permissions for Admins, Managers, and Staff to maintain organized workflows.

- **Company Management**
  - Create, update, archive/unarchive companies.
  - Assign staff and managers to specific companies.
  - View detailed information and associated images for each company.

- **Image Management**
  - Upload, view, and manage food label images efficiently.
  - Extract and analyze text from images using OCR (Tesseract.js).
  - Utilize AI (OpenAI's GPT-4) to analyze food safety and compliance.
  - Approve or reject images based on AI-driven compliance results.

- **Notifications**
  - Receive real-time alerts for role changes, company assignments, and image approvals/rejections to stay updated on important actions.

- **Search Functionality**
  - Easily search and filter companies and users to quickly find relevant information.

- **Data Export**
  - Export user, company, and image data to Excel files for reporting and analysis purposes.

- **Responsive UI**
  - Intuitive and user-friendly interface built with Tailwind CSS, ensuring accessibility across various devices.

## Technology Stack

- **Frontend**
    - [Next.js](https://nextjs.org/)
    - [React](https://reactjs.org/)
    - [Tailwind CSS](https://tailwindcss.com/)
    - [shadcn/ui](https://shadcn.com/)

- **Backend**
    - [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
    - [Prisma ORM](https://www.prisma.io/)

- **Services**
    - [OpenAI](https://openai.com/) for AI-driven analysis
    - [Nodemailer](https://nodemailer.com/about/) for email services

- **Others**
    - [Tesseract.js](https://github.com/naptha/tesseract.js) for OCR
    - [Sonner](https://github.com/emilkowalski/sonner) for toast notifications
    - [Lucide React](https://lucide.dev/docs/lucide-react) for icons


## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **[Node.js](https://nodejs.org/)** (v18.x or later)
- **[Next.js](https://nextjs.org/)**
- **[pnpm](https://pnpm.io/)** (v7.x or later)
- **[Visual Studio Code](https://code.visualstudio.com/)** or any preferred code editor

### Installation

1. **Clone the Repository**
    - `
    git clone https://github.com/iamsven2005/FYP.git
    `

2. **Install Dependencies**
    - `
    pnpm install
    `

3. **Configure Environment Variables**

    - Rename .env.example to .env and fill in the required values.
    - Ensure all necessary environment variables are set, including:
        ```        
        - DATABASE_URL: Prisma database connection string.
        - JWT_SECRET: Secret key for JWT signing.
        - OPENAI_API_KEY: API key for OpenAI services.
        - EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD: Credentials for Nodemailer.
        - EMAIL_FROM: The sender email address for outgoing emails.
        ```

4. **Run Database Migrations and Seed Data**
    - `pnpm gen`: Generates the Prisma client.
    - `pnpm push`: Applies database migrations.
    - `pnpm seed`: Seeds the database with initial data.
        - Bypassed OTP Accounts for each role:
            ```
            - Admin: admin@ntuc.com, admin123
            - Manager: manager@ntuc.com, manager123
            - Staff: staff@ntuc.com, staff123
            ```

5. **Start Prisma Studio**

    Access Prisma Studio for database management and inspection.
    
    - `pnpm stu`

    Open http://localhost:5555 in your browser to access Prisma Studio.

6. **Start the Development Server**
    
    - `pnpm dev`
    
    This will start the Next.js development server on http://localhost:3000.

7. **Access the Application**

    Open http://localhost:3000 in your browser to use the application.

## Usage

### Authentication

 - Register a new user (default role staff) via the /api/register endpoint.
 - Login using the /api/login endpoint.
    - Default Roles (Admin, Manager, Staff, Client) bypass OTP verification.
    - Other Users receive an OTP via email for enhanced security.
 - Reset Password through the /api/forgot-password and /api/reset-password endpoints.

## User Roles and Usage

The system supports three main user roles: Admin, Manager, and Staff. Each role has specific functionalities tailored to their responsibilities.

### Admin

## Responsibilities:
 - **User Management:** Create, update, and delete user accounts (Admins, Managers, Staff).
 - **Company Management:** Create, edit, archive, and manage companies along with their assigned staff and managers.
 - **System Oversight:** Configure system settings and manage compliance workflows.

## Key Features:
 - **User Management Interface:**
    - View all users.
    - Assign roles to users.
    - Delete users with confirmation prompts.
    ``` bash
    // Example: Assigning a role to a user
    const handleRoleChange = (userId: string, newRole: string) => {
      setSelectedRoles((prevRoles) => ({ ...prevRoles, [userId]: newRole }));
      assignRole(userId, newRole);
    };
      ```
 - **Company Management Interface:**
   - Create new companies by providing necessary details like name, image, staff, and manager.
   - Edit existing companies through a dialog interface.
   - Archive or unarchive companies as needed.
    ``` bash
    // Example: Toggling company archive status
    const toggleArchiveCompany = async (companyId: string, archived: boolean) => {
        // Update company archive status
    };
    ```

## Usage:

 1. **Accessing Admin Dashboard:**
    - Log in using your admin credentials.
    - Navigate to the Admin Dashboard to manage users and companies.

 2. **Managing Users:**
    - Use the User Management section to add or remove users.
    - Assign appropriate roles to ensure users have the necessary permissions.

 3. **Managing Companies:**
    - Use the Company Management section to create or edit companies.
    - Assign staff and managers to each company to streamline operations.

### Manager

## Responsibilities:
 - **Compliance Oversight:** Monitor compliance processes and ensure adherence to regulations.
 - **Reporting:** Generate and review detailed reports on compliance statuses.
 - **User Support:** Assist Staff in resolving compliance-related queries.

## Key Features:
 - **Compliance Reports:**
    - View and analyze compliance data.
    - Generate reports to track compliance trends and issues.
  
 - **Notification Management:**
   - Receive alerts about new uploads and compliance issues.
   - Address and resolve compliance-related notifications.

## Usage:

 1. **Accessing Manager Dashboard:**
    - Log in using your manager credentials.
    - Navigate to the Manager Dashboard to oversee compliance activities.

 2. **Monitoring Compliance:**
    - Use the reporting tools to keep track of compliance statuses.
    - Address any compliance issues flagged by the system.

 3. **Managing Companies:**
    - Use the Company Management section to create or edit companies.
    - Assign staff and managers to each company to streamline operations.

### Staff

## Responsibilities:
 - **Label Management:** Upload product labels/artwork submitted by stakeholders.
 - **Compliance Verification:** Conduct compliance checks using predefined checklists.
 - **Approval/Rejection:** Approve or reject ingredients based on compliance results.
 - **Risk Advisory:** Provide guidance and risk assessments to stakeholders regarding compliance issues.

## Key Features:
 - **Image Upload and Management:**
    - Easily upload product label images for compliance verification.
    - View and manage uploaded images through the dashboard.
    
      ``` bash
      // Example: Handling image upload
      const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setCompanyImgUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      ```

 - **Compliance Checks:**
   - Use integrated OCR and Machine Learning tool, OpenAI API to verify label information.
   - Approve or reject ingredients as per compliance guidelines.

 -  **Workflow Management:**
   - Route approval or rejection tasks to appropriate parties.
   - Track the status of compliance tasks through the dashboard.

## Usage:

 1. **Accessing Staff Dashboard:**
     - Log in using your staff credentials.
     - Navigate to the Staff Dashboard to manage label uploads and compliance checks.

 2. **Uploading Labels:**
     - Use the Image Management section to upload new product labels.
     - Ensure all necessary fields are filled out before submission.

 3. **Conducting Compliance Checks:**
    - Review the extracted text and compliance results for each uploaded label.
    - Approve or reject ingredients based on the compliance analysis.

### License

This project is licensed under the MIT License.