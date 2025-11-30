/**
 * Validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate({
      ...req.body,
      ...req.params,
      ...req.query,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    // Replace request data with validated data
    req.body = value.body || req.body;
    req.params = value.params || req.params;
    req.query = value.query || req.query;

    next();
  };
};

/**
 * Validate file upload
 */
export const validateFile = (options = {}) => {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf'],
  } = options;

  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    
    // Define allowed types for different owner types
    const messageTypes = [
      'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/m4a', 'audio/x-m4a',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    for (const file of files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          error: `File ${file.originalname} exceeds maximum size of ${maxSize / 1024 / 1024}MB`,
        });
      }

      // Allow images for article uploads
      if (req.body.ownerType === 'ARTICLE') {
        const imageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!imageTypes.includes(file.mimetype)) {
          return res.status(400).json({
            error: `File type ${file.mimetype} is not allowed. Only images are allowed for articles.`,
          });
        }
      } else if (req.body.ownerType === 'MESSAGE') {
        // Allow all media types for messages (images, audio, video, documents)
        if (!messageTypes.includes(file.mimetype)) {
          return res.status(400).json({
            error: `File type ${file.mimetype} is not allowed for messages`,
          });
        }
      } else if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: `File type ${file.mimetype} is not allowed`,
        });
      }
    }

    next();
  };
};

