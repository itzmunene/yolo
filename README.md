# 🧠 SampleByJoe

> *Personalised from the original Brian-YOLO build — restructured, optimised, and debugged for clarity, speed, and smaller Docker images.*

---

## 🚀 Project Overview

This project started as a fork of **Brian-YOLO**, and I gradually transformed it into **SampleByJoe** — a cleaner, more understandable, and better-performing version.

The goal was to **simplify configurations**, **reduce Docker image size**, and **streamline how the app parses and serves data** through the client and backend.

Everything was renamed for clarity and easier debugging. Below is a breakdown of what changed, why it changed, and how it improved the app.

---

## ⚙️ General Modifications

- Renamed all instances of `brian-yolo` → `samplebyjoe` for clarity.
- Removed redundant comments to better follow the app execution.
- Updated the **image name** in both the Docker YAML and backend files.
- Adjusted the **Docker subnet** (conflicts with my local hotspot subnet).
- Renamed the **Docker volume** for easier tracking and debugging.
- Commented out the **Docker Compose version declaration** (was triggering warnings).
- Updated port mapping from `3000:80` to align with **NGINX** serving the frontend build.

---

## 🐋 Docker Optimisation (Reducing Image Size)

The main bottleneck was image size and redundant build layers. Here’s how I trimmed it down and improved performance.

### 🔧 Key Changes

1. **Switched `npm install` → `npm ci`**
   - Uses the `package-lock.json` for deterministic installs.
   - Wipes `node_modules` before installation for clean, repeatable builds.
   - ⚠️ Breaks if `package.json` and `package-lock.json` are out of sync.

2. **Used `node:18-alpine`**
   - Lightweight, officially maintained, and already includes Node + npm.
   - Smaller footprint than full Node images.
   - Faster, more secure builds with fewer dependencies.

3. **Avoided using `alpine:3` directly**
   - Super light but too minimal — no Node, npm, or build tools.
   - `node:18-alpine` strikes the perfect balance between size and usability.

4. **Configured `package.json` in the client for backward compatibility**
   - Ensured React scripts stayed compatible with Node 18 and OpenSSL 3.

---

## 🧩 Client Dockerfile (Frontend)

### Removed redundant steps
- Removed:
  - `COPY ..` (caused duplicate files and extra layers)
  - `WORKDIR /app` (already defined)
  - `RUN apk update && apk add npm` (npm already included in Node base image)

