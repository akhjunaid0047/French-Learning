# AWS EC2 Docker Deployment Report

This project is deployed as three containers on one EC2 instance:

- `frontend`: static Next.js export served by Nginx
- `backend`: Bun API for `/tts` and `/health`
- `caddy`: public reverse proxy for HTTPS and domain routing

The public site uses one domain:

- `https://yourdomain.com` -> frontend
- `https://yourdomain.com/api/tts` -> backend
- `https://yourdomain.com/api/health` -> backend health check

## 1. Before you start

You need:

- an AWS account
- your GoDaddy domain
- an SSH key pair for EC2
- your OpenAI API key

Important:

- Rotate the OpenAI key currently stored in `backend/.env` before you deploy.
- Keep only one canonical frontend origin. This backend accepts a single `ALLOWED_ORIGIN`.

## 2. Launch the EC2 instance

Recommended starter setup:

- AMI: Ubuntu 24.04 LTS
- Instance type: `t3.small` minimum, `t3.medium` if you expect heavier use
- Storage: 20 GB

Security group inbound rules:

- `22` TCP from your IP only
- `80` TCP from `0.0.0.0/0`
- `443` TCP from `0.0.0.0/0`

## 3. Point GoDaddy to EC2

In AWS:

1. Open the EC2 instance.
2. Copy the public IPv4 address.

In GoDaddy DNS:

1. Create an `A` record for `@` pointing to your EC2 public IP.
2. Create an `A` record for `www` pointing to the same EC2 public IP.
3. Save the records.

DNS can take a few minutes to a few hours to fully propagate.

## 4. SSH into the server

```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## 5. Install Docker on Ubuntu

Run:

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## 6. Copy your project to EC2

Option A: from GitHub

```bash
git clone <your-repo-url>
cd french-flashcards-nextjs
```

Option B: from your local machine

```bash
scp -i /path/to/your-key.pem -r /home/teddy/Downloads/french-flashcards-nextjs ubuntu@YOUR_EC2_PUBLIC_IP:~
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
cd french-flashcards-nextjs
```

## 7. Create the deployment env file

On the server:

```bash
cp .env.deploy.example .env.deploy
nano .env.deploy
```

Set:

```env
DOMAIN_NAME=yourdomain.com
NEXT_PUBLIC_TTS_API_BASE_URL=https://yourdomain.com/api
ALLOWED_ORIGIN=https://yourdomain.com
OPENAI_API_KEY=your_new_rotated_openai_key
```

Notes:

- `NEXT_PUBLIC_TTS_API_BASE_URL` is compiled into the frontend image during build.
- `ALLOWED_ORIGIN` must exactly match the browser origin you will use.
- If you want `www.yourdomain.com` as the main site instead, change both values to `https://www.yourdomain.com`.

## 8. Build and start the containers

From the project root on EC2:

```bash
docker compose --env-file .env.deploy up -d --build
```

Check status:

```bash
docker compose ps
docker compose logs -f caddy
```

When DNS is live and ports `80` and `443` are open, Caddy will automatically request and renew HTTPS certificates.

## 9. Verify the deployment

Check the backend health endpoint:

```bash
curl https://yourdomain.com/api/health
```

Expected response:

```json
{"status":"ok"}
```

Then open:

```text
https://yourdomain.com
```

Test:

- the site loads
- audio playback works
- `www.yourdomain.com` redirects to the main domain

## 10. How updates work

Whenever you change the code:

```bash
cd ~/french-flashcards-nextjs
git pull
docker compose --env-file .env.deploy up -d --build
```

## 11. Useful Docker commands

See running containers:

```bash
docker compose ps
```

Watch logs:

```bash
docker compose logs -f
```

Restart everything:

```bash
docker compose --env-file .env.deploy restart
```

Stop everything:

```bash
docker compose --env-file .env.deploy down
```

## 12. Troubleshooting

If the site does not open:

- confirm the EC2 security group allows ports `80` and `443`
- confirm GoDaddy `A` records point to the current EC2 public IP
- confirm the containers are up with `docker compose ps`

If HTTPS does not come up:

- wait for DNS propagation
- check `docker compose logs -f caddy`
- make sure no other process on the server is already using ports `80` or `443`

If audio fails:

- confirm `OPENAI_API_KEY` is valid
- confirm `ALLOWED_ORIGIN` exactly matches the site URL
- check `docker compose logs -f backend`
- test `curl https://yourdomain.com/api/health`

If you reboot the EC2 instance:

- Docker will restart the containers automatically because each service uses `restart: unless-stopped`

## 13. Recommended next improvements

- attach an Elastic IP to the EC2 instance so the public IP does not change
- store secrets in AWS Systems Manager Parameter Store or AWS Secrets Manager
- add a GitHub Actions deploy workflow later if you want one-command updates
