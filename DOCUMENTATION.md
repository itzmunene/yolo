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

![Alt text](Image/image v1.0.1.png)

![Alt text](Image/image v1.0.0.png)

![Alt text](Image/docker repo.png)

![Alt text](Image/docker repo client.png)

![Alt text](Image/docker repo client.png)
