🚀 Deployment on AWS

The Whisper App is deployed on AWS EC2 to ensure scalability, security, and high availability.

Deployment Process
1. Provisioning an EC2 Instance

Launched an Ubuntu-based EC2 instance.

Configured security groups to allow:

HTTP (port 80)

HTTPS (port 443)

Application-specific ports (e.g., 3000).

2. Server Setup

Installed Node.js, npm, and MongoDB client.

Pulled the project repository from GitHub.

Configured environment variables (.env) for:

MongoDB connection string

JWT secrets

App port.

3. Process Management

Used PM2 to run the Node.js server in the background.

Ensured automatic restarts on crashes or server reboot.

4. Reverse Proxy with Nginx

Configured Nginx as a reverse proxy to route traffic to the Node.js server.

Secured the application with SSL/TLS certificates using Let’s Encrypt (Certbot).

5. Database Hosting

Connected the app to MongoDB Atlas, providing a reliable and scalable cloud-based database.

6. Ngrok for Public Access

Integrated Ngrok during development/testing for secure tunneling.

Temporary public link: Whisper App on AWS

✅ With this setup, the application is production-ready, secure, and capable of handling user authentication, authorization, and CRUD operations efficiently.
