# 🌤️ Weather API

A simple and beginner-friendly **Weather API** built with **TypeScript, Node.js, Express, Redis, Docker, and the Visual Crossing Weather API**.

This project allows users to request the current weather for a city while using **Redis caching** to avoid unnecessary requests to the external weather service. It also includes **rate limiting**, environment variables, error handling, and Docker support. ☁️🌈

---

## ✨ Features

* 🌍 Get current weather information for any city
* ⚡ Redis caching to improve response speed
* ⏰ Cache weather data for 12 hours
* 🚦 Rate limiting to prevent excessive requests
* 🔐 Environment variables for sensitive configuration
* 🛡️ Error handling for invalid requests and API failures
* 🐳 Docker and Docker Compose support
* 📡 Axios for communication with the external Weather API
* 💻 TypeScript for type-safe development

---

## 🛠️ Technologies

| Technology             | Purpose                            |
| ---------------------- | ---------------------------------- |
| **Node.js**            | JavaScript runtime                 |
| **TypeScript**         | Type-safe development              |
| **Express**            | Web server and API framework       |
| **Axios**              | HTTP requests                      |
| **Redis**              | Weather data caching               |
| **Visual Crossing**    | External weather data provider     |
| **express-rate-limit** | API rate limiting                  |
| **Docker**             | Containerization                   |
| **Docker Compose**     | Running the API and Redis together |

---

## 📁 Project Structure

```text
weather-api/
│
├── src/
│   ├── services/
│   │   └── cacheService.ts
│   │
│   └── server.ts
│
├── .dockerignore
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
└── tsconfig.json
```

### What does each important file do?

**`src/server.ts`**

Contains the Express server, `/weather` endpoint, rate limiting, weather API request, error handling, and application startup.

**`src/services/cacheService.ts`**

Handles the connection to Redis and provides functions for getting and storing cached weather data.

**`Dockerfile`**

Defines how the Weather API Docker image is built.

**`docker-compose.yml`**

Runs both the Weather API and Redis together.

**`.env`**

Contains local environment variables and secrets.

> ⚠️ `.env` should never be committed to GitHub.

**`.env.example`**

Shows which environment variables are required without exposing real secrets.

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
```

Then enter the project:

```bash
cd weather-api
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Create your environment file

Create a `.env` file:

```bash
touch .env
```

Add:

```env
PORT=3000
WEATHER_API_KEY=your_visual_crossing_api_key
REDIS_URL=redis://redis:6379
```

Replace:

```text
your_visual_crossing_api_key
```

with your own Visual Crossing API key.

You can get an API key from the official Visual Crossing website.

---

# 🐳 Running with Docker

The easiest way to run the complete project is with Docker Compose.

Build and start the containers:

```bash
docker compose up --build
```

You should see something similar to:

```text
Connected to Redis
Weather API running on http://localhost:3000
```

The project contains two services:

```text
weather-api
     │
     └────── Redis
```

Docker Compose creates a network between them automatically.

Inside Docker, Redis is accessed using:

```text
redis://redis:6379
```

Here, `redis` is the name of the Redis service in `docker-compose.yml`.

---

# 🌦️ API Usage

## Get Weather

### Endpoint

```http
GET /weather
```

### Query Parameter

```text
city
```

### Example

```bash
curl "http://localhost:3000/weather?city=Gaza"
```

### Example Response

```json
{
  "city": "Gaza",
  "temperature": 30.7,
  "condition": "Partially cloudy"
}
```

---

# ⚡ Redis Caching

The API uses Redis to cache weather results.

When a user requests weather for a city:

```text
Request
   ↓
Check Redis
   ↓
Is the weather cached?
   │
   ├── YES → Return cached data ⚡
   │
   └── NO
         ↓
   Request Visual Crossing
         ↓
   Save result in Redis
         ↓
   Return weather
```

The cache expires after **12 hours**.

This means repeated requests for the same city don't need to call the external Weather API every time.

### Example

First request:

```text
Fetching weather from Visual Crossing
```

Second request:

```text
Returning weather from cache
```

This reduces unnecessary API requests and makes repeated requests faster. 🚀

---

# 🚦 Rate Limiting

The API uses `express-rate-limit` to protect the endpoint from excessive requests.

Current configuration:

```text
10 requests
per
1 minute
per IP
```

The configuration is:

```ts
windowMs: 60 * 1000
max: 10
```

If a client exceeds the limit, the API returns:

```http
429 Too Many Requests
```

