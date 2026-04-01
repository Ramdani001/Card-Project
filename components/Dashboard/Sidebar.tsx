import { ICON_MAP } from "@/config/menuMapping";
import { ActionIcon, Box, Group, NavLink, Stack, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface MenuData {
  id: string;
  label: string;
  url: string | null;
  icon: string | null;
  subMenus?: MenuData[];
}

interface SidebarProps {
  menus?: MenuData[];
  activeMenu: string;
  onMenuClick: (url: string) => void;
  onClose?: () => void;
}

const Sidebar = ({ menus = [], activeMenu, onMenuClick, onClose }: SidebarProps) => {
  const renderNav = (item: MenuData, depth = 0) => {
    const IconComponent = item.icon ? ICON_MAP[item.icon] : null;
    const subMenus = item.subMenus || [];
    const hasSubMenu = subMenus.length > 0;
    const isActive = item.url === activeMenu;

    return (
      <NavLink
        key={item.id}
        label={item.label}
        leftSection={
          IconComponent ? (
            <Box
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isActive ? "rgba(165,180,252,0.2)" : "rgba(255,255,255,0.05)",
                transition: "background 0.2s ease",
                flexShrink: 0,
              }}
            >
              <IconComponent size={16} stroke={isActive ? 2 : 1.5} color={isActive ? "#a5b4fc" : "#94a3b8"} />
            </Box>
          ) : null
        }
        active={isActive}
        childrenOffset={16}
        defaultOpened={hasSubMenu}
        onClick={() => {
          if (!hasSubMenu && item.url) {
            onMenuClick(item.url);
            onClose?.();
          }
        }}
        styles={{
          root: {
            borderRadius: 10,
            padding: "7px 10px",
            color: isActive ? "#e0e7ff" : "#94a3b8",
            fontWeight: isActive ? 600 : 500,
            fontSize: 13.5,
            background: isActive ? "rgba(99,102,241,0.18)" : "transparent",
            border: isActive ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
            transition: "all 0.18s ease",
            marginBottom: 2,
            "&:hover": {
              background: "rgba(255,255,255,0.06)",
              color: "#e2e8f0",
            },
          },
          label: {
            fontSize: depth > 0 ? 13 : 13.5,
            color: isActive ? "#e0e7ff" : "#94a3b8",
          },
          chevron: {
            color: "#64748b",
          },
        }}
      >
        {hasSubMenu && subMenus.map((sub) => renderNav(sub, depth + 1))}
      </NavLink>
    );
  };

  return (
    <>
      <style>{`
        .sidebar-wrap {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .sidebar-logo {
          padding: 20px 16px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 8px;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
          flex-shrink: 0;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 4px 10px;
        }

        .sidebar-nav::-webkit-scrollbar { width: 4px; }
        .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }

        .sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        .version-badge {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 10px;
          color: #475569;
          letter-spacing: 0.5px;
        }
      `}</style>

      <div className="sidebar-wrap">
        <div className="sidebar-logo">
          <Group justify="space-between" align="center">
            <Group gap={12}>
              <div className="logo-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="4" width="14" height="10" rx="2.5" stroke="white" strokeWidth="1.5" />
                  <circle cx="6.5" cy="9" r="2" fill="rgba(255,255,255,0.8)" />
                  <rect x="10" y="7.5" width="4" height="1.2" rx="0.6" fill="rgba(255,255,255,0.5)" />
                  <rect x="10" y="9.8" width="2.5" height="1.2" rx="0.6" fill="rgba(255,255,255,0.3)" />
                </svg>
              </div>
              <Box>
                <Text fw={800} size="sm" c="white" lh={1.2} style={{ letterSpacing: 0.5 }}>
                  TOKO KARTU
                </Text>
                <span className="version-badge">v1.0.0</span>
              </Box>
            </Group>

            {onClose && (
              <ActionIcon variant="subtle" color="gray" onClick={onClose} hiddenFrom="sm" style={{ color: "#64748b" }}>
                <IconX size={18} />
              </ActionIcon>
            )}
          </Group>
        </div>

        <div className="sidebar-nav">
          {menus.length === 0 ? (
            <Text size="xs" c="dimmed" p="md" ta="center">
              No menu data
            </Text>
          ) : (
            <Stack gap={0}>{menus.map((item) => renderNav(item))}</Stack>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
