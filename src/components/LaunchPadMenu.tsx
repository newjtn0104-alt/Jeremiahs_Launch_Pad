"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Rocket, 
  Users, 
  Target, 
  Focus, 
  Sparkles, 
  DoorOpen, 
  Contact,
  Link2,
  BookOpen,
  GraduationCap,
  Package,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  FileText,
  Truck,
  Clock,
  PlusCircle,
  List,
  ClipboardCheck,
  Settings,
  Calendar
} from "lucide-react";
import WhosWorking from "./WhosWorking";
import TastyTargets from "./TastyTargets";
import FroggyFocuses from "./FroggyFocuses";
import SweetSaying from "./SweetSaying";
import SweetStart from "./SweetStart";
import RevelClosingLive from "./RevelClosingLive";
import CRM from "./CRM";
import CalendarView from "./CalendarView";
import QuickLinks from "./QuickLinks";
import ICMLearning from "./ICMLearning";
import Inventory from "./Inventory";
import InventoryForm from "./InventoryForm";
import Checklists from "./Checklists";
import DailyChecklistForm from "./DailyChecklistForm";
import SyscoOrders from "./SyscoOrders";
import LaborVariance from "./LaborVariance";
import ParSettings from "./ParSettings";
import NotificationBell from "./NotificationBell";

type MenuItem = "home" | "launchpad" | "learning" | "inventory" | "checklists" | "revel" | "crm" | "quicklinks" | "sysco" | "labor" | "schedule";
type LaunchPadSubItem = "whos-working" | "tasty-targets" | "froggy-focuses" | "sweet-start";
type LearningSubItem = "icm-learning";
type InventorySubItem = "view-inventory" | "submit-inventory" | "par-settings";
type ChecklistsSubItem = "view-checklists" | "daily-checklist";

