export class Logger {
    private context: string;
  
    constructor(context: string) {
      this.context = context;
    }
  
    info(message: string, data?: any): void {
      console.log(`[${this.context}] INFO: ${message}`, data || '');
    }
  
    error(message: string, error?: any): void {
      console.error(`[${this.context}] ERROR: ${message}`, error || '');
    }
  
    debug(message: string, data?: any): void {
      if (process.env.DEBUG) {
        console.debug(`[${this.context}] DEBUG: ${message}`, data || '');
      }
    }
  
    warn(message: string, data?: any): void {
      console.warn(`[${this.context}] WARN: ${message}`, data || '');
    }
  }