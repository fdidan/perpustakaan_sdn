
// Stop words Bahasa Indonesia (sesuai proposal)
const STOP_WORDS = new Set([
  'di', 'ke', 'dari', 'dan', 'atau', 'adalah', 'ini', 'itu', 'yang', 'untuk',
  'pada', 'dengan', 'oleh', 'akan', 'telah', 'sudah', 'dapat', 'juga', 'sebagai',
  'dalam', 'serta', 'karena', 'jika', 'maka', 'seperti', 'antara', 'mereka',
  'kita', 'kami', 'saya', 'anda', 'dia', 'ia', 'nya', 'ada', 'tidak', 'bukan',
  'belum', 'hanya', 'masih', 'pernah', 'sangat', 'lebih', 'paling', 'setiap',
  'semua', 'beberapa', 'banyak', 'sedikit', 'lain', 'lainnya', 'sendiri'
]);

// Simple lemmatization rules for Bahasa Indonesia
const LEMMA_RULES = [
  { pattern: /^men(.+)$/i, replace: '$1' },    // men- prefix
  { pattern: /^mem(.+)$/i, replace: '$1' },    // mem- prefix
  { pattern: /^meng(.+)$/i, replace: '$1' },   // meng- prefix
  { pattern: /^me(.+)$/i, replace: '$1' },     // me- prefix
  { pattern: /^ber(.+)$/i, replace: '$1' },    // ber- prefix
  { pattern: /^ter(.+)$/i, replace: '$1' },    // ter- prefix
  { pattern: /^pe(.+)$/i, replace: '$1' },     // pe- prefix
  { pattern: /^di(.+)$/i, replace: '$1' },     // di- prefix
  { pattern: /^ke(.+)an$/i, replace: '$1' },   // ke-an affix
  { pattern: /(.+)an$/i, replace: '$1' },      // -an suffix
  { pattern: /(.+)kan$/i, replace: '$1' },     // -kan suffix
  { pattern: /(.+)i$/i, replace: '$1' },       // -i suffix
];

/**
 * 1. LOWERCASING & PUNCTUATION REMOVAL
 */
function preprocessText(text: string): string {
  return text
    .toLowerCase()                           // Lowercasing
    .replace(/[^\w\s]/g, ' ')               // Remove punctuation
    .replace(/\s+/g, ' ')                   // Normalize whitespace
    .trim();
}

/**
 * 2. TOKENIZATION
 */
function tokenize(text: string): string[] {
  return preprocessText(text)
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * 3. STOP WORDS REMOVAL
 */
function removeStopWords(tokens: string[]): string[] {
  return tokens.filter(token => 
    !STOP_WORDS.has(token) && token.length > 2
  );
}

/**
 * 4. LEMMATIZATION (Simple rule-based for Indonesian)
 */
function lemmatize(word: string): string {
  for (const rule of LEMMA_RULES) {
    if (rule.pattern.test(word)) {
      return word.replace(rule.pattern, rule.replace);
    }
  }
  return word;
}

/**
 * FULL TEXT PREPROCESSING PIPELINE
 */
function preprocessPipeline(text: string): string[] {
  const tokens = tokenize(text);
  const withoutStopWords = removeStopWords(tokens);
  const lemmatized = withoutStopWords.map(lemmatize);
  return lemmatized;
}

/**
 * Calculate Term Frequency
 * TF = T/L
 * T = frekuensi kemunculan term
 * L = jumlah kata unik dalam dokumen
 */
function calculateTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const uniqueTokens = new Set(tokens);
  const L = uniqueTokens.size; // Jumlah kata unik
  
  if (L === 0) return tf;
  
  // Hitung frekuensi setiap term (T)
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  
  // Normalize: TF = T/L
  for (const [token, count] of tf.entries()) {
    tf.set(token, count / L);
  }
  
  return tf;
}

/**
 * Calculate Inverse Document Frequency
 * IDF = log(N/n(i))
 * N = total dokumen
 * n(i) = jumlah dokumen yang mengandung term i
 */
function calculateIDF(documents: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const N = documents.length; // Total dokumen
  
  // Hitung document frequency untuk setiap term
  const df = new Map<string, number>();
  for (const doc of documents) {
    const uniqueTokens = new Set(doc);
    for (const token of uniqueTokens) {
      df.set(token, (df.get(token) || 0) + 1);
    }
  }
  
  // Hitung IDF = log(N/n(i))
  for (const [token, docFreq] of df.entries()) {
    idf.set(token, Math.log(N / docFreq));
  }
  
  return idf;
}

/**
 * Calculate TF-IDF vectors for all documents
 * TF-IDF = TF × IDF
 */
export function calculateTFIDF(documents: string[]): Map<number, Map<string, number>> {
  // Tokenize dan preprocess semua dokumen
  const tokenizedDocs = documents.map(doc => preprocessPipeline(doc));
  
  // Calculate IDF untuk semua terms
  const idf = calculateIDF(tokenizedDocs);
  
  // Calculate TF-IDF untuk setiap dokumen
  const tfidfVectors = new Map<number, Map<string, number>>();
  
  for (let i = 0; i < tokenizedDocs.length; i++) {
    const tokens = tokenizedDocs[i];
    const tf = calculateTF(tokens);
    const tfidf = new Map<string, number>();
    
    // TF-IDF = TF × IDF
    for (const [token, tfValue] of tf.entries()) {
      const idfValue = idf.get(token) || 0;
      tfidf.set(token, tfValue * idfValue);
    }
    
    tfidfVectors.set(i, tfidf);
  }
  
  return tfidfVectors;
}

/**
 * Calculate cosine similarity between two TF-IDF vectors
 */
export function cosineSimilarity(
  vector1: Map<string, number>,
  vector2: Map<string, number>
): number {
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  // Get all unique terms from both vectors
  const allTerms = new Set([...vector1.keys(), ...vector2.keys()]);
  
  for (const term of allTerms) {
    const val1 = vector1.get(term) || 0;
    const val2 = vector2.get(term) || 0;
    
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  }
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  return dotProduct / (magnitude1 * magnitude2);
}