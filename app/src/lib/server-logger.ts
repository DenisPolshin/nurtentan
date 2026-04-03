import fs from 'fs';
import path from 'path';

type LogLevel = 'info' | 'warn' | 'error';

class ServerLogger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.resolve(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, 'app.log');
    this.ensureLogDir();
  }

  private ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create log directory:', error);
      }
    }
  }

  private writeToFile(level: LogLevel, module: string, message: string, data?: any) {
    try {
      const timestamp = new Date().toISOString();
      const dataStr = data ? ` ${JSON.stringify(data)}` : '';
      const logLine = `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}${dataStr}\n`;
      
      // Ensure dir exists before writing (in case it was deleted)
      this.ensureLogDir();
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(module: string, message: string, data?: any) {
    this.writeToFile('info', module, message, data);
    console.log(`[INFO] [${module}] ${message}`, data || '');
  }

  warn(module: string, message: string, data?: any) {
    this.writeToFile('warn', module, message, data);
    console.warn(`[WARN] [${module}] ${message}`, data || '');
  }

  error(module: string, message: string, data?: any) {
    this.writeToFile('error', module, message, data);
    console.error(`[ERROR] [${module}] ${message}`, data || '');
  }
}

export const serverLogger = new ServerLogger();
