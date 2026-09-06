# Weekly Report Generator

A full-stack web application for creating, submitting, reviewing, and tracking weekly team reports.

Team members can record tasks, achievements, blockers, working hours, and plans for the following week. Managers can review team reports, request corrections, approve submissions, manage projects, and monitor team progress.



## Technology Stack

- **Frontend:** React 18, React Router, Vite
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas (hosted MongoDB)
- **Authentication:** JWT and bcryptjs
- **Development proxy:** Vite forwards `/api` requests to the backend

## Project Structure

```text
backend/             Express API, controllers, models, routes, and auth middleware
frontend/            React application and Vite configuration
demo-data-seeder/    Optional script for creating demo users, projects, and reports
```

## Requirements

- Node.js 18 or later
- npm
- Access to the hosted MongoDB Atlas database

## Installation

Install dependencies in each application directory:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../demo-data-seeder
npm install
```

## Configuration

Create a `.env` file in `backend/` with the hosted database connection details:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace-with-a-long-random-secret
```

The backend uses port `5000` by default. Replace the MongoDB Atlas placeholders with the connection string from your hosted database provider. Keep database credentials and `JWT_SECRET` in `.env` files only; never commit them to Git.

NOTE : For this i did not include .env inside gitignore file.therefor databse uri,port no and other needed info are inside the .env

## Running the Application

Start the backend in one terminal:

```bash
cd backend
npm start
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The application is available at `http://localhost:3000`. The API runs at `http://localhost:5000`.

Check the backend status at:

```text
http://localhost:5000/api/health
```

## Demo Data

With the hosted MongoDB Atlas database configured, use the seeder to create sample users, projects, and reports:

```bash
cd demo-data-seeder
npm run seed
```

To clear and recreate the demo data:

```bash
npm run seed:reset
```

The seeder uses the same `MONGODB_URI` environment variable as the backend. Create a `.env` file in `demo-data-seeder/` as well if the seeder is run from its own directory.

## Main Features

### Team Member Workflow

- Register and sign in
- Create and edit weekly reports
- Track tasks, achievements, blockers, and hours
- Submit reports for manager review
- Read correction comments
- View previous report versions

### Manager Workflow

- View team reports and statistics
- Filter reports by status, project, or team member
- Approve reports
- Request corrections with feedback
- Create, update, and archive projects

## API Overview

Authentication endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Report endpoints:

- `POST /api/reports`
- `GET /api/reports/my`
- `GET /api/reports/team`
- `GET /api/reports/:id`
- `PUT /api/reports/:id`
- `POST /api/reports/:id/submit`
- `PATCH /api/reports/:id/review`

Project endpoints:

- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

Project and report routes require a JWT bearer token. Manager-only operations are checked in the backend controllers.

## Report Status Flow

```text
DRAFT -> SUBMITTED -> APPROVED
				  \-> NEEDS_CORRECTION -> SUBMITTED
```

When a report is updated, its previous state is stored in the report's version history.

## Production Considerations

- Use a strong secret stored outside the repository.
- Keep the MongoDB Atlas connection string in environment variables.
- Add automated tests for authentication, permissions, ownership, and status transitions.
- Add pagination and indexes as the number of reports grows.


NOTE: VS CODE COPILOT WAS USED TO CREATE THIS README FILE