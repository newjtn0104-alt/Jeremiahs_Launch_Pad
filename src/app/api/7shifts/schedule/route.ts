import { NextResponse } from "next/server";

const API_KEYS: Record<string, string> = {
  "128416": "61626566643161622d353162392d343562302d393137322d656336666662626262373763",
  "341974": "31363834323462302d616439352d343066652d383462662d343334376162326537663037"
};

const COMPANIES: Record<string, string> = {
  "128416": "Pembroke Pines",
  "341974": "Coral Springs"
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
    if (userData) {
      const first = userData.first_name || '';
      const last = userData.last_name || '';
      const name = `${first} ${last.charAt(0)}.`.trim();
      if (name && name !== '.') {
        userCache[cacheKey] = name;
        return name;
      }
    }
  } catch (e) {
    console.error(`Error fetching user ${userId}:`, e);
  }
  
  return `User ${userId}`;
}

async function fetchSchedule(companyId: string, date: string) {
  try {
    // Build query params
    const params = new URLSearchParams({
      'start[gte]': `${date}T00:00:00`,
      'start[lte]': `${date}T23:59:59`
    });
    
    // Fetch shifts
    const shiftsData = await fetchFrom7shifts(`/company/${companyId}/shifts?${params}`, companyId);
    
    if (!shiftsData || !shiftsData.data || shiftsData.data.length === 0) {
      return [];
    }
    
    // Get unique user IDs
    const userIds = Array.from(new Set(shiftsData.data.map((s: Shift) => s.user_id)));
    
    // Fetch all user names in parallel
    const userNamePromises = (userIds as number[]).map(id => getUserName(id, companyId));
    const userNames = await Promise.all(userNamePromises);
    
    // Build user cache
    userIds.forEach((id, index) => {
      userCache[`${id}_${companyId}`] = userNames[index];
    });
    
    // Process shifts
    return shiftsData.data.map((shift: Shift, index: number) => ({
      id: shift.id || index,
      name: userCache[`${shift.user_id}_${companyId}`] || `User ${shift.user_id}`,
      role: getRoleName(shift.role_id),
      startTime: utcToEdt(shift.start),
      endTime: utcToEdt(shift.end),
      location: COMPANIES[companyId]
    }));
    
  } catch (error) {
    console.error(`Error fetching schedule for ${companyId}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    // Fetch schedules for both locations
    const [pembrokeSchedule, coralSchedule] = await Promise.all([
      fetchSchedule("128416", today),
      fetchSchedule("341974", today)
    ]);
    
    return NextResponse.json({
      pembrokePines: pembrokeSchedule,
      coralSprings: coralSchedule,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
