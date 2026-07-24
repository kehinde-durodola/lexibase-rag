export const APP_CONFIG = {
  // Business Logic
  MAX_DAILY_TOKENS: 10,
  MAX_FILE_SIZE_MB: 10,
  
  // AI & RAG Tuning
  CHUNK_SIZE: 500,
  CHUNK_OVERLAP: 100,
  VECTOR_MATCH_COUNT: 4, 
  
  // Models
  EMBEDDING_MODEL: "text-embedding-3-small",
  GENERATION_MODEL: "gpt-4o-mini",
}
