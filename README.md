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


The API grasshopper Service for location 

<img width="956" height="960" alt="image" src="https://github.com/user-attachments/assets/897b6fa7-0661-47d8-b465-e8e181904284" />


https://docs.graphhopper.com/openapi/route-optimization/solvevrp



<img width="970" height="1031" alt="image" src="https://github.com/user-attachments/assets/487224a6-a07e-4d4b-9823-453c694de3d3" />





