# shuttle-booking-system

🛠️ Deploying MongoDB on Render (Private Docker Service)
This project includes a setup to run MongoDB as a private service on Render using Docker.
📦 Files Included

Dockerfile: Defines the MongoDB container.
render.yaml: Tells Render how to deploy the service.


🚀 Steps to Deploy


Fork or clone this repository to your GitHub account.


Ensure the following files are in the root directory:

Dockerfile
render.yaml



Go to your Render dashboard → click “New” → select “Private Service”.


Connect your GitHub repo containing this setup.


Render will automatically detect the render.yaml file and deploy MongoDB as a private service.



🧱 Dockerfile
DockerfileFROM mongo:latestEXPOSE 27017Show more lines

⚙️ render.yaml
YAMLservices:  - type: private    name: mongodb    env: docker    plan: starter    dockerfilePath: ./Dockerfile    autoDeploy: trueShow more lines

🔗 Connecting to MongoDB
Other services on Render can connect to this MongoDB instance using the internal hostname:
mongodb:27017

The API  service Running at

https://shuttle-booking-system.fly.dev/api-docs/#/Users/get_users


