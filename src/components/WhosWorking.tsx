"use client";

import { useState, useEffect } from "react";

interface StaffMember {
  id: number;
  name: string;
  role: string;
  startTime: string;
  endTime: string;
  location: string;
}

interface ScheduleData {
  pembrokePines: StaffMember[];
  coralSprings: StaffMember[];
}

export default function WhosWorking() {
  const [data, setData] = useState<ScheduleData>({
    pembrokePines: [],
    coralSprings: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchSchedule();
    // Update current time every minute
    const timeTimer = setInterval(() => setCurrentTime(new Date()), 60000);
    // Refresh schedule every 5 minutes
    const scheduleTimer = setInterval(fetchSchedule, 5 * 60 * 1000);
    
    return () => {
      clearInterval(timeTimer);
      clearInterval(scheduleTimer);
    };
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/7shifts/schedule");
      const scheduleData = await res.json();
      setData(scheduleData);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentlyWorking = (startTime: string, endTime: string) => {
    const now = currentTime;
    const start = new Date(`${now.toDateString()} ${startTime}`);
    const end = new Date(`${now.toDateString()} ${endTime}`);
    return now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-3xl">👥</span>
          Who&apos;s Working
        </h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-3xl">👥</span>
        Who&apos;s Working
      </h2>

      {/* Pembroke Pines */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-blue-200 mb-3 flex items-center gap-2">
          🏪 Pembroke Pines
          <span className="text-sm font-normal">
            ({data.pembrokePines.filter((s) => isCurrentlyWorking(s.startTime, s.endTime)).length} on duty)
          </span>
        </h3>
        <div className="space-y-2">
          {data.pembrokePines.map((member) => (
            <div
              key={member.id}
              className={`flex items-center justify-between p-3 rounded-xl ${
                isCurrentlyWorking(member.startTime, member.endTime)
                  ? "bg-green-500/20 border border-green-500/30"
                  : "bg-white/5 border border-white/10 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isCurrentlyWorking(member.startTime, member.endTime)
                      ? "bg-green-400 animate-pulse"
                      : "bg-gray-400"
                  }`}
                />
                <div>
                  <p className="text-white font-medium">{member.name}</p>
                  <p className="text-sm text-blue-200">{member.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm">
                  {member.startTime} - {member.endTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coral Springs */}
      <div>
        <h3 className="text-lg font-bold text-blue-200 mb-3 flex items-center gap-2">
          🏪 Coral Springs
          <span className="text-sm font-normal">
            ({data.coralSprings.filter((s) => isCurrentlyWorking(s.startTime, s.endTime)).length} on duty)
          </span>
        </h3>
        <div className="space-y-2">
          {data.coralSprings.map((member) => (
            <div
              key={member.id}
              className={`flex items-center justify-between p-3 rounded-xl ${
                isCurrentlyWorking(member.startTime, member.endTime)
                  ? "bg-green-500/20 border border-green-500/30"
                  : "bg-white/5 border border-white/10 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isCurrentlyWorking(member.startTime, member.endTime)
                      ? "bg-green-400 animate-pulse"
                      : "bg-gray-400"
                  }`}
                />
                <div>
                  <p className="text-white font-medium">{member.name}</p>
                  <p className="text-sm text-blue-200">{member.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm">
                  {member.startTime} - {member.endTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
