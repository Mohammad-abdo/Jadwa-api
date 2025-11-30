import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# Database Configuration
# For XAMPP (default MySQL): mysql://root:@localhost:3306/jadwa_consulting
# If MySQL has password: mysql://root:YOUR_PASSWORD@localhost:3306/jadwa_consulting
DATABASE_URL="mysql://root:@localhost:3306/jadwa_consulting?schema=public"

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# JWT Configuration (Change these in production!)
JWT_SECRET=jadwa-super-secret-jwt-key-change-in-production-min-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=jadwa-super-secret-refresh-key-change-in-production-min-32-characters
JWT_REFRESH_EXPIRES_IN=30d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
`;

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created backend/.env file');
} else {
  console.log('ℹ️  backend/.env already exists');
}

