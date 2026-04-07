import { NextResponse } from "next/server";

const REVEL_API_KEY = "6e9fca7c4284470f86525b2f91074b60";
const REVEL_API_SECRET = "27727fb730c243728f8230110ea4f33cff68f399443e4511ba1260caf9750fe6";
const BASE_URL = "https://jeremiahsice.revelup.com/resources";

const API_KEYS: Record<string, string> = {
  "128416": "61626566643161622d353162392d343562302d393137322d656336666662626262373763",
  "341974": "31363834323462302d616439352d343066652d383462662d343334376162326537663037"
};

const ESTABLISHMENTS: Record<string, number> = {
  "128416": 107,
  "341974": 17
};

const UTC_OFFSET = 4;

async function apiGet(endpoint: string, params?: Record<string, any>) {
  const url = new URL(`${BASE_URL}/${endpoint}/`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      "API-AUTHENTICATION": `${REVEL_API_KEY}:${REVEL_API_SECRET}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

async function fetchFrom7shifts(endpoint: string, companyId: string) {
  const url = `https://api.7shifts.com/v2${endpoint}`;
  const token = API_KEYS[companyId];
  
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    }
  });
  
  if (!response.ok) {
    throw new Error(`7shifts API error: ${response.status}`);
  }
  
  return response.json();
}