with:

```json
{
  "error": "Too many requests, please try again later."
}
```

---

# 🛡️ Error Handling

The API handles several common errors.

### Missing city

Request:

```bash
curl "http://localhost:3000/weather"
```

Response:

```json
{
  "error": "City is required"
}
```

Status:

```http
400 Bad Request
```

---

### City not found

If the external weather service cannot find the requested city:

```http
404 Not Found
```

Response:

```json
{
  "error": "City not found"
}
```

---

### Too many requests

When the rate limit is exceeded:

```http
429 Too Many Requests
```

Response:

```json
{
  "error": "Too many requests, please try again later."
}
```

---

### External weather service unavailable

If the external API fails:

```http
502 Bad Gateway
```

Response:

```json
{
  "error": "Weather service is unavailable"
}
```

---

# 🔐 Environment Variables

The project uses environment variables to keep configuration and secrets outside the source code.

Required variables:

```env
PORT=3000
WEATHER_API_KEY=your_visual_crossing_api_key
REDIS_URL=redis://redis:6379
```

| Variable          | Description                     |
| ----------------- | ------------------------------- |
| `PORT`            | Port used by the Express server |
| `WEATHER_API_KEY` | Visual Crossing API key         |
| `REDIS_URL`       | Redis connection URL            |

Never commit your real `.env` file.

---

# 🧪 Testing the API

After starting Docker:

```bash
docker compose up --build
```

Open another terminal and test:

### Valid request

```bash
curl "http://localhost:3000/weather?city=Gaza"
```

### Missing city

```bash
curl "http://localhost:3000/weather"
```

### Test caching

Run the same request twice:

```bash
curl "http://localhost:3000/weather?city=Gaza"
```

```bash
curl "http://localhost:3000/weather?city=Gaza"
```

The first request should fetch data from Visual Crossing.

The second request should use Redis.

---

# 🐳 Docker Commands

### Start the project

```bash
docker compose up
```

### Build and start

```bash
docker compose up --build
```

### Run in background

```bash
docker compose up -d
```

### Stop the containers

```bash
docker compose down
```

### View running containers

```bash
docker ps
```

### View logs

```bash
docker compose logs
```

### View Weather API logs

```bash
docker compose logs weather-api
```

### View Redis logs

```bash
docker compose logs redis
```

---

# 🧠 How the Project Works

The complete request flow is:

```text
                    ┌─────────────────┐
                    │     Client      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Express      │
                    │  /weather       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Rate Limiting   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      Redis      │
                    │     Cache       │
                    └──────┬───┬──────┘
                           │   │
                    Cache Hit  │ Cache Miss
                           │   │
                           │   ▼
                           │ ┌──────────────────┐
                           │ │ Visual Crossing  │
                           │ │    Weather API   │
                           │ └────────┬─────────┘
                           │          │
                           │          ▼
                           │    Save to Redis
                           │          │
                           └────┬─────┘
                                ▼
                         Weather Response
```

---

# 💡 Why Redis?

Without caching:

```text
Request 1 → Visual Crossing
Request 2 → Visual Crossing
Request 3 → Visual Crossing
Request 4 → Visual Crossing
```

With Redis:

```text
Request 1 → Visual Crossing → Redis
Request 2 → Redis ⚡
Request 3 → Redis ⚡
Request 4 → Redis ⚡
```

This reduces calls to the external API and improves performance for repeated requests.

---

# 🌱 Possible Improvements

Future improvements could include:

* 🧪 Add automated unit and integration tests
* ❤️ Add a `/health` endpoint
* 📊 Add API request logging
* 🔑 Add stronger API key validation
* 🚦 Move rate-limit storage to Redis
* 🩺 Add Redis health checks to Docker Compose
* 📚 Add Swagger/OpenAPI documentation
* 🌍 Add more weather information such as humidity, wind speed, and forecasts
* 🖥️ Create a frontend for the API

---

# 🎯 Project Goal

This project was built as a beginner backend project to practice:

* REST APIs
* Express.js
* TypeScript
* Third-party APIs
* HTTP requests
* Redis caching
* Rate limiting
* Environment variables
* Error handling
* Docker
* Docker Compose

It demonstrates how different backend technologies can work together to create a small but practical API.

---

## 🌈 Built With

Made with ☕ + 💻 + ☁️

**TypeScript · Express · Redis · Docker · Axios · Visual Crossing**

---

## 📜 License

This project is available for educational and personal use.
