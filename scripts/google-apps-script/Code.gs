/**
 * Azure Quiz Check - Google Apps Script Backend (Gemini AI Integrated)
 * Attached to Google Sheets to provide:
 * 1. Auto-healing QuestionBank & QuizSessions persistence
 * 2. Automated 9:00 AM daily trigger using Google Gemini AI & Gmail notification with deep link
 * 3. Simultaneous sync endpoint for UI-generated Gemini AI quizzes (doPost & doGet)
 * 4. Robust REST Web App endpoints for Angular App (doGet, doPost)
 */

const SHEET_QUESTIONS = 'QuestionBank';
const SHEET_SESSIONS = 'QuizSessions';

// Configurable recipient email and Base URL
const DEFAULT_RECIPIENT_EMAIL = Session.getActiveUser().getEmail() || 'user@example.com';
const APP_BASE_URL = 'https://sachininmindfire.github.io/sachininmindfire.angular/#/utility/azure-quiz-check';

/**
 * Helper to safely retrieve the active Spreadsheet object
 */
function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}
  try {
    return SpreadsheetApp.getActive();
  } catch (e) {}
  return null;
}

/**
 * Helper to get or create the QuestionBank sheet
 */
function getQuestionSheet(ss) {
  let qSheet = ss.getSheetByName(SHEET_QUESTIONS);
  if (!qSheet) {
    qSheet = ss.insertSheet(SHEET_QUESTIONS);
    qSheet.appendRow([
      'QuestionId',
      'Domain',
      'QuestionText',
      'OptionA',
      'OptionB',
      'OptionC',
      'OptionD',
      'CorrectIndex',
      'Explanation',
      'Difficulty'
    ]);
    qSheet.setFrozenRows(1);
  }
  return qSheet;
}

/**
 * Helper to get or create the QuizSessions sheet
 */
function getSessionSheet(ss) {
  let sSheet = ss.getSheetByName(SHEET_SESSIONS);
  if (!sSheet) {
    sSheet = ss.insertSheet(SHEET_SESSIONS);
    sSheet.appendRow([
      'QuizId',
      'CreatedAt',
      'Type',
      'Status',
      'TotalQuestions',
      'Score',
      'QuestionIdsJSON',
      'UserAnswersJSON',
      'CompletedAt'
    ]);
    sSheet.setFrozenRows(1);
  }
  return sSheet;
}

/**
 * Initialization function - sets up sheets and column headers if not present
 */
function setupDatabase() {
  const ss = getSpreadsheet();
  if (!ss) {
    Logger.log('Error: No active spreadsheet found. Open script editor from your Google Sheet (Extensions > Apps Script).');
    return;
  }
  
  getQuestionSheet(ss);
  getSessionSheet(ss);
  Logger.log('Database initialized successfully with QuestionBank and QuizSessions sheets.');
}

/**
 * Creates the Daily 9:00 AM Time-Driven Trigger
 * Run this function once from Script Editor
 */
function createDaily9AMTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'createDailyScheduledQuiz') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('createDailyScheduledQuiz')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();

  Logger.log('Daily 9:00 AM trigger successfully scheduled.');
}

/**
 * Daily Trigger Handler:
 * Generates 20 questions (via Gemini AI if API key is set, or from QuestionBank),
 * logs the session, and sends Gmail notification with deep link.
 */
function createDailyScheduledQuiz() {
  const ss = getSpreadsheet();
  if (!ss) return;

  const qSheet = getQuestionSheet(ss);
  const sSheet = getSessionSheet(ss);

  const geminiApiKey = ScriptProperties.getProperty('GEMINI_API_KEY');
  let selectedQuestions = [];
  const quizId = 'QZ-DAILY-' + Utilities.formatDate(new Date(), 'GMT+0530', 'yyyyMMdd-HHmmss');

  if (geminiApiKey) {
    try {
      selectedQuestions = generateQuestionsWithGemini(geminiApiKey);
      saveQuestionsToBank(qSheet, selectedQuestions);
    } catch (e) {
      Logger.log('Gemini API daily generation failed, falling back to QuestionBank: ' + e);
    }
  }

  if (selectedQuestions.length === 0) {
    const allQuestions = getAllQuestions(qSheet);
    selectedQuestions = selectRandomQuestions(allQuestions, 20);
  }

  if (selectedQuestions.length === 0) {
    Logger.log('No questions available.');
    return;
  }

  const questionIds = selectedQuestions.map(q => q.id);
  const createdAt = new Date().toISOString();

  sSheet.appendRow([
    quizId,
    createdAt,
    'SCHEDULED_DAILY',
    'PENDING',
    selectedQuestions.length,
    0,
    JSON.stringify(questionIds),
    JSON.stringify({}),
    ''
  ]);

  sendDailyQuizEmail(quizId, selectedQuestions.length);
}

