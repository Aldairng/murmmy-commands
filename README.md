# Murmmy Comandas

Order management system for Murmmy Ice Cream Cereal shop.

---

## Shop Setup (Windows PC)

Only two things are needed: **Docker Desktop** and the **docker-compose.yml** file.

### 1. Install Docker Desktop

Download and install from https://www.docker.com/products/docker-desktop/

After installing, open Docker Desktop and make sure it's running (the whale icon should be in the system tray).

### 2. Create a folder and the compose file

1. Create a folder anywhere, for example `C:\Murmmy`
2. Inside that folder, create a file called `docker-compose.yml` with this content:

```yaml
services:
  commandas:
    image: aldaiirnava/murmmy-commandas:latest
    ports:
      - "3000:3000"
    volumes:
      - ./commandas-data:/app/data
    environment:
      - PORT=3000
      - JWT_SECRET=murmmy-commandas-secret-key
      - DB_PATH=/app/data/commandas.db
    restart: unless-stopped
```

### 3. Start the app

Open a terminal (PowerShell or CMD) in that folder and run:

```bash
docker compose up -d
```

That's it. The app will download automatically and start running.

### 4. Open the app

- From the shop PC: http://localhost:3000
- From phones/tablets on the same Wi-Fi: `http://<pc-ip>:3000`

To find the PC's IP, open **CMD or PowerShell on Windows** (not inside WSL) and run:

```bash
ipconfig
```

Look for the **IPv4 Address** under your Wi-Fi or Ethernet adapter — it looks like `192.168.x.x` or `10.0.x.x`. Use that IP, not the WSL internal one.

> **Important:** Do NOT use `hostname -I` inside WSL — that gives the virtual WSL IP, which other devices on the network cannot reach. Always use the Windows `ipconfig` command to get the real network IP.

netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.31.112.1

New-NetFirewallRule -DisplayName "Murmmy Commandas" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow

### Update to the latest version

```bash
docker compose pull
docker compose up -d
```

### Stop the app

```bash
docker compose down
```

### Data

All data is saved in the `commandas-data` folder next to the compose file. This folder is created automatically. Do not delete it — it contains all orders, tables, and settings.

---

## Development

### Prerequisites

- Node.js 20+

### Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### Run in dev mode

```bash
# Terminal 1 - backend (port 3001)
cd server && npm run dev

# Terminal 2 - frontend (port 5173)
cd client && npm run dev
```

Open http://localhost:5173

### Access from other devices on the network

Start the client with `--host`:

```bash
cd client && npm run dev -- --host
```

Then open `http://<your-ip>:5173` from the other device.

Find your IP with:

```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I
```

### Build and run with Docker locally

```bash
docker compose up --build
```

This builds the image locally instead of pulling from Docker Hub.
