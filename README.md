This project implements a RESTful API for managing Order entities and handling PDF uploads, built with NestJS (backend) and React (frontend). The stack is deployed on AWS (API, frontend) using AWS RDS for the database.

### Tech Stack

Backend: NestJS (TypeScript, REST API)

Frontend: React (optional for MVP)

Database: AWS DynamoDB

Storage: AWS S3 (for PDF uploads)

Deployment: AWS (EC2, S3 static site)

### Features

CRUD operations for Order (Create, Read, Update, Delete)

Upload PDF, extract patient details (name, DOB)

Log all user actions in the database

API authentication (API Key header)

Deployed/public endpoint