### Added multi-stage build
- **Build stage:** Uses Node to build the React app.
- **Final stage:** Uses NGINX to serve static files.
- Added:
  ```dockerfile
  CMD ["nginx", "-g", "daemon off;"]

![Alt text](Images/imagev1.0.1.png)

![Alt text](Images/imagev1.0.0.png)

![Alt text](Images/dockerrepo.png)

![Alt text](Images/dockerrepobackend.png)

![Alt text](Images/dockerrepoclient.png)

## 🚀 Deployment Automation Summary

To ensure a smooth deployment of the YOLO app, several adjustments were made to the **Ansible playbook** and **roles** configuration.

### 🧠 Playbook Refinement
The main playbook was updated to:
- Automate **Docker installation** and configuration within the Vagrant VM.
- Add Docker’s **GPG key and repository** to ensure compatibility with Ubuntu 20.04.
- Include a pre-task to **create a Docker network (`samplebyjoe-net`)** for all containers to communicate seamlessly.
- Ensure Docker services start automatically on boot.

### 🧩 Roles Directory Overhaul
Each role was refined to align with the Docker workflow:
- **setup-mongodb** → Configured the MongoDB container with a persistent volume and connected it to the shared Docker network.
- **backend-deployment** → Pulled the latest backend image and ran it on port 5000 with network linkage.
- **frontend-deployment** → Deployed the React + NGINX container serving the build files on port 3000.

All roles now depend on the same Docker bridge network, ensuring inter-container communication without exposing unnecessary ports.

### 🧱 Infrastructure Improvements
- Added a dedicated **Docker volume (`app-mongo-data`)** to maintain database persistence.
- Simplified role dependencies by letting Ansible handle sequencing automatically via the playbook.
- Ensured all Docker images pull from **Docker Hub** for consistent builds.

### ✅ End Result
The final setup creates an automated pipeline where:
1. Vagrant provisions a clean Ubuntu VM.  
2. Ansible installs and configures Docker.  
3. The three app services (MongoDB, Backend, Frontend) deploy automatically in isolated containers.  
4. Each service connects via the same Docker network for full app functionality.

This structure mirrors a real-world microservice environment, allowing effortless redeployment, scaling, and updates from a single playbook command.

![Alt text](Images/playbook.png)

![Alt text](Images/vagrantdocker.png)


### 🧩 Vagrant Port Forwarding Setup (Host ↔ VM Access)

To access the YOLO app running inside Vagrant (the backend, frontend, and MongoDB containers), we had to configure **port forwarding** in the `Vagrantfile`.  

By default, Vagrant maps the guest’s ports directly to your host — but since the host ( the pc hosting the VM) already had active listeners on ports **3000** and **5000**, the VM refused to boot.

**Fix:** I just remapped them to avoid conflicts and keep things tidy.

# Vagrantfile (network configuration section)
config.vm.network "forwarded_port", guest: 3000, host: 3030
config.vm.network "forwarded_port", guest: 5000, host: 5050

![Alt text](Images/yolomyvagrant.png)

## 🔐 Kubernetes Secrets & Environment Configuration

To keep MongoDB credentials and sensitive data secure, store them as **Kubernetes Secrets** instead of hardcoding in YAML files.

## 🗂️ Kubernetes Configuration (k8s/ Folder)

This folder contains all Kubernetes manifests for deploying the YOLO App.

## 1️⃣ Pod Exposure  
- **Frontend:** exposed via `LoadBalancer` → gets a public IP → accessible from your browser.  
- **Backend:** internal only with `ClusterIP` for secure communication.  
- **MongoDB:** uses a **Headless Service** (`clusterIP: None`) for stable DNS-based connections.  

---

![Alt text](Images/gcloudpods.png)

---

![Alt text](Images/yoloservice.png)

---

## 2️⃣ Persistent Storage  
- MongoDB uses a **1Gi PVC** (GKE’s `standard` storage class).  
- Data sticks around through restarts — no accidental data loss.  
👉 If things vanish, it’s usually a Mongo URI or PVC binding issue.  

---

![Alt text](Images/gcloudyolo.png)

---

## 3️⃣ Debugging & Fixes  
- Fixed the `MONGO_URI` vs `MONGODB_URI` mismatch.  
- Cleaned up YAML syntax (metadata, spacing, etc.).  
- Verified backend-to-Mongo connection (`mongodb://mongo:27017/darkroom`).  
- Checked PVC binding in GKE Autopilot (`storageClassName: standard-rwo`).  
✅ All components now connect perfectly.  

---

# 🚀 Final Setup

The whole YOLO app is now cruising on **Google Kubernetes Engine (Autopilot)** — smooth, self-healing, and ready for showtime.  

- **MongoDB** runs as a **StatefulSet** with a **PersistentVolumeClaim**, so your data stays put even if the pod decides to take a nap or move nodes.  
- **Backend (Node.js + Express)** talks directly to Mongo through its service name `mongo` — no hardcoded IP drama.  
- **Frontend (React)** and **Backend** communicate inside the cluster through **Services**, and Kubernetes quietly handles the networking magic behind the scenes.  
- The **Frontend** rolls out to the world using a **LoadBalancer**, giving it an external IP for easy demo and grading access.  
- The **Backend** was temporarily exposed with its own LoadBalancer — just long enough to confirm APIs were firing and frontend requests were landing.

---

## 💡 Heads Up

Browser DNS drama — so frontend → backend requests from *outside* the cluster weren’t fully verifiable this round.  
But don’t — backend logs confirm MongoDB is up, running, and keeping data safe.  
So persistence? ✅  
Just a minor build for the next version.  

![Alt text](Images/databaseg.png)

> 💻 **Live App:** http://http://34.79.89.19/
Everything’s containerised, deployed, and serving production. 🌩️

---

## ☁️ Temporary Fix: External IP Exposure

For this version, the backend was exposed publicly via **LoadBalancer** — fast, effective, and demo-ready.  
But for real-world deployment, that’s like leaving your Wi-Fi open | No Password-or password is password.

### 🔒 Next version goals:
- Add an **Ingress Controller** to route frontend + backend under one neat domain.  
- Use **internal services** or an **NGINX reverse proxy** to handle `/api` calls safely.  
- Layer in **CORS rules + authentication** so only approved traffic gets through. 
