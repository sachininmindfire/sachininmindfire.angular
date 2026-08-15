# Google Apps Script & Google Gemini AI Setup Guide

This guide walks you through setting up the serverless backend for the **Azure Quiz Check** utility using Google Sheets, Google Gemini AI generation, and automated daily 9:00 AM Gmail notifications.

---

## Step 1: Create a Google Spreadsheet

1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name the spreadsheet: **`Azure Quiz Check Database`**.
3. Create two sheets (tabs) at the bottom:
   - **`QuestionBank`**
   - **`QuizSessions`**

---

## Step 2: Open Apps Script Editor & Paste Code

1. In your Google Sheet, click on **Extensions** &rarr; **Apps Script**.
2. Rename the project to **`AzureQuizCheck-Backend`**.
3. Replace all content in `Code.gs` with the code in [`Code.gs`](./Code.gs).

---

## Step 3: (Optional) Configure Gemini API Key in Apps Script for Daily 9 AM Generation

To have Google Apps Script automatically call Google Gemini AI every morning at 9:00 AM:
1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. In the Apps Script editor, click on **Project Settings** (gear icon on the left sidebar).
3. Under **Script Properties**, click **Add script property**:
   - **Property**: `GEMINI_API_KEY`
   - **Value**: `Your_Gemini_API_Key`
4. Click **Save script properties**.

---

## Step 4: Configure the Daily 9:00 AM Trigger

1. In the Apps Script editor function dropdown, select `createDaily9AMTrigger` and click **Run**.
2. Grant permissions when prompted.
3. This creates a time-driven trigger that generates 20 scenario-based questions via Gemini AI daily at 9:00 AM and sends a Gmail alert with deep link.

---

## Step 5: Deploy as Web App

1. Click the blue **Deploy** button (top right) &rarr; **New deployment**.
2. Click the gear icon next to "Select type" &rarr; choose **Web app**.
3. Configure settings:
   - **Description**: `Azure Quiz Check API v2 (Gemini AI)`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone`
4. Click **Deploy** and authorize the script.
5. Copy the **Web App URL** (e.g., `https://script.google.com/macros/s/.../exec`).

---

## Step 6: Connect Angular App

1. Open the Angular App &rarr; Navigate to **Utilities** &rarr; **Azure Quiz Check**.
2. Click **⚙️ Settings** in the dashboard.
3. Paste your **Google Apps Script Web App URL** and your **Google Gemini API Key**.
4. Click **Save & Connect**.
5. When you click **"Start a Fresh Quiz"**, the Angular application invokes Gemini AI to dynamically generate 20 scenario questions and simultaneously syncs the session to your Google Sheet!
