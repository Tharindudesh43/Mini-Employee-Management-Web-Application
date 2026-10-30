# PeopleDesk – Employee Management Dashboard

A responsive web application to view, search, add, edit and delete employees. Log in, see the Total / Active / Inactive counts, and manage the employee table.

## Features

- Login with a session, and a **confirmation pop-up** before logging out
- Dashboard counts: Total, Active and Inactive employees
- Employee table (Employee ID, Name, Email, Department, Status) with search by name or email, status filter and pagination
- Add / edit employee form with validation (required fields, valid email, optional phone number, duplicate email check)
- Delete with a confirmation message
- Loading indicator and friendly error messages
- Responsive layout for desktop, tablet and mobile
- Floating **back-to-top** button

## Technologies used

| Part | Technology |
| --- | --- |
| Frontend | HTML, CSS, JavaScript (ES modules, no framework) |
| Backend | Node.js, Express |
| Database | MySQL / MariaDB (`mysql2`) |
| Security | `bcryptjs` password hashing, `express-session`, `helmet`, `express-rate-limit` |
| Logging | `winston`, `morgan` |

## Screenshots

See the `screenshots/` folder (login, dashboard on desktop / tablet / mobile, search, add form validation, delete confirmation).

---

# How to Run

## 1. Requirements

- **Node.js 18 or newer** – https://nodejs.org (check with `node -v`)
- **MySQL 8 or MariaDB 10.5+** – installed and running

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

# Windows (Command Prompt)
copy .env.example .env
```

Open `.env` and set:

| Setting | What to put |
| --- | --- |
| `DB_USER` | Your MySQL username (for example `root`) |
| `DB_PASSWORD` | Your MySQL password |
| `SESSION_SECRET` | Any long random text. Generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_PASSWORD` | The password you will use to log in (at least 8 characters) |

The other settings can stay as they are (`DB_NAME=peopledesk`, `ADMIN_USERNAME=admin`, `PORT=3000`).

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

## Troubleshooting

| Message or problem | Fix |
| --- | --- |
| "Missing settings in .env" | Create the `.env` file (step 3). |
| "Cannot connect to MySQL" | Start MySQL, and check the `DB_*` values in `.env`. |
| "Access denied for user" | `DB_USER` or `DB_PASSWORD` is wrong. |
| "Port already in use" | Change `PORT` in `.env`, then restart. |
| "Too many login attempts" | Wait 15 minutes, or restart the app. |
| Forgot the admin password | Delete the row in the `users` table, set a new `ADMIN_PASSWORD` in `.env`, and run `npm run db:setup` again. |
