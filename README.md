## Project Deployment & Setup:
> **Note on Live Backend Availability:**  
> The production frontend hosted on Vercel is currently relying on the **locally containerized backend stack** (running on a Bazzite server). To optimize local host resources, the backend container stack is not kept running 24/7. 
> 
> If you are testing the live Vercel frontend and would like a **live demonstration of form submissions or API endpoints**, please reach out so I can start the local backend stack on my machine.

---
### Architecture:
This Express backend is built to support two execution models:
1. **Active — Containerized Stack (Self-Hosted):**  
   Runs locally on Bazzite OS via rootless Podman (`3x app` replicas, `NGINX` reverse proxy, and `LocalTunnel` persistent public egress).
2. **Load Balancing & Proxying:**  
  NGINX serves as the ingress point, managing load distribution across app replicas and acting as the **single source of truth for CORS headers**.
3. **Fallback — Serverless Engine:**  
   Configured for direct serverless deployment on Vercel using `vercel.json` rewrites and `module.exports = app`.
   
---
### Domain & SSL Architecture
* **Public Endpoint:** `https://****.loca.lt/api` (Exposed via `LocalTunnel`)
* **Tunnel Bypass Header:** To bypass LocalTunnel's anti-phishing landing page programmatically, the frontend client injects the `bypass-tunnel-reminder: true` request header.
* **CORS Management:** Configured in `nginx.conf` (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`).

---
### Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain-azure.vercel.app
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
---
### Podman Stack
The stack consists of 3 load-balanced app replicas, an nginx_proxy container, and a cloudflare_tunnel client.

---
### Launch
Build images and start 3 scaled app replicas in background
```
podman compose build --no-cache
podman compose up -d --scale app=3
```