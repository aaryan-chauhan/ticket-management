# Deploying to an EC2 Ubuntu Instance

Concise, project-specific deployment steps for the Customer Support Ticket
Management System. (If you have a combined multi-project deployment guide,
prefer that — this covers just this project.)

## 1. Launch & prepare the instance

- Ubuntu 22.04+ EC2 instance.
- Security group inbound rules:
  - `22` (SSH) — your IP
  - `3003` (backend API) — or keep it private and only expose it via nginx/80
  - `5173` or `80`/`443` (frontend) depending on how you serve it below
  - `5432` (PostgreSQL) only if the DB is accessed from outside the instance; otherwise keep it closed

SSH in, then update packages:

```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
```

## 3. Install and configure PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql

sudo -u postgres psql -c "CREATE DATABASE ticket_db;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'choose-a-strong-password';"
```

If the app will connect from the same instance (recommended for this
minimal setup), the default `localhost` connection is fine — no need to
open port 5432 externally.

## 4. Copy the project to the instance

From your local machine:

```bash
scp -r ticket-management-system ubuntu@<EC2_PUBLIC_IP>:~/
```

Or `git clone` your repo directly on the instance.

## 5. Backend: build and run with PM2

```bash
cd ~/ticket-management-system/backend
cp .env.example .env
nano .env
```

Set in `.env`:

```
PORT=3003
FRONTEND_URL=http://<EC2_PUBLIC_IP>        # or your domain
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=choose-a-strong-password
DB_NAME=ticket_db
DB_SYNCHRONIZE=true    # first deploy only; see note below
```

Install, build, and run:

```bash
npm install
npm run build

sudo npm install -g pm2
pm2 start dist/main.js --name ticket-backend
pm2 save
pm2 startup     # follow the printed command to enable pm2 on boot
```

**Note on `DB_SYNCHRONIZE`:** leaving this `true` lets TypeORM create the
tables automatically on first run, which is convenient for this practice
project. For a real production system, run the app once with it `true` (or
use migrations) to create the schema, then set it back to `false` so future
deploys can't accidentally alter/drop columns against live data.

Check it's up:

```bash
pm2 logs ticket-backend
curl http://localhost:3003/customers
```

## 6. Frontend: build and serve

```bash
cd ~/ticket-management-system/frontend
cp .env.example .env
nano .env
```

Set:

```
VITE_API_URL=http://<EC2_PUBLIC_IP>:3003
```

Build the static site:

```bash
npm install
npm run build
```

### Option A — quick: serve with `serve`

```bash
sudo npm install -g serve
pm2 start "serve -s dist -l 5173" --name ticket-frontend
pm2 save
```

Visit `http://<EC2_PUBLIC_IP>:5173`.

### Option B — nginx (recommended for a real domain/port 80)

```bash
sudo apt install -y nginx
sudo tee /etc/nginx/sites-available/ticket-frontend > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    root /home/ubuntu/ticket-management-system/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/ticket-frontend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

Visit `http://<EC2_PUBLIC_IP>`.

If using nginx, you can also proxy `/api` to the backend and set
`VITE_API_URL=http://<EC2_PUBLIC_IP>/api` instead of exposing port 3003
directly — optional for this minimal practice setup.

## 7. Verify end-to-end

- Open the frontend URL in a browser.
- Add a customer, then create a ticket for that customer.
- Edit the ticket's status/priority and confirm it updates.
- Delete the ticket, then the customer.

## Updating a running deployment

```bash
cd ~/ticket-management-system
git pull   # or re-copy files

cd backend && npm install && npm run build && pm2 restart ticket-backend
cd ../frontend && npm install && npm run build && pm2 restart ticket-frontend   # if using Option A
# if using nginx (Option B), just rebuild — nginx serves the new dist/ automatically
```
