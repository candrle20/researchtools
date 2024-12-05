# RAVA Protocol

A OLAW Protocol management system for University appointed 

## Features

- User Authentication with JWT tokens
- Role-based access (Admin/Researcher)
- Laboratory Management
- Protocol Management
- School Management
- User Management
- Search Functionality

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm 6+
- PostgreSQL (future use- currently using SQLite for development)

## Backend Setup

1. Create and activate virtual environment:

```bash
python -m v
```

2. Install dependencies:

bash
pip install -r requirements.txt

3. Create `.env` file in backend

DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

4. Run migrations:
bash
cd backend
python manage.py migrate

5. Create superuser:
bash python manage.py createsuperuser

6. Start development server:
bash python manage.py runserver



## Frontend Setup

1. Install dependencies:
cd frontend
npm install

2. Start development server:
bash
npm start

## Project Structure

rava_protocol/
├── backend/
│ ├── core/ # Django settings
│ ├── search/ # protocol db/ search
│ ├── users/ # User management
│ └── manage.py
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── layout/ # Layout components
│ │ │ └── pages/ # Page components
│ │ ├── context/ # React context
│ │ ├── utils/ # Utility functions
│ │ └── App.js
│ └── package.json
├── requirements.txt
└── README.md

