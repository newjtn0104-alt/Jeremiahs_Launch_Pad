import { NextResponse } from "next/server";

const API_KEYS: Record<string, string> = {
  "128416": "61626566643161622d353162392d343562302d393137322d656336666662626262373763",
  "341974": "31363834323462302d616439352d343066652d383462662d343334376162326537663037"
};

const COMPANIES: Record<string, string> = {
  "128416": "Pembroke Pines",
  "341974": "Coral Springs"
};

const LOCATIONS: Record<string, number> = {
  "128416": 160198, // Pembroke Pines
  "341974": 160199  // Coral Springs
};

const UTC_OFFSET = 4;

// Cache for user names
const userCache: Record<string, string> = {};

interface Shift {
  id: number;
  user_id: number;
  start: string;
  end: string;
  role_id?: number;
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

function getRoleName(roleId?: number): string {
  if (roleId === 763773) return 'Lead';
  if (roleId === 763774) return 'Server';
  return 'Staff';
}

async function fetchFrom7shifts(endpoint: string, companyId: string) {
  const url = `https://api.7shifts.com/v2${endpoint}`;
  const token = API_KEYS[companyId];
  
  console.log(`[7shifts API] Fetching: ${url}`);
  
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

async function getUserName(userId: number, companyId: string): Promise<string> {
  const cacheKey = `${userId}_${companyId}`;
  
  if (userCache[cacheKey]) {
    return userCache[cacheKey];
  }
  
  try {
    const userData = await fetchFrom7shifts(`/users/${userId}`, companyId);
    const first = userData.first_name || '';
    const last = userData.last_name || '';
    const name = `${first} ${last.charAt(0)}.`.trim();
    if (name && name !== '.') {
      userCache[cacheKey] = name;
      return name;
    }
  } catch (e) {
    console.error(`Error fetching user ${userId}:`, e);
  }
  
  return `User ${userId}`;
}

async function fetchScheduledShifts(companyId: string, date: string) {
  try {
    const params = new URLSearchParams({
      'start[gte]': `${date}T00:00:00`,
      'start[lte]': `${date}T23:59:59`
    });
    
    console.log(`[7shifts] Fetching shifts for ${COMPANIES[companyId]} on ${date}`);
    
    const shiftsData = await fetchFrom7shifts(
      `/company/${companyId}/shifts?${params}`,
      companyId
    );
    
    console.log(`[7shifts] Raw shifts count: ${shiftsData?.data?.length || 0}`);
    
    if (!shiftsData || !shiftsData.data || shiftsData.data.length === 0) {
      return [];
    }
    
    // Log raw shift data
    shiftsData.data.forEach((shift: Shift, i: number) => {
      console.log(`[7shifts] Shift ${i}: user_id=${shift.user_id}, role=${shift.role_id}, start=${shift.start}`);
    });
    
    // Get unique user IDs
    const userIds = Array.from(new Set(shiftsData.data.map((s: Shift) => s.user_id)));
    
    console.log(`[7shifts] Unique user IDs: ${userIds.join(', ')}`);
    
    // Fetch all user names in parallel
    const userNamePromises = (userIds as number[]).map(id => getUserName(id, companyId));
    const userNames = await Promise.all(userNamePromises);
    
    // Build user cache
    userIds.forEach((id, index) => {
      userCache[`${id}_${companyId}`] = userNames[index];
      console.log(`[7shifts] User ${id} = ${userNames[index]}`);
    });
    
    // Process shifts
    return shiftsData.data.map((shift: Shift, index: number) => ({
      id: shift.id || index,
      name: userCache[`${shift.user_id}_${companyId}`] || `User ${shift.user_id}`,
      role: getRoleName(shift.role_id),
      clockedIn: null,
      shiftStart: utcToEdt(shift.start),
      shiftEnd: utcToEdt(shift.end),
      location: COMPANIES[companyId],
      isWorking: false
    }));
    
  } catch (error) {
    console.error(`Error fetching schedule for ${companyId}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    // Clear cache on each request to get fresh data
    Object.keys(userCache).forEach(key => delete userCache[key]);
    
    const today = new Date().toISOString().split("T")[0];
    
    console.log(`[API] Fetching 7shifts schedule for ${today}`);
    
    const [pembrokeShifts, coralShifts] = await Promise.all([
      fetchScheduledShifts("128416", today),
      fetchScheduledShifts("341974", today)
    ]);
    
    console.log(`[API] Pembroke: ${pembrokeShifts.length} shifts`);
    console.log(`[API] Coral: ${coralShifts.length} shifts`);
    
    return NextResponse.json({
      pembrokePines: pembrokeShifts,
      coralSprings: coralShifts,
      usingActualPunches: false,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
