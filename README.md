# Titanium Pyrotechnics Portfolio Website

A sleek, premium, high-tech, and highly theatrical portfolio and client-acquisition website for **Titanium Pyrotechnics**.

## Key Features

1. **Ambient Canvas Spark Background**: Continuous, high-performance rendering of ember sparks representing drifting firework smoke.
2. **Interactive "Pyro-Script" Simulator Console**:
   - Master Arming switch inserting and locking system controls.
   - Synchronized audio-visual firing simulator (Titanium Salutes, Royal Blue Peonies, Willow Crowns, Strobe Bouquets).
   - Zero-latency Web Audio API procedural synthesizer for audio thuds and explosions.
   - Scripted automatic sequence simulating pre-choreographed shows.
3. **Interactive Availability Calendar**: Shows booked display slots matching your calendar and lets users select open dates.
4. **Google Sheets Automated Inquiry Intake**: Capture leads directly in your Google Sheets for free without writing backend APIs or databases.

---

## Deployment to Render (Free Tier Static Site)

This website is optimized for Render's **Static Site** hosting which is 100% free, does not sleep, and uses a global CDN for instant loads.

### Step-by-Step Deploy:
1. Push your code repository containing this `portfolio` folder to GitHub or GitLab.
2. Log into your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** and select **Static Site**.
4. Connect your GitHub/GitLab repository.
5. In the settings, configure:
   - **Name**: `titanium-pyrotechnics` (or your choice)
   - **Branch**: `main`
   - **Root Directory**: `portfolio` (or leave blank if files are in your repository's root)
   - **Build Command**: *Leave blank* (zero compilation steps required)
   - **Publish Directory**: `.` (if Root Directory is `portfolio`, otherwise `portfolio`)
6. Click **Create Static Site**. It will compile, deploy, and give you a free SSL URL (e.g., `titanium-pyrotechnics.onrender.com`).

---

## Customizing Your Google Forms Lead Capture

To ensure client inquiries flow straight to your private Google Sheet:

1. Go to Google Forms and create a new form with these exact fields:
   - Name / Organization
   - Email Address
   - Selected Show Date
   - Target Budget / Scale
   - Display Location / Venue
   - Audio Choreography Preference
   - Scripting Requests & Venue Details
2. Link the Form to a new Google Sheet (via the *Responses* tab in Google Forms).
3. Open your live Google Form in the browser, view page source or inspect the fields, and find:
   - The Form Action URL: Look for `<form action="https://docs.google.com/forms/d/e/FAIpQLS.../formResponse">`
   - The field inputs: Look for the `name` attributes (e.g., `entry.1000001`, `entry.1000002`).
4. Open [portfolio/index.html](file:///c:/Users/Tmoon/Fireworks/portfolio/index.html) and replace:
   - The form's `action` attribute with your form's response URL.
   - The `name` attributes of each form input/select field with your specific Google Form `entry.XXXXXXXX` keys.
5. Save and deploy! Your booking inquiry entries will now populate directly inside your Google Sheet.
