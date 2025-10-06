import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  Warehouse,
  FolderOpen,
  Tag,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Repeat
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Manage Products", href: "/products", icon: Package },
  { name: "GRN Notes", href: "/grn", icon: FileText },
  { name: "Sales", href: "/sales", icon: Warehouse },
  { name: "Categories", href: "/categories", icon: FolderOpen },
  { name: "Brands", href: "/brands", icon: Tag },
  { name: "Suppliers", href: "/suppliers", icon: Users },
  { name: "Customer Returns", href: "/returns", icon: Repeat },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

interface SidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ isMobile = false, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={cn(
      "flex flex-col bg-card transition-all duration-300 h-full",
      isMobile ? "w-full border-0" : "border-r border-border",
      !isMobile && (isCollapsed ? "w-16" : "w-64")
    )}>
      {/* Header - Only show on desktop */}
      {!isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-primary">POS System</h2>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-secondary transition-colors"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </div>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold text-primary">Menu</h2>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title={!isMobile && isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {(isMobile || !isCollapsed) && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-md text-sm w-full transition-colors",
            "text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
          )}
          title={!isMobile && isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {(isMobile || !isCollapsed) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}