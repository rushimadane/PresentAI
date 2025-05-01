
/**
 * Extracts keywords and key phrases from text content.
 * In a production environment, this would use NLP or AI services.
 * For demo purposes, we'll use a simple extraction method.
 */
export const extractKeywords = (text: string, maxKeywords: number = 10): string[] => {
  // A simple implementation - split the text and extract potential keywords
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 3) // Only words longer than 3 characters
    .filter(word => !commonWords.includes(word)); // Remove common words
  
  // Count word frequencies
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Extract key phrases (consecutive words that appear together)
  const phrases: Record<string, number> = {};
  const content = text.toLowerCase();
  
  words.forEach(word => {
    if (wordCounts[word] > 1) {
      // Look for phrases containing this word
      const regex = new RegExp(`\\b[\\w\\s]{0,20}${word}[\\w\\s]{0,20}\\b`, 'gi');
      const matches = content.match(regex) || [];
      
      matches.forEach(match => {
        const phrase = match.trim();
        if (phrase.split(/\s+/).length > 1 && phrase.length < 40) {
          phrases[phrase] = (phrases[phrase] || 0) + 1;
        }
      });
    }
  });
  
  // Combine individual high-frequency words and phrases
  const keywordCandidates = [
    ...Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords / 2)
      .map(([word]) => word),
    
    ...Object.entries(phrases)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords / 2)
      .map(([phrase]) => phrase)
  ];
  
  // Remove duplicates and limit to maxKeywords
  return [...new Set(keywordCandidates)].slice(0, maxKeywords);
};

// List of common words to exclude
const commonWords = [
  'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
  'his', 'from', 'they', 'will', 'would', 'there', 'their', 'what', 'about',
  'which', 'when', 'make', 'like', 'time', 'just', 'know', 'take', 'people',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'than', 'then',
  'look', 'only', 'come', 'over', 'think', 'also', 'back', 'after', 'work',
  'first', 'well', 'even', 'want', 'because', 'these', 'give', 'most'
];
