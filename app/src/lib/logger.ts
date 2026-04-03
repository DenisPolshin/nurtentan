type LogEntry = {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  module: string;
  message: string;
  data?: any;
};

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  log(module: string, message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
        this.addEntry('info', module, message, data);
    }
  }

  warn(module: string, message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
        this.addEntry('warn', module, message, data);
    }
  }

  error(module: string, message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
        this.addEntry('error', module, message, data);
    }
  }

  private addEntry(level: LogEntry['level'], module: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined, // Deep copy
    };
    
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Console log for immediate visibility in dev tools
    console.log(`[${entry.timestamp}] [${module}] ${message}`, data || '');
  }

  getLogs() {
    return this.logs;
  }

  clear() {
    this.logs = [];
  }
}

export const logger = new Logger();