export default function LaunchPadMenu() {
  const [activeItem, setActiveItem] = useState<MenuItem>("launchpad");
  const [activeLaunchPadItem, setActiveLaunchPadItem] = useState<LaunchPadSubItem>("sweet-start");
  const [activeLearningItem, setActiveLearningItem] = useState<LearningSubItem>("icm-learning");
  const [activeInventoryItem, setActiveInventoryItem] = useState<InventorySubItem>("view-inventory");
  const [activeChecklistsItem, setActiveChecklistsItem] = useState<ChecklistsSubItem>("view-checklists");
  const [expandedMenu, setExpandedMenu] = useState<MenuItem | null>("launchpad");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainMenuItems = [
    { id: "home" as MenuItem, label: "Home", icon: Home },
    { 
      id: "launchpad" as MenuItem, 
      label: "Launch Pad", 
      icon: Rocket,
      subItems: [
        { id: "whos-working" as LaunchPadSubItem, label: "Who's Working", icon: Users },
        { id: "tasty-targets" as LaunchPadSubItem, label: "Tasty Targets", icon: Target },
        { id: "froggy-focuses" as LaunchPadSubItem, label: "Froggy Focuses", icon: Focus },
        { id: "sweet-start" as LaunchPadSubItem, label: "Sweet Start", icon: Sparkles },
      ]
    },
    {
      id: "learning" as MenuItem,
      label: "Learning",
      icon: GraduationCap,
      subItems: [
        { id: "icm-learning" as LearningSubItem, label: "ICM Learning", icon: BookOpen },
      ]
    },
    { 
      id: "inventory" as MenuItem, 
      label: "Inventory", 
      icon: Package,
      subItems: [
        { id: "view-inventory" as InventorySubItem, label: "View Inventory", icon: List },
        { id: "submit-inventory" as InventorySubItem, label: "Submit Form", icon: PlusCircle },
        { id: "par-settings" as InventorySubItem, label: "Par Settings", icon: Settings },
      ]
    },
    { 
      id: "checklists" as MenuItem, 
      label: "Checklists", 
      icon: FileText,
      subItems: [
        { id: "view-checklists" as ChecklistsSubItem, label: "View Checklists", icon: List },
        { id: "daily-checklist" as ChecklistsSubItem, label: "Daily Checklist", icon: ClipboardCheck },
      ]
    },
    { id: "sysco" as MenuItem, label: "Sysco Orders", icon: Truck },
    { id: "labor" as MenuItem, label: "Labor Variance", icon: Clock },
    { id: "revel" as MenuItem, label: "Revel Closing", icon: DoorOpen },
    { id: "crm" as MenuItem, label: "CRM", icon: Contact },
    { id: "schedule" as MenuItem, label: "Schedule", icon: Calendar },
    { id: "quicklinks" as MenuItem, label: "Quick Links", icon: Link2 },
  ];

  const renderMainContent = () => {
    switch (activeItem) {
      case "home":
        return <CalendarView />;
      case "launchpad":
        const renderLaunchPadContent = () => {
          switch (activeLaunchPadItem) {
            case "whos-working":
              return <WhosWorking />;
            case "tasty-targets":
              return <TastyTargets />;
            case "froggy-focuses":
              return <FroggyFocuses />;
            case "sweet-start":
              return <SweetStart />;
            default:
              return <SweetStart />;
          }
        };
        const Content = renderLaunchPadContent();
        return Content ? (
          <div className="animate-in fade-in duration-300">
            {Content}
          </div>
        ) : null;
      case "learning":
        switch (activeLearningItem) {
          case "icm-learning":
            return <ICMLearning />;
          default:
            return <ICMLearning />;
        }
      case "inventory":
        switch (activeInventoryItem) {
          case "view-inventory":
            return <Inventory />;
          case "submit-inventory":
            return <InventoryForm />;
          case "par-settings":
            return <ParSettings />;
          default:
            return <Inventory />;
        }
      case "checklists":
        switch (activeChecklistsItem) {
          case "view-checklists":
            return <Checklists />;
          case "daily-checklist":
            return <DailyChecklistForm />;
          default:
            return <Checklists />;
        }
      case "sysco":
        return <SyscoOrders />;
      case "labor":
        return <LaborVariance />;
      case "revel":
        return <RevelClosingLive />;
      case "crm":
        return <CRM />;
      case "schedule":
        return <div className="p-8 text-center"><h2 className="text-xl font-semibold">Opening Schedule...</h2><p className="text-gray-500 mt-2">Redirecting to schedule page</p></div>;
      case "quicklinks":
        return <QuickLinks />;
      default:
        return null;
    }
  };

  const handleMenuClick = (itemId: MenuItem) => {
    if (itemId === "schedule") {
      window.location.href = "/schedule";
      return;
    }
    setActiveItem(itemId);
    setMobileMenuOpen(false);
    if (itemId === "launchpad" || itemId === "learning" || itemId === "inventory" || itemId === "checklists") {
      if (expandedMenu === itemId) {
        setExpandedMenu(null);
      } else {
        setExpandedMenu(itemId);
      }
    } else {
      setExpandedMenu(null);
    }
  };

  const renderMenuItems = () => (
    <>
      {mainMenuItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;
        const isExpanded = expandedMenu === item.id;
        const hasSubItems = item.subItems && item.subItems.length > 0;
        
        return (
          <div key={item.id}>
            <button
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                isActive 
                  ? "bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              } ${index !== 0 ? "border-t border-slate-100" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : ""}`} />
                <span>{item.label}</span>
              </div>
              {hasSubItems && (
                isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {hasSubItems && isExpanded && (
              <div className="bg-slate-50 border-t border-slate-100">
                {item.id === "launchpad" && item.subItems?.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = activeLaunchPadItem === subItem.id && activeItem === "launchpad";
                  
                  return (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActiveItem(item.id);
                        setActiveLaunchPadItem(subItem.id as LaunchPadSubItem);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 pl-12 text-left text-sm transition-colors ${
                        isSubActive
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <SubIcon className={`w-4 h-4 ${isSubActive ? "text-blue-600" : ""}`} />
                      <span>{subItem.label}</span>
                    </button>
                  );
                })}
                {item.id === "learning" && item.subItems?.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = activeLearningItem === subItem.id && activeItem === "learning";
                  
                  return (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActiveItem(item.id);
                        setActiveLearningItem(subItem.id as LearningSubItem);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 pl-12 text-left text-sm transition-colors ${
                        isSubActive
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <SubIcon className={`w-4 h-4 ${isSubActive ? "text-blue-600" : ""}`} />
                      <span>{subItem.label}</span>
                    </button>
                  );
                })}
                {item.id === "inventory" && item.subItems?.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = activeInventoryItem === subItem.id && activeItem === "inventory";
                  
                  return (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActiveItem(item.id);
                        setActiveInventoryItem(subItem.id as InventorySubItem);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 pl-12 text-left text-sm transition-colors ${
                        isSubActive
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <SubIcon className={`w-4 h-4 ${isSubActive ? "text-blue-600" : ""}`} />
                      <span>{subItem.label}</span>
                    </button>
                  );
                })}
                {item.id === "checklists" && item.subItems?.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = activeChecklistsItem === subItem.id && activeItem === "checklists";
                  
                  return (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActiveItem(item.id);
                        setActiveChecklistsItem(subItem.id as ChecklistsSubItem);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 pl-12 text-left text-sm transition-colors ${
                        isSubActive
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <SubIcon className={`w-4 h-4 ${isSubActive ? "text-blue-600" : ""}`} />
                      <span>{subItem.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Logo and Mobile Menu Button */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Jeremiah&apos;s LaunchPad</span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
              <nav 
                className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-slate-200">
                  <span className="font-semibold text-slate-700">Menu</span>
                </div>
                {renderMenuItems()}
              </nav>
            </div>
          )}

          {/* Desktop Sidebar Navigation */}
          <nav className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              {renderMenuItems()}
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Sweet Saying - Always Visible */}
            <div className="mb-6">
              <SweetSaying />
            </div>
            
            {/* Dynamic Content */}
            {renderMainContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
