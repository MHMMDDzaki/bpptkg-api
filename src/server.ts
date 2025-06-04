import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const HOST = process.env.HOST || 'localhost';
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});