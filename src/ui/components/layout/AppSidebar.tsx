import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  cn,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/ui/components/shadcn";
import { Bell, LogOut } from "lucide-react";
import { useAppSelector } from "@/infraestructure/store/hooks";
import { NavLink } from "react-router-dom";
import { menuItems } from "./menuConfig";
import { useLogout } from "@/hooks/auth/useLogout";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useIsMobile } from "@/hooks/shadcn/use-mobile";

export function AppSidebar() {
  const user = useAppSelector((state) => state.auth.user);
  const { logout } = useLogout();
  const { hasPermission } = usePermissions();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bell className="size-4" />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">
                  Alertas Académicas
                </span>
                <span className="truncate text-xs">Sistema de gestión</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2 gap-1.5">
          {menuItems
            .filter((item) =>
              item.permissions.some((permission) => hasPermission(permission)),
            )
            .map((item) => (
              <SidebarMenuItem key={item.title}>
                <NavLink to={item.url} className="w-full" onClick={handleLinkClick}>
                  {({ isActive }) => (
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 transition-colors",
                        isActive
                          ? "bg-primary/5! text-primary!"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive
                            ? "text-primary!"
                            : "text-sidebar-foreground/70",
                        )}
                      />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="" alt={user?.sub || "User"} />
                <AvatarFallback className="rounded-lg">
                  {user?.sub?.slice(0, 2).toUpperCase() || "CN"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{user?.sub}</span>
              </div>
              <div
                onClick={logout}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-md hover:bg-background group-data-[collapsible=icon]:hidden"
              >
                <LogOut className="h-4 w-4" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
