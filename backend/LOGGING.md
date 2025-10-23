# Logging Configuration

This backend uses **Winston** for structured, professional logging. All verbose Sequelize SQL logs have been suppressed by default.

## Log Levels

The application uses the following log levels (in order of severity):

1. **error** - Critical errors that need immediate attention
2. **warn** - Warning messages for potentially harmful situations
3. **info** - Informational messages about application state
4. **http** - HTTP request/response logs
5. **debug** - Detailed debugging information

## Log Output

### Console Logs
All logs are displayed in the console with:
- **Timestamp** - When the event occurred
- **Level** - The severity level (colored for visibility)
- **Message** - The log message

Example:
```
2025-10-19 13:14:55 [info]: Database connection established successfully
2025-10-19 13:15:01 [http]: GET /api/health 200 - 4ms
```

### File Logs
Logs are also written to files in the `logs/` directory:
- `logs/error.log` - Contains only error-level logs
- `logs/combined.log` - Contains all logs (all levels)

## Environment Variables

### LOG_SQL
Controls whether Sequelize SQL queries are logged.

```bash
# In .env file
LOG_SQL=false  # Default - No SQL logging (recommended)
LOG_SQL=true   # Enable SQL query logging (verbose, for debugging only)
```

**Note:** When `LOG_SQL=true`, you'll see every SQL query executed by Sequelize. This is useful for debugging but makes logs very verbose.

### NODE_ENV
Controls the overall log level:

```bash
NODE_ENV=development  # Shows debug, info, http, warn, error
NODE_ENV=production   # Shows only info, http, warn, error
```

## HTTP Request Logging

Every HTTP request is automatically logged with:
- HTTP method (GET, POST, PUT, DELETE, etc.)
- Request URL
- Status code
- Response time in milliseconds

Example:
```
2025-10-19 13:15:01 [http]: GET /api/health 200 - 4ms
2025-10-19 13:15:05 [http]: POST /api/auth/login 200 - 156ms
2025-10-19 13:15:10 [warn]: GET /api/customers/999 404 - 12ms
2025-10-19 13:15:15 [error]: POST /api/orders 500 - 89ms
```

## Using the Logger in Your Code

Import the logger in any file:

```javascript
import logger from './config/logger.js';

// Log at different levels
logger.error('This is an error message');
logger.warn('This is a warning');
logger.info('This is informational');
logger.http('This is an HTTP log');
logger.debug('This is debug information');
```

## Log Rotation (Future Enhancement)

Currently, log files grow indefinitely. For production, consider adding:
- `winston-daily-rotate-file` for automatic log rotation
- Maximum file size limits
- Automatic cleanup of old log files

Example implementation:
```javascript
import DailyRotateFile from 'winston-daily-rotate-file';

// Add to transports array in logger.js
new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
});
```

## Troubleshooting

### No logs appearing
- Check that the `logs/` directory exists
- Verify file permissions
- Check NODE_ENV setting

### Too many logs
- Set `LOG_SQL=false` in `.env`
- Change `NODE_ENV=production` to reduce log verbosity
- Adjust log level in `config/logger.js`

### Missing HTTP logs
- Ensure `requestLogger` middleware is registered in `server.js`
- Check that it's placed before route handlers

## Benefits of This Logging Setup

✅ **Clean Console Output** - No more verbose Sequelize SQL logs cluttering the terminal
✅ **Structured Logs** - Consistent format with timestamps and levels
✅ **Color-Coded** - Easy to spot errors and warnings at a glance
✅ **File Persistence** - All logs saved to files for later analysis
✅ **Request Tracking** - Every HTTP request logged with timing information
✅ **Flexible Configuration** - Control verbosity via environment variables
✅ **Production Ready** - Appropriate log levels for different environments
