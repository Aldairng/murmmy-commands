# Murmmy Comandas

Order management system for Murmmy Ice Cream Cereal shop.

## Development

### Prerequisites

- Node.js 20+
- Docker (optional, for production)

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

To access from phones/tablets on the same Wi-Fi, start the client with `--host`:

```bash
cd client && npm run dev -- --host
```

Then open `http://<your-ip>:5173` from the other device (e.g. `http://192.168.1.100:5173`).

Find your IP with:

```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I
```

## Production (Docker)

```bash
docker compose up --build -d
```

The app runs on port 3000. Accessible from any device on the network at `http://<your-ip>:3000`.

### Data location

Data (SQLite database) is persisted in `./commandas-data/` by default. To store it elsewhere, set `DATA_DIR`:

```bash
# Example: store data on the Windows C: drive (WSL)
DATA_DIR=/mnt/c/MurmmyData docker compose up --build -d

# Example: custom Linux path
DATA_DIR=/home/murmmy/data docker compose up --build -d
```

The directory will be created automatically. Make sure the path exists and is writable.

## Default credentials

- Username: `murmmy-orderer`
- Password: `murmmy2026`

Change the password in Settings after first login.
