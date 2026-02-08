/**
 * Hashtag Utility Functions
 * Extract and process hashtags from content
 */

/**
 * Extract hashtags from text content
 * @param {string} content - Text content to extract hashtags from
 * @returns {Array<string>} - Array of unique hashtags (without #)
 */
const extractHashtags = (content) => {
  if (!content || typeof content !== 'string') {
    return [];
  }

  // Regex to match hashtags
  // Supports Korean, English, numbers
  // Must start with # and contain at least one character after it
  const hashtagRegex = /#([가-힣a-zA-Z0-9_]+)/g;
  
  const matches = content.match(hashtagRegex);
  
  if (!matches) {
    return [];
  }

  // Remove # symbol and get unique values
  const hashtags = matches
    .map(tag => tag.slice(1)) // Remove # prefix
    .filter((tag, index, self) => self.indexOf(tag) === index); // Get unique values

  return hashtags;
};

/**
 * Validate hashtag format
 * @param {string} hashtag - Hashtag to validate (without #)
 * @returns {boolean} - True if valid
 */
const isValidHashtag = (hashtag) => {
  if (!hashtag || typeof hashtag !== 'string') {
    return false;
  }

  // Must be 1-30 characters long
  // Can contain Korean, English, numbers, underscore
  const hashtagRegex = /^[가-힣a-zA-Z0-9_]{1,30}$/;
  
  return hashtagRegex.test(hashtag);
};

/**
 * Format content with hashtags as clickable links (for frontend display)
 * @param {string} content - Content with hashtags
 * @returns {string} - Content with hashtags wrapped in spans
 */
const formatHashtagsForDisplay = (content) => {
  if (!content || typeof content !== 'string') {
    return content;
  }

  const hashtagRegex = /#([가-힣a-zA-Z0-9_]+)/g;
  
  return content.replace(
    hashtagRegex, 
    '<span class="hashtag" data-hashtag="$1">#$1</span>'
  );
};

module.exports = {
  extractHashtags,
  isValidHashtag,
  formatHashtagsForDisplay
};
