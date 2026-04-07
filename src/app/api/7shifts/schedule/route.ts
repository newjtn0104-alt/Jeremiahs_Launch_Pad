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

interface TimePunch {
  id: number;
  user_id: number;
  clocked_in: string;
  clocked_out: string | null;
  role_id?: number;
  location_id: number;
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
    // User API returns data directly, not wrapped in 'data' property
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

async function fetchWhoIsWorking(companyId: string, date: string) {
  try {
    const locationId = LOCATIONS[companyId];
    
    // Fetch time punches for today
    const punchesData = await fetchFrom7shifts(
      `/company/${companyId}/time_punches?location_id=${locationId}&date=${date}`,
      companyId
    );
    
    if (!punchesData || !punchesData.data || punchesData.data.length === 0) {
      return [];
    }
    
    // Filter to only currently working (clocked_in but not clocked_out)
    const currentlyWorking = punchesData.data.filter((punch: TimePunch) => {
      return punch.clocked_in && !punch.clocked_out && !punch.deleted;
    });
    
    if (currentlyWorking.length === 0) {
      return [];
    }
    
    // Get unique user IDs
    const userIds = Array.from(new Set(currentlyWorking.map((p: TimePunch) => p.user_id)));
    
    // Fetch all user names in parallel
    const userNamePromises = (userIds as number[]).map(id => getUserName(id, companyId));
    const userNames = await Promise.all(userNamePromises);
    
    // Build user cache
    userIds.forEach((id, index) => {
      userCache[`${id}_${companyId}`] = userNames[index];
    });
    
    // Process punches
    return currentlyWorking.map((punch: TimePunch, index: number) => ({
      id: punch.id || index,
      name: userCache[`${punch.user_id}_${companyId}`] || `User ${punch.user_id}`,
      role: getRoleName(punch.role_id),
      clockedIn: utcToEdt(punch.clocked_in),
      shiftStart: utcToEdt(punch.clocked_in),
      shiftEnd: 'Working...',
      location: COMPANIES[companyId],
      isWorking: true
    }));
    
  } catch (error) {
    console.error(`Error fetching time punches for ${companyId}:`, error);
    return [];
  }
}

// Fallback to scheduled shifts if no one is clocked in
async function fetchScheduledShifts(companyId: string, date: string) {
  try {
    const params = new URLSearchParams({
      'start[gte]': `${date}T00:00:00`,
      'start[lte]': `${date}T23:59:59`
    });
    
    const shiftsData = await fetchFrom7shifts(
      `/company/${companyId}/shifts?${params}`,
      companyId
    );
    
    if (!shiftsData || !shiftsData.data || shiftsData.data.length === 0) {
      return [];
    }
    
    // Get unique user IDs
    const userIds = Array.from(new Set(shiftsData.data.map((s: any) => s.user_id)));
    
    // Fetch all user names in parallel
    const userNamePromises = (userIds as number[]).map(id => getUserName(id, companyId));
    const userNames = await Promise.all(userNamePromises);
    
    // Build user cache
    userIds.forEach((id, index) => {
      userCache[`${id}_${companyId}`] = userNames[index];
    });
    
    // Process shifts
    return shiftsData.data.map((shift: any, index: number) => ({
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
    const today = new Date().toISOString().split("T")[0];
    
    // Try to get who is actually working (clocked in)
    let [pembrokeWorking, coralWorking] = await Promise.all([
      fetchWhoIsWorking("128416", today),
      fetchWhoIsWorking("341974", today)
    ]);
    
    // If no one is clocked in, fall back to scheduled shifts
    const usingScheduled = pembrokeWorking.length === 0 && coralWorking.length === 0;
    
    if (pembrokeWorking.length === 0) {
      pembrokeWorking = await fetchScheduledShifts("128416", today);
    }
    
    if (coralWorking.length === 0) {
      coralWorking = await fetchScheduledShifts("341974", today);
    }
    
    return NextResponse.json({
      pembrokePines: pembrokeWorking,
      coralSprings: coralWorking,
      usingActualPunches: !usingScheduled,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching who's working:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
