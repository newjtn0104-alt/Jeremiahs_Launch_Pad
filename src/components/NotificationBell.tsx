"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNewSubmissions = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Only fetch when bell is clicked open, not on interval
  useEffect(() => {
    if (isOpen) {
      fetchNewSubmissions();
    }
  }, [isOpen]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-semibold text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchNewSubmissions}
                disabled={isLoading}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500 text-center">
                No new notifications
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-slate-50 last:border-b-0 cursor-pointer hover:bg-slate-50 ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{notification.title}</span>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