/**
 * Calls Google Gemini API to generate 20 scenario-based architectural questions
 */
function generateQuestionsWithGemini(apiKey) {
  const prompt = `
You are an Elite Azure Enterprise Solution Architect and Technical Assessment Lead evaluating senior cloud candidates (15+ years experience) against the Orion Innovation Azure Architect Job Description.

Generate exactly 20 challenging, scenario-based multiple choice questions mapped to the following 6 core competency domains:
1. Enterprise Solution Architecture & Scalability (Active-Active, Multi-Region, Well-Architected Framework, AKS, BCDR) - 5 Questions
2. Cloud Governance, FinOps & CAF (Landing Zones, Azure Policy, Management Groups, Cost Management, Reserved Instances, Hybrid Benefit) - 4 Questions
3. Security, Identity & Zero-Trust (Microsoft Entra ID, PIM, RBAC, Key Vault, Defender for Cloud, Network Security, Private Endpoints) - 4 Questions
4. DevOps, CI/CD & Service Accelerators (Bicep/Terraform modular accelerators, GitHub Actions/Azure Pipelines, OIDC Workload Identity, GTM enablers) - 3 Questions
5. Data, Modern Integration & Hybrid (Event Grid, Service Bus, APIM, Cosmos DB, Event Hubs, Azure Arc) - 2 Questions
6. Consulting, Presales & CTO Advisory (RFP estimation, Strangler Fig migration strategy, CIO/CTO trusted advisor, coaching & mentoring) - 2 Questions

Format Requirements:
Return ONLY valid JSON array with NO markdown backticks:
[
  {
    "id": "AZ-AI-${Utilities.getUuid().slice(0, 8)}",
    "domain": "Enterprise Solution Architecture & Scalability",
    "question": "Scenario...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correctIndex": 0,
    "explanation": "Detailed architectural rationale...",
    "difficulty": "Enterprise Architect (L400)"
  }
]
`;

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=' + encodeURIComponent(apiKey);
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const json = JSON.parse(response.getContentText());
  const text = json.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

/**
 * Save new questions to QuestionBank sheet if not existing
 */
function saveQuestionsToBank(qSheet, questions) {
  if (!questions || !Array.isArray(questions)) return;
  const existingMap = getAllQuestionsMap(qSheet);

  questions.forEach((q, idx) => {
    if (!q) return;
    const qId = q.id || ('AZ-AI-' + Utilities.formatDate(new Date(), 'GMT+0530', 'yyyyMMdd-HHmmss') + '-' + (idx + 1));
    if (!existingMap[qId]) {
      const opts = Array.isArray(q.options) ? q.options : [];
      qSheet.appendRow([
        qId,
        q.domain || 'Enterprise Solution Architecture & Scalability',
        q.question || '',
        opts[0] || '',
        opts[1] || '',
        opts[2] || '',
        opts[3] || '',
        q.correctIndex !== undefined ? Number(q.correctIndex) : 0,
        q.explanation || '',
        q.difficulty || 'Enterprise Architect (L400)'
      ]);
      existingMap[qId] = true;
    }
  });
}

/**
 * Send HTML Email Notification with deep link to Gmail
 */
function sendDailyQuizEmail(quizId, questionCount) {
  const recipient = DEFAULT_RECIPIENT_EMAIL;
  const takeQuizUrl = APP_BASE_URL + '?quizId=' + encodeURIComponent(quizId) + '&mode=take';
  const todayFormatted = Utilities.formatDate(new Date(), 'GMT+0530', 'EEEE, MMM dd, yyyy');

  const subject = '☁️ Daily Azure Knowledge Check (AI Generated) - ' + todayFormatted;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #0078d4, #005a9e); padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Azure Enterprise Knowledge Check</h1>
          <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Orion Azure Architect Refresher &bull; 9:00 AM AI Quiz</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 15px; line-height: 1.5;">Good morning,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            Your daily <strong>${questionCount} Questions</strong> Azure Architecture assessment is ready for <strong>${todayFormatted}</strong>, freshly generated via Gemini AI.
          </p>
          <div style="background: #f1f5f9; border-left: 4px solid #0078d4; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Session ID:</strong> ${quizId}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #334155;"><strong>Format:</strong> 20 Scenario Questions &bull; Real-time Architecture Rationales</p>
          </div>
          <div style="text-align: center; margin: 28px 0 16px 0;">
            <a href="${takeQuizUrl}" target="_blank" style="background: #0078d4; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; display: inline-block;">
              Start Today's Quiz &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  GmailApp.sendEmail(recipient, subject, '', { htmlBody: htmlBody });
  Logger.log('Notification email dispatched to: ' + recipient);
}

/**
 * HTTP GET Endpoint
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getDashboardData';
    const ss = getSpreadsheet();
    if (!ss) {
      return createJsonResponse({ success: false, error: 'No active spreadsheet bound to script' });
    }
    
    if (action === 'getDashboardData') {
      const data = getDashboardPayload(ss);
      return createJsonResponse({ success: true, data: data });
    }

    if (action === 'getQuiz') {
      const quizId = e.parameter.quizId;
      const quiz = getQuizPayload(ss, quizId);
      return createJsonResponse({ success: true, data: quiz });
    }

    return createJsonResponse({ success: false, message: 'Invalid action parameter: ' + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * HTTP POST Endpoint
 */
function doPost(e) {
  try {
    const ss = getSpreadsheet();
    if (!ss) {
      return createJsonResponse({ success: false, error: 'No active spreadsheet bound to script' });
    }

    let contents = {};
    if (e && e.postData && e.postData.contents) {
      contents = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      contents = e.parameter;
    }

    const action = contents.action;
    const qSheet = getQuestionSheet(ss);
    const sSheet = getSessionSheet(ss);

    // Simultaneous Sync Endpoint for UI-Generated Gemini Quizzes
    if (action === 'syncAiGeneratedQuiz') {
      const { quizId, type, questions } = contents;

      if (questions && Array.isArray(questions)) {
        saveQuestionsToBank(qSheet, questions);
      }

      const existingSession = findSessionRow(sSheet, quizId);
      if (!existingSession && quizId) {
        const qList = Array.isArray(questions) ? questions : [];
        sSheet.appendRow([
          quizId,
          new Date().toISOString(),
          type || 'ON_DEMAND',
          'IN_PROGRESS',
          qList.length,
          0,
          JSON.stringify(qList.map(q => q.id || '')),
          JSON.stringify({}),
          ''
        ]);
      }

      return createJsonResponse({
        success: true,
        message: 'AI Quiz synchronized successfully to Google Sheets',
        quizId: quizId,
        questionCount: (questions || []).length
      });
    }

    if (action === 'createOnDemandQuiz') {
      const allQuestions = getAllQuestions(qSheet);
      let selected = [];

      if (allQuestions.length > 0) {
        selected = selectRandomQuestions(allQuestions, 20);
      }

      const quizId = 'QZ-ONDEMAND-' + Utilities.formatDate(new Date(), 'GMT+0530', 'yyyyMMdd-HHmmss');

      sSheet.appendRow([
        quizId,
        new Date().toISOString(),
        'ON_DEMAND',
        'IN_PROGRESS',
        selected.length,
        0,
        JSON.stringify(selected.map(q => q.id)),
        JSON.stringify({}),
        ''
      ]);

      return createJsonResponse({
        success: true,
        data: {
          quizId: quizId,
          type: 'ON_DEMAND',
          questions: selected.map(cleanQuestionForStudent)
        }
      });
    }

    if (action === 'submitQuiz') {
      const { quizId, answers } = contents;
      const allQuestionsMap = getAllQuestionsMap(qSheet);
      const sessionRow = findSessionRow(sSheet, quizId);

      if (!sessionRow) {
        return createJsonResponse({ success: false, message: 'Quiz session not found in QuizSessions sheet' });
      }

      const questionIds = JSON.parse(sessionRow.data[6] || '[]');
      let score = 0;
      const questionResults = [];

      questionIds.forEach(qId => {
        const question = allQuestionsMap[qId];
        if (question) {
          const userAnswer = answers[qId] !== undefined ? Number(answers[qId]) : -1;
          const isCorrect = userAnswer === question.correctIndex;
          if (isCorrect) score++;

          questionResults.push({
            id: question.id,
            domain: question.domain,
            question: question.question,
            options: question.options,
            correctIndex: question.correctIndex,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            explanation: question.explanation,
            difficulty: question.difficulty
          });
        }
      });

      const rowIndex = sessionRow.rowIndex;
      sSheet.getRange(rowIndex, 4).setValue('COMPLETED');
      sSheet.getRange(rowIndex, 6).setValue(score);
      sSheet.getRange(rowIndex, 8).setValue(JSON.stringify(answers || {}));
      sSheet.getRange(rowIndex, 9).setValue(new Date().toISOString());

      return createJsonResponse({
        success: true,
        data: {
          quizId: quizId,
          score: score,
          totalQuestions: questionIds.length,
          percentage: questionIds.length > 0 ? Math.round((score / questionIds.length) * 100) : 0,
          results: questionResults
        }
      });
    }

    return createJsonResponse({ success: false, message: 'Unsupported POST action: ' + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

// ---------------- Helpers ----------------

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAllQuestions(qSheet) {
  const rows = qSheet.getDataRange().getValues();
  const questions = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;
    questions.push({
      id: String(r[0]),
      domain: String(r[1] || ''),
      question: String(r[2] || ''),
      options: [String(r[3] || ''), String(r[4] || ''), String(r[5] || ''), String(r[6] || '')],
      correctIndex: Number(r[7] || 0),
      explanation: String(r[8] || ''),
      difficulty: String(r[9] || 'Enterprise Architect (L400)')
    });
  }
  return questions;
}

function getAllQuestionsMap(qSheet) {
  const list = getAllQuestions(qSheet);
  const map = {};
  list.forEach(q => { map[q.id] = q; });
  return map;
}

function selectRandomQuestions(questions, count) {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function cleanQuestionForStudent(q) {
  return {
    id: q.id,
    domain: q.domain,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty
  };
}

function findSessionRow(sSheet, quizId) {
  const rows = sSheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(quizId)) {
      return { rowIndex: i + 1, data: rows[i] };
    }
  }
  return null;
}

function getDashboardPayload(ss) {
  const sSheet = getSessionSheet(ss);
  const rows = sSheet.getDataRange().getValues();
  const pending = [];
  const history = [];

  const allQuestionsMap = getAllQuestionsMap(getQuestionSheet(ss));
  const domainStats = {
    'Enterprise Solution Architecture & Scalability': { correct: 0, total: 0 },
    'Cloud Governance, FinOps & CAF': { correct: 0, total: 0 },
    'Security, Identity & Zero-Trust': { correct: 0, total: 0 },
    'DevOps, CI/CD & Service Accelerators': { correct: 0, total: 0 },
    'Data, Modern Integration & Hybrid': { correct: 0, total: 0 },
    'Consulting, Presales & CTO Advisory': { correct: 0, total: 0 }
  };

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue;

    const item = {
      quizId: String(r[0]),
      createdAt: String(r[1]),
      type: String(r[2]),
      status: String(r[3]),
      totalQuestions: Number(r[4] || 0),
      score: Number(r[5] || 0),
      completedAt: String(r[8] || '')
    };

    if (item.status === 'PENDING' || item.status === 'IN_PROGRESS') {
      pending.push(item);
    } else if (item.status === 'COMPLETED') {
      history.push(item);
      totalCompleted++;
      totalScore += item.score;
      totalPossible += item.totalQuestions;

      // Accumulate domain accuracy
      try {
        const qIds = JSON.parse(r[6] || '[]');
        const userAnswers = JSON.parse(r[7] || '{}');
        qIds.forEach(qId => {
          const q = allQuestionsMap[qId];
          if (q && domainStats[q.domain]) {
            domainStats[q.domain].total++;
            const ans = userAnswers[qId];
            if (ans !== undefined && Number(ans) === Number(q.correctIndex)) {
              domainStats[q.domain].correct++;
            }
          }
        });
      } catch (e) {}
    }
  }

  const accuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  const domainMastery = {};
  Object.keys(domainStats).forEach(d => {
    const stat = domainStats[d];
    domainMastery[d] = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
  });

  return {
    pendingQuizzes: pending.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    history: history.sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)),
    stats: {
      totalCompleted: totalCompleted,
      averageAccuracy: accuracy,
      pendingCount: pending.length,
      currentStreakDays: calculateStreak(history),
      domainMastery: domainMastery
    }
  };
}

