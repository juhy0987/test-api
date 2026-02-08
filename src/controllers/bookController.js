const axios = require('axios');

/**
 * Book Controller
 * Handles book search using external APIs (Aladin)
 */

const ALADIN_API_KEY = process.env.ALADIN_API_KEY || 'ttbkey1';
const ALADIN_API_URL = 'http://www.aladin.co.kr/ttb/api/ItemSearch.aspx';

/**
 * Search books using Aladin API
 * Supports search by title, author, or ISBN
 */
const searchBooks = async (req, res, next) => {
  try {
    const { query, searchType = 'title', maxResults = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: '검색어를 입력해주세요.'
      });
    }

    // Determine search target based on searchType
    let queryType = 'Title'; // Default to title search
    if (searchType === 'author') {
      queryType = 'Author';
    } else if (searchType === 'isbn') {
      queryType = 'ISBN';
    }

    // Call Aladin API
    const response = await axios.get(ALADIN_API_URL, {
      params: {
        ttbkey: ALADIN_API_KEY,
        Query: query,
        QueryType: queryType,
        MaxResults: Math.min(maxResults, 50),
        start: 1,
        SearchTarget: 'Book',
        output: 'js',
        Version: '20131101'
      },
      timeout: 5000
    });

    if (!response.data || !response.data.item) {
      return res.status(200).json({
        success: true,
        data: {
          books: [],
          totalResults: 0
        }
      });
    }

    // Transform Aladin response to our format
    const books = response.data.item.map(book => ({
      isbn: book.isbn13 || book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      coverImageUrl: book.cover,
      description: book.description,
      pubDate: book.pubDate,
      link: book.link
    }));

    res.status(200).json({
      success: true,
      data: {
        books,
        totalResults: response.data.totalResults || books.length
      }
    });

  } catch (error) {
    console.error('Book search error:', error);
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        message: '도서 검색 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      });
    }

    res.status(500).json({
      success: false,
      message: '도서 검색 중 오류가 발생했습니다.'
    });
  }
};

/**
 * Get book details by ISBN
 */
const getBookByISBN = async (req, res, next) => {
  try {
    const { isbn } = req.params;

    if (!isbn) {
      return res.status(400).json({
        success: false,
        message: 'ISBN을 제공해주세요.'
      });
    }

    const response = await axios.get(ALADIN_API_URL, {
      params: {
        ttbkey: ALADIN_API_KEY,
        Query: isbn,
        QueryType: 'ISBN',
        MaxResults: 1,
        start: 1,
        SearchTarget: 'Book',
        output: 'js',
        Version: '20131101'
      },
      timeout: 5000
    });

    if (!response.data || !response.data.item || response.data.item.length === 0) {
      return res.status(404).json({
        success: false,
        message: '도서를 찾을 수 없습니다.'
      });
    }

    const book = response.data.item[0];
    const bookData = {
      isbn: book.isbn13 || book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      coverImageUrl: book.cover,
      description: book.description,
      pubDate: book.pubDate,
      link: book.link
    };

    res.status(200).json({
      success: true,
      data: bookData
    });

  } catch (error) {
    console.error('Book lookup error:', error);
    
    res.status(500).json({
      success: false,
      message: '도서 정보 조회 중 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  searchBooks,
  getBookByISBN
};
