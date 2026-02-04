/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: '입력 데이터가 유효하지 않습니다.',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    let message = '이미 사용 중인 값입니다.';
    
    if (field === 'email') {
      message = '이미 사용 중인 이메일입니다.';
    } else if (field === 'nickname') {
      message = '이미 사용 중인 닉네임입니다.';
    }
    
    return res.status(409).json({
      success: false,
      message,
      field
    });
  }

  // Sequelize database error
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      message: '데이터베이스 오류가 발생했습니다.'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '만료된 토큰입니다.'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || '서버 오류가 발생했습니다.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: '요청하신 리소스를 찾을 수 없습니다.'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