function getQuizPayload(ss, quizId) {
  const sSheet = getSessionSheet(ss);
  const qSheet = getQuestionSheet(ss);
  const sessionRow = findSessionRow(sSheet, quizId);

  if (!sessionRow) return null;

  const allMap = getAllQuestionsMap(qSheet);
  let questionIds = [];
  try {
    questionIds = JSON.parse(sessionRow.data[6] || '[]');
  } catch (e) {
    questionIds = [];
  }

  const status = sessionRow.data[3];
  let userAnswers = {};
  try {
    userAnswers = JSON.parse(sessionRow.data[7] || '{}');
  } catch (e) {
    userAnswers = {};
  }

  const questions = questionIds.map(id => {
    const q = allMap[id];
    if (!q) return null;
    if (status === 'COMPLETED') {
      return {
        ...q,
        userAnswer: userAnswers[id] !== undefined ? userAnswers[id] : -1
      };
    }
    return cleanQuestionForStudent(q);
  }).filter(Boolean);

  return {
    quizId: String(sessionRow.data[0]),
    createdAt: String(sessionRow.data[1]),
    type: String(sessionRow.data[2]),
    status: String(sessionRow.data[3]),
    score: Number(sessionRow.data[5] || 0),
    totalQuestions: questionIds.length,
    questions: questions
  };
}

function calculateStreak(history) {
  if (!history || history.length === 0) return 0;
  return Math.min(history.length, 7);
}
