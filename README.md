# Tech Keyboard

Interactive 3D split ergonomic keyboard with switch sound profiles, hover effects, and draggable rotation.

![Tech Keyboard Preview](preview.png)

## Features

- **3D Split Ergonomic Keyboard** — Built with Three.js, draggable orbit rotation
- **6 Switch Sound Profiles** — THOCK, CLICKY, TACTILE, MARBLE, TYPEWRITER, MIX
- **MIX Mode** — Layers all 5 sounds simultaneously for a rich blended click
- **"Maya" Trackball** — Red trackball with custom label, spins faster on hover
- **Hover Reveal** — Slide over keys to see tech stack labels (React, TypeScript, etc.)
- **Click to Press** — Animated keypress with sound feedback
- **Skill Stack Icons** — 24 developer tool logos rendered on keycap tops
- **Self-Contained** — Single HTML file, no build step, no external dependencies except Three.js CDN

## Tech Stack

- HTML5 + CSS3
- Vanilla JavaScript
- Three.js (r128 from CDN)
- Web Audio API (synthesized switch sounds)

## Quick Start

No build step required. Just open the HTML file in a browser:

```bash
# Option 1: Open directly
open index.html

# Option 2: Serve with Python
python3 -m http.server 8080
# Then open http://localhost:8080

# Option 3: Serve with Node
npx serve .
```

## Deploy to VPS

### Option 1: Nginx

```bash
# On your VPS
sudo apt install nginx
sudo mkdir -p /var/www/tech-keyboard
sudo cp index.html /var/www/tech-keyboard/

# Create nginx config
sudo tee /etc/nginx/sites-available/tech-keyboard << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/tech-keyboard;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/tech-keyboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Caddy (easiest)

```bash
# Install Caddy
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy

# Create Caddyfile
sudo tee /etc/caddy/Caddyfile << 'EOF'
your-domain.com
root * /var/www/tech-keyboard
file_server
EOF

sudo mkdir -p /var/www/tech-keyboard
sudo cp index.html /var/www/tech-keyboard/
sudo systemctl restart caddy
```

### Option 3: Docker

```bash
# Dockerfile
cat > Dockerfile << 'EOF'
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
EXPOSE 80
EOF

docker build -t tech-keyboard .
docker run -d -p 80:80 tech-keyboard
```

### Option 4: Simple Python Server (quick test)

```bash
# SSH into your VPS, clone the repo, and run:
python3 -m http.server 8080
# Or for background:
nohup python3 -m http.server 8080 > /dev/null 2>&1 &
```

## Push to GitHub

```bash
# On your local machine
git clone https://github.com/YOUR_USERNAME/tech-keyboard.git
cd tech-keyboard

# Or create new repo
git init
git remote add origin https://github.com/YOUR_USERNAME/tech-keyboard.git

git add index.html README.md
git commit -m "feat: interactive 3D tech keyboard with 6 switch sounds"
git push -u origin main
```

## File Structure

```
tech-keyboard/
├── index.html      # Single self-contained file (25KB)
└── README.md       # This file
```

## Switch Profiles

| Profile | Character | Click |
|---------|-----------|-------|
| THOCK | Deep, bassy thock | No |
| CLICKY | Sharp, crisp click | Yes |
| TACTILE | Tactile bump, rounded | No |
| MARBLE | Bright, glassy clack | No |
| TYPEWRITER | Vintage, thumpy | Yes |
| **MIX** | **All 5 layered** | **Blended** |

## License

MIT
