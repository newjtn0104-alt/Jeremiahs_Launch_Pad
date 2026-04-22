"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  type: "checklist" | "inventory";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const fetchNewSubmissions = async () => {
    try {
      // Fetch checklists
      const checklistRes = await fetch("/api/checklist");
      const checklistData = await checklistRes.json();

      // Fetch inventory
      const inventoryRes = await fetch("/api/inventory");
      const inventoryData = await inventoryRes.json();

      const newNotifications: Notification[] = [];

      if (checklistData.success && checklistData.checklists) {
        checklistData.checklists.forEach((item: any) => {
          const submittedAt = new Date(item.submittedAt);
          if (submittedAt > lastCheck) {
            newNotifications.push({
              id: `checklist-${item.id}`,
              type: "checklist",
              title: "New Daily Checklist",
              message: `${item.employeeName} submitted from ${item.location}`,
              timestamp: item.submittedAt,
              read: false,
            });
          }
        });
      }

      if (inventoryData.success && inventoryData.submissions) {
        inventoryData.submissions.forEach((item: any) => {
          const submittedAt = new Date(item.submitted_at);
          if (submittedAt > lastCheck) {
            newNotifications.push({
              id: `inventory-${item.id}`,
              type: "inventory",
              title: "New Inventory Submission",
              message: `${item.employee_name} submitted from ${item.location}`,
              timestamp: item.submitted_at,
              read: false,
            });
          }
        });
      }

      if (newNotifications.length > 0) {
        setNotifications((prev) => [...newNotifications, ...prev]);
        setUnreadCount((prev) => prev + newNotifications.length);
      }

      setLastCheck(new Date());
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNewSubmissions();

    // Poll every 30 seconds
    const interval = setInterval(fetchNewSubmissions, 30000);

    return () => clearInterval(interval);
  }, [lastCheck]);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Mark all read
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="px-3 py-4 text-sm text-slate-500 text-center">
            No new notifications
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`px-3 py-3 cursor-pointer ${
                !notification.read ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{notification.title}</span>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  )}
                </div>
                <span className="text-xs text-slate-600">{notification.message}</span>
                <span className="text-xs text-slate-400">
                  {formatTime(notification.timestamp)}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
