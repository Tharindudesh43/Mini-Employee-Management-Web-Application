# PeopleDesk – Employee Management Dashboard

A responsive web application to view, search, add, edit and delete employees. Log in, see the Total / Active / Inactive counts, and manage the employee table. Built for the InTalent Asia Web Development Intern technical assessment.

## Features

- Login with a session that ends after a period of inactivity, and a **confirmation pop-up** before logging out
- Dashboard counts: Total, Active and Inactive employees
- Employee table (Employee ID, Name, Email, Department, Status) with **search by name or email**, status filter and **pagination**
- Add / edit employee form with validation (required fields, valid email, optional phone number, duplicate email check)
- Delete with a confirmation message
- Dashboard counts and table update after every change
- Loading indicator and friendly error messages
- Responsive layout for desktop, tablet and mobile, with a professional navigation bar
- Floating **back-to-top** button

## Technologies used

| Part | Technology | Purpose |
| --- | --- | --- |
| Frontend | HTML5, CSS3, JavaScript (ES modules) | Page structure, responsive styling (Flexbox, Grid, no framework) and the app logic, split into small reusable modules |
| Backend | Node.js, Express | REST API for employees and login, and serves the pages |
| Database | MySQL / MariaDB (`mysql2`) | Stores employees, login accounts and sessions, using parameterised queries |
| Security | `bcryptjs`, `express-session`, `helmet`, `express-rate-limit` | Password hashing, server-side sessions with an idle timeout, secure headers, login attempt limit |
| Validation | Custom (browser and server) | Required fields, email, phone number and duplicate email checks |
| Logging | `winston`, `morgan` | Request, login and employee-change logs |
| Configuration | `dotenv` | Keeps database settings and secrets out of the code |
| Tools | npm, Git / GitHub | Packages, scripts and version control |

## Project structure

```
employee-dashboard/
├── database/schema.sql          Table definitions
├── public/                      Frontend
│   ├── index.html, login.html
│   ├── css/styles.css
│   └── js/                      api, store, render, validation, employee-form,
│                                delete-dialog, logout-dialog, navigation,
│                                back-to-top, utils, login, main
├── server/                      Backend
│   ├── app.js, index.js         App setup and startup
│   ├── config.js, db.js, logger.js, constants.js
│   ├── middleware/              auth, session, error handler
│   ├── routes/                  auth, employees, meta
│   ├── models/employeeModel.js  Database queries
│   ├── validators/              Server-side validation
│   └── scripts/setup-db.js      Creates the database, tables and sample data
├── logs/                        Log files are written here
├── screenshots/                 Screenshots of the application
├── .env.example                 Settings template
└── package.json
```

## Screenshots

See the `screenshots/` folder: login, dashboard on desktop / tablet / mobile, search, add form validation and delete confirmation.

---

# How to Run

## 1. Requirements

- **Node.js 18 or newer** – https://nodejs.org (check with `node -v`)
- **MySQL 8 or MariaDB 10.5+** – installed and running. (If you use **XAMPP**, open the XAMPP Control Panel and start **MySQL**.)

## 2. Install the packages

Open a terminal in the project folder (`employee-dashboard`) and run:

```
npm install
```

## 3. Create the settings file

Copy `.env.example` to `.env`:

```
# macOS / Linux
cp .env.example .env

# Windows
copy .env.example .env
```

Open `.env` and set:

| Setting | What to put |
| --- | --- |
| `DB_USER` | Your MySQL username (for example `root`) |
| `DB_PASSWORD` | Your MySQL password. Leave it empty if you use XAMPP's default `root` user |
| `SESSION_SECRET` | Any long random text. Generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_PASSWORD` | The password you will use to log in (at least 8 characters) |

The other settings can stay as they are (`DB_HOST`, `DB_PORT=3306`, `DB_NAME=peopledesk`, `ADMIN_USERNAME=admin`, `PORT=3000`, `SESSION_TIMEOUT_MINUTES=15`). `DB_SSL` and `DB_POOL_LIMIT` are only needed for an online database and can be ignored locally.

## 4. Create the database

```
npm run db:setup
```

This creates the database and tables, the login account from `.env`, and 27 sample employees. It is safe to run again; existing data is not overwritten.

If you already ran this command with an older version of the project, run it again: it adds the new `phone` column to your existing `employees` table.

If your MySQL user is not allowed to create databases, run this once as an administrator, then use that user in `.env`:

```sql
CREATE DATABASE peopledesk CHARACTER SET utf8mb4;
CREATE USER 'peopledesk'@'localhost' IDENTIFIED BY 'choose_a_password';
GRANT ALL PRIVILEGES ON peopledesk.* TO 'peopledesk'@'localhost';
```

## 5. Start the app

```
npm start
```

Open **http://localhost:3000** and log in with `ADMIN_USERNAME` and `ADMIN_PASSWORD` from your `.env` file.

To stop the app, press `Ctrl + C` in the terminal.

---

## How login and sessions work

- Passwords are stored as bcrypt hashes, never as plain text.
- After login, the server keeps the session in the MySQL `sessions` table. The browser only holds a random session ID in an `HttpOnly` cookie.
- The timeout is based on inactivity: after `SESSION_TIMEOUT_MINUTES` (15 by default) without activity, the next action returns the user to the login page.
- Login is limited to a small number of attempts per 15 minutes.

## Validation rules

| Field | Rule |
| --- | --- |
| Name | Required, 2–100 characters |
| Email | Required, valid format, must be unique |
| Phone | Optional. Digits, spaces, hyphens, brackets and a leading `+` only; 7–15 digits; up to 20 characters |
| Department | Required, chosen from the list |

Every rule is checked in the browser for instant feedback and checked again on the server.

## API summary

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Current user |
| GET | `/api/employees` | One page of employees (supports page, page size, search and status filter) plus dashboard counts |
| POST | `/api/employees` | Add an employee |
| PUT | `/api/employees/:id` | Edit an employee |
| DELETE | `/api/employees/:id` | Delete an employee |

All `/api/employees` routes require a logged-in session.

## Logs

Log files are written to the `logs/` folder and shown in the terminal. They record requests, successful and failed logins, and every employee add, edit and delete.

## Troubleshooting

| Message or problem | Fix |
| --- | --- |
| "Missing settings in .env" | Create the `.env` file (step 3). |
| "Cannot connect to MySQL" | Start MySQL (in XAMPP, click Start next to MySQL), and check the `DB_*` values in `.env`. |
| "Access denied for user" | `DB_USER` or `DB_PASSWORD` is wrong. For XAMPP, leave `DB_PASSWORD` empty. |
| "Cannot find module" | Run `npm install` in the project folder. |
| "Port already in use" | Change `PORT` in `.env`, then restart. |
| "Too many login attempts" | Wait 15 minutes, or restart the app. |
| Forgot the admin password | Delete the row in the `users` table, set a new `ADMIN_PASSWORD` in `.env`, and run `npm run db:setup` again. |