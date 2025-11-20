// Natural Language Processing for task input

interface ParsedTask {
  title: string;
  dueDate?: number;
  priority?: boolean;
}

export function parseTaskInput(input: string): ParsedTask {
  let title = input.trim();
  let dueDate: number | undefined;
  let priority = false;

  // Priority keywords
  const priorityKeywords = ['important', 'urgent', 'priority', 'critical', 'asap', '!', '!!', '!!!'];
  const priorityRegex = new RegExp(`\\b(${priorityKeywords.join('|')})\\b|!+`, 'gi');
  
  if (priorityRegex.test(title)) {
    priority = true;
    title = title.replace(priorityRegex, '').trim();
  }

  // Time parsing (extract time before date parsing)
  let hours = 0;
  let minutes = 0;
  let hasTime = false;

  // Parse time formats: "at 3pm", "at 15:30", "3:30pm", "at 9am", "9:00"
  const timeRegex = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/gi;
  const timeMatch = title.match(timeRegex);
  
  if (timeMatch) {
    const lastTimeMatch = timeMatch[timeMatch.length - 1]; // Use last time mentioned
    const timeParts = lastTimeMatch.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    
    if (timeParts) {
      hours = parseInt(timeParts[1]);
      minutes = timeParts[2] ? parseInt(timeParts[2]) : 0;
      const meridiem = timeParts[3]?.toLowerCase();
      
      // Convert to 24-hour format
      if (meridiem === 'pm' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'am' && hours === 12) {
        hours = 0;
      }
      
      hasTime = true;
      title = title.replace(timeRegex, '').trim();
      title = title.replace(/\bat\s+/gi, '').trim(); // Clean up standalone "at"
    }
  }

  // Date parsing
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Month names and ordinal numbers
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const monthsShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  // Parse "22nd november", "november 22", "nov 22nd", "22 november", etc.
  const monthDateRegex = /\b(?:(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?)\b/gi;
  const monthDateMatch = title.match(monthDateRegex);
  
  if (monthDateMatch) {
    const match = monthDateMatch[0];
    const parts = match.toLowerCase().match(/(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s+)?([a-z]+)|([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?/i);
    
    if (parts) {
      const day = parts[1] ? parseInt(parts[1]) : parseInt(parts[4]);
      const monthName = (parts[2] || parts[3]).toLowerCase();
      
      let monthIndex = months.indexOf(monthName);
      if (monthIndex === -1) {
        monthIndex = monthsShort.indexOf(monthName);
      }
      
      if (monthIndex !== -1) {
        const targetDate = new Date(today.getFullYear(), monthIndex, day);
        
        // If the date is in the past, assume next year
        if (targetDate < today) {
          targetDate.setFullYear(today.getFullYear() + 1);
        }
        
        if (hasTime) {
          targetDate.setHours(hours, minutes, 0, 0);
        }
        
        dueDate = targetDate.getTime();
        title = title.replace(monthDateRegex, '').trim();
      }
    }
  }

  // Tomorrow
  if (!dueDate && /\btomorrow\b/i.test(title)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (hasTime) {
      tomorrow.setHours(hours, minutes, 0, 0);
    }
    dueDate = tomorrow.getTime();
    title = title.replace(/\btomorrow\b/gi, '').trim();
  }
  // Today
  else if (!dueDate && /\btoday\b/i.test(title)) {
    const todayDate = new Date(today);
    if (hasTime) {
      todayDate.setHours(hours, minutes, 0, 0);
    }
    dueDate = todayDate.getTime();
    title = title.replace(/\btoday\b/gi, '').trim();
  }
  // Tonight (implies today at evening time)
  else if (!dueDate && /\btonight\b/i.test(title)) {
    const tonight = new Date(today);
    tonight.setHours(hasTime ? hours : 20, hasTime ? minutes : 0, 0, 0);
    dueDate = tonight.getTime();
    title = title.replace(/\btonight\b/gi, '').trim();
  }
  // This morning/afternoon/evening
  else if (!dueDate && /\bthis (morning|afternoon|evening)\b/i.test(title)) {
    const match = title.match(/\bthis (morning|afternoon|evening)\b/i);
    const todayDate = new Date(today);
    
    if (hasTime) {
      todayDate.setHours(hours, minutes, 0, 0);
    } else {
      const timeOfDay = match![1].toLowerCase();
      if (timeOfDay === 'morning') todayDate.setHours(9, 0, 0, 0);
      else if (timeOfDay === 'afternoon') todayDate.setHours(14, 0, 0, 0);
      else if (timeOfDay === 'evening') todayDate.setHours(18, 0, 0, 0);
    }
    
    dueDate = todayDate.getTime();
    title = title.replace(/\bthis (morning|afternoon|evening)\b/gi, '').trim();
  }
  // Next week
  else if (!dueDate && /\bnext week\b/i.test(title)) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    if (hasTime) {
      nextWeek.setHours(hours, minutes, 0, 0);
    }
    dueDate = nextWeek.getTime();
    title = title.replace(/\bnext week\b/gi, '').trim();
  }
  // This week / this weekend
  else if (!dueDate && /\bthis (week|weekend)\b/i.test(title)) {
    const thisWeekend = new Date(today);
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
    thisWeekend.setDate(thisWeekend.getDate() + daysUntilSaturday);
    if (hasTime) {
      thisWeekend.setHours(hours, minutes, 0, 0);
    }
    dueDate = thisWeekend.getTime();
    title = title.replace(/\bthis (week|weekend)\b/gi, '').trim();
  }
  // Days of the week (monday, tuesday, etc.)
  else if (!dueDate && /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(title)) {
    const match = title.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (match) {
      const dayName = match[1].toLowerCase();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = days.indexOf(dayName);
      const currentDay = today.getDay();
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7; // Next occurrence
      
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysToAdd);
      if (hasTime) {
        targetDate.setHours(hours, minutes, 0, 0);
      }
      dueDate = targetDate.getTime();
      title = title.replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '').trim();
    }
  }
  // In X days/weeks/months
  else if (!dueDate && /\bin (\d+) (day|week|month)s?\b/i.test(title)) {
    const match = title.match(/\bin (\d+) (day|week|month)s?\b/i);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      const targetDate = new Date(today);
      
      if (unit === 'day') {
        targetDate.setDate(targetDate.getDate() + amount);
      } else if (unit === 'week') {
        targetDate.setDate(targetDate.getDate() + amount * 7);
      } else if (unit === 'month') {
        targetDate.setMonth(targetDate.getMonth() + amount);
      }
      
      if (hasTime) {
        targetDate.setHours(hours, minutes, 0, 0);
      }
      dueDate = targetDate.getTime();
      title = title.replace(/\bin (\d+) (day|week|month)s?\b/gi, '').trim();
    }
  }
  // Specific date formats: MM/DD, MM-DD, MM/DD/YY, MM-DD-YY, etc.
  else if (!dueDate && /\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/.test(title)) {
    const match = title.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
    if (match) {
      const month = parseInt(match[1]) - 1; // 0-indexed
      const day = parseInt(match[2]);
      let year = match[3] ? parseInt(match[3]) : today.getFullYear();
      
      // Handle 2-digit years
      if (match[3] && match[3].length === 2) {
        year = 2000 + year;
      }
      
      const targetDate = new Date(year, month, day);
      if (hasTime) {
        targetDate.setHours(hours, minutes, 0, 0);
      }
      dueDate = targetDate.getTime();
      title = title.replace(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/, '').trim();
    }
  }
  // If time was specified but no date, assume today
  else if (hasTime && !dueDate) {
    const todayDate = new Date(today);
    todayDate.setHours(hours, minutes, 0, 0);
    dueDate = todayDate.getTime();
  }

  // Clean up multiple spaces
  title = title.replace(/\s+/g, ' ').trim();

  return {
    title,
    dueDate,
    priority
  };
}
