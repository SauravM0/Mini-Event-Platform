# Deployment Guide

Follow these steps to deploy your Mini Event Platform to Render (Backend) and Vercel (Frontend).

## Prerequisites
- You have pushed your code to GitHub.
- You have accounts on [Render](https://render.com) and [Vercel](https://vercel.com).
- You have your MongoDB Atlas connection string ready.

---

## Part 1: Deploy Backend to Render

1. **Create Web Service**
   - Log in to [Render Dashboard](https://dashboard.render.com).
   - Click **New +** -> **Web Service**.
   - Select **Build and deploy from a Git repository**.
   - Connect your GitHub account and select your `Mini-Event-Platform` repository.

2. **Configure Service Details**
   - **Name**: `mini-event-platform-api` (or similar)
   - **Region**: Closest to you.
   - **Branch**: `main`
   - **Root Directory**: `server` (Important!)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

3. **Environment Variables**
   Scroll down to **Environment Variables** and add the following:
   
   | Key | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | `your_mongodb_connection_string` |
   | `JWT_SECRET` | `your_secure_random_secret_string` |
   | `JWT_EXPIRE` | `30d` |
   | `CLIENT_URL` | `*` (We will update this later) |

4. **Deploy**
   - Click **Create Web Service**.
   - Wait for the build to finish. Once successful, copy the **onrender.com URL**.

---

## Part 2: Deploy Frontend to Vercel

1. **Import Project**
   - Log in to [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **Add New ...** -> **Project**.
   - Import your `Mini-Event-Platform` repository.

2. **Configure Project**
   - **Framework Preset**: Vite.
   - **Root Directory**: Click **Edit** and select `client`.
   - **Build Settings**: (Leave defaults: `npm run build`, `dist`).

3. **Environment Variables**
   Expand the **Environment Variables** section and add:

   | Key | Value |
   | --- | --- |
   | `VITE_API_BASE_URL` | Your Render Backend URL + `/api` (e.g., `https://...onrender.com/api`) |

4. **Deploy**
   - Click **Deploy**.
   - Vercel will build and deploy your site.
   - Once done, you will get a production URL.

---

## Part 3: Final Configuration (CORS)

1. **Update Backend CORS**
   - Go back to Render -> **Environment Variables**.
   - Edit `CLIENT_URL` and set it to your Vercel URL (e.g., `https://mini-event-platform.vercel.app`).
   - Save changes.
