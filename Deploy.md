## 🛠️ Quick Deploy — The 5-Minute Guide

Want to spin this up fast? Follow these steps:

```bash
# 1️⃣ Clone the repo
git clone https://github.com/<your-repo>.git
cd yolo/k8s

# 2️⃣ Create the namespace and apply manifests
kubectl create namespace yolo-app
kubectl apply -f namespace.yaml
kubectl apply -f mongo.yaml -n yolo-app
kubectl apply -f backend-deployment.yaml -n yolo-app
kubectl apply -f frontend-deployment.yaml -n yolo-app

# 3️⃣ Expose the backend temporarily (for testing)
kubectl patch svc backend-service -n yolo-app -p '{"spec": {"type": "LoadBalancer"}}'

# 4️⃣ Grab your frontend’s external IP
kubectl get svc frontend-service -n yolo-app