export const RISK_WEIGHTS = {
  linesChanged: {
    maxScore: 20,
    thresholds: [
      { value: 50, score: 5 },
      { value: 150, score: 10 },
      { value: 500, score: 15 },
      { value: Infinity, score: 20 },
    ],
  },
  filesChanged: {
    maxScore: 20,
    thresholds: [
      { value: 5, score: 5 },
      { value: 10, score: 10 },
      { value: 20, score: 15 },
      { value: Infinity, score: 20 },
    ],
    configFileMultiplier: 2,
    configPatterns: [
      "package.json",
      "package-lock.json",
      ".env",
      "docker",
      "nginx",
      "webpack",
      "tsconfig",
      "next.config",
      "vercel.json",
      ".github/workflows",
    ],
  },
  testResults: {
    maxScore: 20,
    noTests: 15,
    allPass: 0,
    flaky: 10,
    failed: 20,
  },
  timeFactor: {
    maxScore: 20,
    // Hour ranges (UTC) and their scores
    riskyHours: [
      { start: 21, end: 23, score: 15 },  // Late night
      { start: 0, end: 5, score: 15 },     // Early morning
    ],
    riskyDays: [5, 6],                      // Friday = 5, Saturday = 6
    fridayAfternoonScore: 20,               // Friday after 3pm
    weekendScore: 15,
    normalScore: 0,
  },
  authorHistory: {
    maxScore: 20,
    thresholds: [
      { rate: 0.1, score: 5 },
      { rate: 0.25, score: 10 },
      { rate: 0.5, score: 15 },
      { rate: Infinity, score: 20 },
    ],
  },
};