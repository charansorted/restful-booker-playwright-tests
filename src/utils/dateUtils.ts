export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  
  export function getDateRange(startDays: number, endDays: number): { checkin: string; checkout: string } {
    const checkin = addDays(new Date(), startDays);
    const checkout = addDays(new Date(), endDays);
    
    return {
      checkin: formatDate(checkin),
      checkout: formatDate(checkout)
    };
  }