# Feature Specification: Azure Quiz Check Utility

**Feature Name**: Azure Quiz Check (`azure-quiz-check`)  
**Created**: 2026-08-15  
**Status**: Open / Approved (Option 1: Google Sheets + Google Apps Script)  
**Reference Document**: [Azure ArchitectOrion.docx](file:///c:/Users/Sachin%20Kumar/source/repos/sachininmindfire/sachininmindfire.angular/Azure%20ArchitectOrion.docx)  
**Target Profile**: Enterprise Azure Solution Architect (15+ Years Experience)

---

## 1. Overview & Business Value

The **Azure Quiz Check** utility is a continuous learning and daily knowledge assessment tool designed for senior and enterprise Azure Solution Architects. Based on the Orion Innovation Job Description ([Azure ArchitectOrion.docx](file:///c:/Users/Sachin%20Kumar/source/repos/sachininmindfire/sachininmindfire.angular/Azure%20ArchitectOrion.docx)), it systematically tests domain knowledge across high availability architecture, governance, security, DevOps, modern integrations, and CTO advisory / presales.

The solution integrates with **Google Sheets** and **Google Apps Script** as a zero-cost, serverless backend that automates daily 9:00 AM quiz creation, dispatches email notifications directly via Gmail, and provides RESTful endpoints to the Angular application.

---

## 2. User Stories & Acceptance Criteria

### User Story 1: Daily 9:00 AM Automated Quiz & Gmail Notification (Priority: P1)
**As an** Azure Architect,  
**I want** a 20-question quiz generated automatically every morning at 9:00 AM and an alert sent to my Gmail with a direct link,  
**So that** I maintain a consistent daily habit of refreshing my cloud knowledge.

#### Acceptance Criteria:
- **AC 1.1**: Google Apps Script time-driven trigger runs every day at 9:00 AM local time.
- **AC 1.2**: Creates a new pending quiz record with 20 randomly selected questions across the 6 competency domains.
- **AC 1.3**: Sends an email via `GmailApp` to the user's Gmail with quiz metadata and a deep link (`https://<app-domain>/utility/azure-quiz-check?quizId=<id>&mode=take`).
- **AC 1.4**: If the link is clicked from Gmail, the application opens directly in dedicated quiz mode.

---

### User Story 2: On-Demand Quiz Generation ("Start a Fresh Quiz") (Priority: P1)
**As a** user,  
**I want** to take an ad-hoc quiz at any time from the utility dashboard,  
**So that** I have full flexibility to test my knowledge whenever I have free time.

#### Acceptance Criteria:
- **AC 2.1**: A prominent `"Start a Fresh Quiz"` button is available on the main utility dashboard.
- **AC 2.2**: Clicking the button generates a new 20-question set on-demand via the Google Apps Script Web App API.
- **AC 2.3**: Opens the quiz session in a dedicated window or distraction-free mode.

---

### User Story 3: Quiz Management & History Dashboard (Priority: P1)
**As a** user,  
**I want** to view pending quizzes, historical attempts, scores, and review links on a unified dashboard,  
**So that** I can track my knowledge retention and learning progression over time.

#### Acceptance Criteria:
- **AC 3.1**: **Pending Quizzes Section**: Lists any uncompleted scheduled daily quizzes with a clear notification badge and `"Take Now"` button.
- **AC 3.2**: **Quiz History Table**: Displays all past attempts with columns for Date, Quiz Type (Daily / On-Demand), Score / Marks Secured (e.g. `18/20 (90%)`), Status, and Review Action.
- **AC 3.3**: **Performance Analytics**: Shows overall accuracy rate, completion streak, and competency breakdown (e.g., Governance vs. Security vs. Architecture).
- **AC 3.4**: **Review Mode**: Clicking an older completed quiz displays a read-only review of questions, user selections, correct answers, and architectural explanations.

---

### User Story 4: Dedicated Quiz Taking Mode (Priority: P1)
**As a** candidate/architect taking the quiz,  
**I want** an isolated, distraction-free interface with question navigation, timer, and instant scoring,  
**So that** I can focus entirely on the scenario-based architectural questions.

#### Acceptance Criteria:
- **AC 4.1**: Launches in a separate window or fullscreen modal view.
- **AC 4.2**: Displays 20 multiple-choice questions with 4 options each and question palette navigation (1–20).
- **AC 4.3**: Allows marking questions for review and navigating back and forth before final submission.
- **AC 4.4**: On submission, posts answers to Google Apps Script backend, computes marks, and presents instant score breakdown with explanations for each question.

---

## 3. Architecture & Google Backend Design (Option 1)

### 3.1. Google Sheets Schema
A dedicated Google Spreadsheet acts as the database with two primary sheets:

#### Sheet 1: `QuestionBank`
| Column | Type | Description |
| :--- | :--- | :--- |
| `QuestionId` | String | Unique question identifier (e.g., `AZ-Q001`) |
| `Domain` | String | Architecture, Governance, Security, DevOps, Data/Integration, Presales |
| `QuestionText` | Text | Scenario or architectural problem description |
| `OptionsJSON` | JSON String | Array of 4 options `["A. ...", "B. ...", "C. ...", "D. ..."]` |
| `CorrectOption` | String | Index or key of the correct option (`0`, `1`, `2`, `3`) |
| `Explanation` | Text | Detailed architectural rationale citing Well-Architected Framework |
| `Difficulty` | String | `L300` / `L400` / `Enterprise Architect` |

#### Sheet 2: `QuizSessions`
| Column | Type | Description |
| :--- | :--- | :--- |
| `QuizId` | String | Unique session ID (e.g., `QZ-20260815-0900`) |
| `CreatedAt` | Timestamp | Generation timestamp (ISO 8601) |
| `Type` | String | `SCHEDULED_DAILY` or `ON_DEMAND` |
| `Status` | String | `PENDING`, `IN_PROGRESS`, `COMPLETED` |
| `QuestionIdsJSON` | JSON String | Array of 20 selected Question IDs |
| `UserAnswersJSON` | JSON String | Array of chosen answers |
| `Score` | Number | Total marks secured (out of 20) |
| `CompletedAt` | Timestamp | Submission timestamp |

---

### 3.2. Google Apps Script Web App Implementation
- **Triggers**:
  - `createDailyScheduledQuiz()`: Time-driven trigger set to daily at 9:00 AM. Selects 20 questions, creates row in `QuizSessions`, and calls `GmailApp.sendEmail()`.
- **REST Endpoints (`doGet` / `doPost`)**:
  - `GET ?action=getDashboardData`: Returns list of pending quizzes, past history, and statistics.
  - `GET ?action=getQuiz&quizId=<id>`: Returns the 20 questions for the specified quiz session.
  - `POST ?action=createOnDemandQuiz`: Generates a new on-demand session and returns its ID.
  - `POST ?action=submitQuiz`: Accepts `QuizId` and user answers, calculates score, updates row in `QuizSessions`, and returns results with explanations.

---

## 4. Frontend Application Integration (Angular)

### 4.1. Navigation & Routing
1. **Utility Hub**: Add card in `src/app/components/pages/utility/utility.component.html`:
   - Title: **Azure Quiz Check**
   - Icon: ☁️ / 🧠
   - Description: Daily knowledge checks & architect-level scenario assessments for Azure Solution Architects.
2. **Routes**:
   - `/utility/azure-quiz-check` (Dashboard: Pending, History, Start Quiz button)
   - `/utility/azure-quiz-check/take/:quizId` (Isolated Quiz Runner)
   - `/utility/azure-quiz-check/review/:quizId` (Historical Review Mode)

### 4.2. Angular Service (`AzureQuizService`)
- Integrates with Google Apps Script Web App via Angular `HttpClient`.
- Handles caching, loading indicators, and error resilience.

---

## 5. Definition of Done (DoD)

1. **Google Backend**: Google Spreadsheet created with question bank mapped to Orion Azure Architect competencies, and Apps Script deployed as Web App with daily 9 AM trigger.
2. **Angular Utility**: Dashboard and Quiz Runner components developed matching design guidelines.
3. **Email Flow**: 9 AM trigger verified to send Gmail notification with working deep link.
4. **On-Demand Flow**: "Start a fresh quiz" instantly creates and launches a 20-question quiz.
5. **Persistence**: Scores and user attempts are saved to Google Sheets and reflected in historical records.
