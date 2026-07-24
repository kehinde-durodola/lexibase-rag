export const DUMMY_SESSION = {
  user: {
    name: "Alex Developer",
    email: "alex@lexibase.app",
    image: null,
  },
  tokens: 4, // 4 out of 10 remaining
};

export const DUMMY_DOCUMENT = {
  filename: "Q3_Enterprise_Architecture_Report_2026.pdf",
  createdAt: new Date().toISOString(),
};

export const DUMMY_CHAT_HISTORY = [
  { role: "user", content: "What is the primary conclusion of the Q3 report regarding our server infrastructure?" },
  { role: "assistant", content: "The primary conclusion of the Q3 report is that the current server infrastructure is reaching its maximum capacity and requires an immediate migration to a distributed microservices architecture by Q4. [1]" },
  { role: "user", content: "What are the estimated costs for this migration?" },
  { role: "assistant", content: "The estimated costs for the migration are projected to be $1.2M, primarily allocated to cloud provisioning and developer training. [2]" },
];