function utcToEdt(timeStr: string): string {
  if (!timeStr || !timeStr.includes('T')) return timeStr;
  
  const timePart = timeStr.split('T')[1].substring(0, 5);
  const [hour, minute] = timePart.split(':').map(Number);
  
  let edtHour = hour - UTC_OFFSET;
  if (edtHour < 0) edtHour += 24;
  
  const ampm = edtHour >= 12 ? 'PM' : 'AM';
  const displayHour = edtHour === 0 ? 12 : edtHour > 12 ? edtHour - 12 : edtHour;
  
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function getNameKey(name: string): string {
  const parts = name.split(' ');
  const first = parts[0]?.toLowerCase() || '';
  const lastInitial = parts[1]?.charAt(0)?.toLowerCase() || '';
  return `${first} ${lastInitial}`;
}

async function fetchRevelClockIns(companyId: string, date: string) {
  const estId = ESTABLISHMENTS[companyId];
  
  try {
    const timeData = await apiGet("TimeSheetEntry", {
      establishment: estId,
      clock_in__gte: `${date}T00:00:00`,
      clock_in__lte: `${date}T23:59:59`,
      limit: 100,
    });

    const entries = timeData.objects || [];
    
    const employeeIds = Array.from(new Set(entries.map((e: any) => {
      const empUrl = e.employee || '';
      return empUrl.split('/').filter(Boolean).pop();
    }).filter(Boolean)));

    const employeeNames: Record<string, string> = {};
    for (const empId of employeeIds) {
      try {
        const empData = await apiGet(`Employee/${empId}`);
        const first = empData.first_name || '';
        const last = empData.last_name || '';
        employeeNames[empId] = `${first} ${last}`.trim() || `Emp ${empId}`;
      } catch (e) {
        employeeNames[empId] = `Employee ${empId}`;
      }
    }

    return entries
      .filter((entry: any) => entry.clock_in)
      .map((entry: any) => {
        const empUrl = entry.employee || '';
        const empId = empUrl.split('/').filter(Boolean).pop();
        const wage = parseFloat(entry.role_wage || 0);
        const name = employeeNames[empId] || `Employee ${empId}`;
        
        return {
          id: entry.id,
          name: name,
          nameKey: getNameKey(name),
          role: wage > 0 ? 'Server' : 'Cashier',
          clockedIn: utcToEdt(entry.clock_in),
          clockedOut: entry.clock_out ? utcToEdt(entry.clock_out) : null,
          isClockedIn: true,
          source: 'revel'
        };
      });
      
  } catch (error) {
    console.error(`Error fetching Revel clock-ins for ${companyId}:`, error);
    return [];
  }
}

async function fetch7shiftsSchedule(companyId: string, date: string) {
  try {
    const params = new URLSearchParams({
      'start[gte]': `${date}T00:00:00`,
      'start[lte]': `${date}T23:59:59`
    });
    
    const shiftsData = await fetchFrom7shifts(
      `/company/${companyId}/shifts?${params}`,
      companyId
    );
    
    if (!shiftsData || !shiftsData.data) {
      return [];
    }
    
    const userCache: Record<string, string> = {};
    const userIds = Array.from(new Set(shiftsData.data.map((s: any) => s.user_id)));
    
    for (const userId of userIds) {
      try {
        const userData = await fetchFrom7shifts(`/users/${userId}`, companyId);
        const first = userData.first_name || '';
        const last = userData.last_name || '';
        userCache[userId] = `${first} ${last}`.trim() || `User ${userId}`;
      } catch (e) {
        userCache[userId] = `User ${userId}`;
      }
    }
    
    return shiftsData.data.map((shift: any) => {
      const name = userCache[shift.user_id] || `User ${shift.user_id}`;
      return {
        id: shift.id,
        name: name,
        nameKey: getNameKey(name),
        role: shift.role_id === 763773 ? 'Lead' : shift.role_id === 763774 ? 'Server' : 'Staff',
        shiftStart: utcToEdt(shift.start),
        shiftEnd: utcToEdt(shift.end),
        isScheduled: true,
        source: '7shifts'
      };
    });
    
  } catch (error) {
    console.error(`Error fetching 7shifts schedule for ${companyId}:`, error);
    return [];
  }
}

async function crossCheckAttendance(companyId: string, date: string) {
  const [revelClockIns, scheduledShifts] = await Promise.all([
    fetchRevelClockIns(companyId, date),
    fetch7shiftsSchedule(companyId, date)
  ]);
  
  // Create a map of who is clocked in by name key
  const clockedInMap = new Map<string, any>();
  revelClockIns.forEach((e: any) => {
    clockedInMap.set(e.nameKey, e);
    clockedInMap.set(e.name.toLowerCase(), e);
  });
  
  // Cross-check scheduled vs actual
  const combined = scheduledShifts.map((shift: any) => {
    let clockedIn = clockedInMap.get(shift.nameKey);
    if (!clockedIn) {
      clockedIn = clockedInMap.get(shift.name.toLowerCase());
    }
    
    return {
      ...shift,
      isClockedIn: !!clockedIn,
      clockedInTime: clockedIn?.clockedIn || null,
      clockedOutTime: clockedIn?.clockedOut || null,
      status: clockedIn ? 'working' : 'scheduled'
    };
  });
  
  // Add any Revel clock-ins not in the schedule (extra staff)
  const scheduledKeys = new Set(scheduledShifts.map((s: any) => s.nameKey));
  const extraStaff = revelClockIns.filter((e: any) => {
    return !scheduledKeys.has(e.nameKey);
  });
  
  return {
    staff: [...combined, ...extraStaff],
    summary: {
      scheduled: scheduledShifts.length,
      clockedIn: revelClockIns.length,
      noShows: scheduledShifts.length - revelClockIns.filter((e: any) => {
        return scheduledShifts.some((s: any) => s.nameKey === e.nameKey);
      }).length
    }
  };
}

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getTime() - (4 * 60 * 60 * 1000)).toISOString().split("T")[0];
    
    const [pembrokeData, coralData] = await Promise.all([
      crossCheckAttendance("128416", today),
      crossCheckAttendance("341974", today)
    ]);
    
    return NextResponse.json({
      pembrokePines: pembrokeData.staff,
      pembrokeSummary: pembrokeData.summary,
      coralSprings: coralData.staff,
      coralSummary: coralData.summary,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance data" },
      { status: 500 }
    );
  }
}
