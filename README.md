# HealthPoint 🏥

HealthPoint is a comprehensive healthcare management platform designed to bridge the gap between patients and healthcare providers. It provides a seamless experience for booking appointments, managing medical records, and facilitating real-time communication through AI and direct chat.

---

## 🚀 Key Features

### 👤 Patient Portal
- **Smart Appointment Booking**: Easy-to-use interface for finding doctors by specialty and booking slots.
- **Medical History**: Secure access to past appointments, consultation notes, and prescriptions.
- **HealthPoint AI**: A Gemini-powered intelligent chatbot for instant health-related inquiries and assistance.
- **Real-time Chat**: Direct communication channel with healthcare providers.
- **Automated Reminders**: Stay updated with appointment notifications and email reminders.
- **Personal Profiles**: Manage patient profiles and medical records with ease.

### 👨‍⚕️ Doctor Dashboard
- **Dynamic Scheduling**: Manage daily appointments, view patient queues, and update availability in real-time.
- **Consultation Management**: Digital entry for consultation notes and patient progress tracking.
- **Unavailability Control**: Sophisticated logic to mark unavailability dates with automated rescheduling for affected patients.
- **Performance Analytics**: Insightful statistics on patient visits and appointment trends.
- **Unified Messaging**: A integrated chat console to stay in touch with patients.

### 🛡️ Admin Console
- **Centralized Management**: Full control over User accounts, Doctor profiles, and Patient records.
- **Operational Efficiency**: Mass communication tools via email for site-wide updates.
- **Financial Oversight**: Integrated refund processing and transaction history monitoring.
- **Advanced Analytics**: Holistic view of platform growth, demographic statistics, and service distribution.
- **Audit Logs**: Track activities and manage system-wide notifications.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Hooks & Context API
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [Lucide React](https://lucide.dev/)
- **Interactive Graphs**: [Recharts](https://recharts.org/)
- **Real-time**: [Socket.io Client](https://socket.io/)
- **Multi-language**: [i18next](https://www.i18next.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Messaging**: [Socket.io](https://socket.io/) for real-time communication
- **Authentication**: JWT (Access & Refresh Tokens) + Bcrypt
- **Cloud Services**: [Cloudinary](https://cloudinary.com/) (Media Management), [Nodemailer](https://nodemailer.com/) (Email Service)
- **AI**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Generation Tools**: [PDFKit](http://pdfkit.org/) for automated invoices

---

## 📂 Project Structure

```bash
HealthPoint/
├── frontend/               # React + Vite Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # API integration logic
│   │   ├── hooks/          # Custom React hooks
│   │   └── context/        # Global state and contexts
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API endpoint definitions
│   │   ├── services/       # Core business logic
│   │   ├── middlewares/    # Authentication & validation
│   │   ├── sockets/        # Real-time socket handlers
│   │   └── prisma/         # Database schema and migrations
```

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate and get JWT session |
| `POST` | `/api/auth/refresh` | Obtain a new access token using a refresh token |

### 📅 Appointment Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/appointments` | Retrieve global appointments (Admin/Doctor) |
| `GET` | `/api/appointments/user` | Fetch current authenticated user's appointments |
| `POST` | `/api/appointments/:patientId/:doctorId` | Process a new appointment booking |
| `POST` | `/api/appointments/:id/cancel` | Cancel an existing appointment slot |
| `POST` | `/api/appointments/:id/start` | Mark an appointment as 'In Progress' |
| `GET` | `/api/appointments/:id/invoice` | Generate and download a PDF invoice |

### ⚕️ Clinical & Physician API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/doctors/:page/:size` | Fetch doctors with pagination and filters |
| `GET` | `/api/doctors/:id` | Detailed physician profile retrieval |
| `GET` | `/api/departments` | Listing of all medical departments |
| `POST` | `/api/doctors/mark-unavailable` | Mark absence and trigger auto-rescheduling |
| `GET` | `/api/symptoms` | Directory of common health symptoms |

### 💬 Communication & Intelligence
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat/gemini` | Submit queries to the HealthPoint AI assistant |
| `GET` | `/api/chat/conversation/:id` | Fetch message history between two parties |
| `GET` | `/api/notifications` | Sync user notifications |

### 📈 Administrative & Oversight
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics` | High-level system performance metrics (Admin only) |
| `POST` | `/api/admin/mass-email` | Deploy bulk informational emails |
| `GET` | `/api/admin/refund-requests` | View and manage pending payment refunds |
| `DELETE` | `/api/admin/users/:id` | Secure account termination and cleanup |

---

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL (ensure your connection string is ready)
- Cloudinary Account (for media uploads)
- Google AI Studio API Key (for Gemini integration)

### Backend Setup
```bash
cd backend
npm install
# Configure your .env file (see .env.example)
npx prisma db push
npx prisma db seed # Populate initial departments/roles
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
# Set VITE_API_BASE_URL to your backend's local address
npm run dev
```

---

## 📄 License
This project is licensed under the **ISC License**. Built with care for a healthier tomorrow.
