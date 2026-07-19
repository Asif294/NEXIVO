"use client";

// App chrome: top navbar + collapsible sidebar, wrapping page content.
// On the auth routes (/login, /register) the chrome is hidden and children
// render on a bare canvas so those pages control their own layout.

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppstoreOutlined,
  DashboardOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ShopOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  App as AntApp,
  Avatar,
  Button,
  Dropdown,
  Layout,
  Menu,
  Space,
  Typography,
} from "antd";
import type { MenuProps } from "antd";

import { useAuth } from "@/hooks/auth";

const { Header, Sider, Content } = Layout;

const AUTH_ROUTES = new Set(["/login", "/register"]);

// Sidebar navigation. `key` doubles as the route it links to.
const SIDE_ITEMS: MenuProps["items"] = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/products", icon: <ShopOutlined />, label: "Products" },
  { key: "/orders", icon: <AppstoreOutlined />, label: "Orders" },
  { key: "/settings", icon: <SettingOutlined />, label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { message } = AntApp.useApp();
  const { user, isAuthenticated, status, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKeys = useMemo(() => {
    // Longest matching prefix wins so /products/1 highlights "Products".
    const match = (SIDE_ITEMS ?? [])
      .map((item) => item!.key as string)
      .filter((key) => key === "/" ? pathname === "/" : pathname.startsWith(key))
      .sort((a, b) => b.length - a.length)[0];
    return match ? [match] : [];
  }, [pathname]);

  // Auth pages: no navbar / sidebar.
  if (AUTH_ROUTES.has(pathname)) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await logout();
      message.success("Signed out");
      router.push("/login");
    } catch {
      message.error("Could not sign out. Please try again.");
    }
  };

  const userMenu: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: (
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontWeight: 600 }}>
            {user?.full_name || user?.username}
          </div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {user?.email}
          </Typography.Text>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign out",
      danger: true,
      onClick: handleLogout,
    },
  ];

  const showSidebar = isAuthenticated;

  return (
    <Layout style={{ minHeight: "100dvh" }}>
      {showSidebar && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          breakpoint="lg"
          collapsedWidth={64}
          theme="light"
          style={{ borderInlineEnd: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: collapsed ? 18 : 20,
              color: "#1677ff",
            }}
          >
            {collapsed ? "N" : "Nexivo"}
          </div>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            items={SIDE_ITEMS}
            onClick={({ key }) => router.push(key)}
            style={{ borderInlineEnd: 0 }}
          />
        </Sider>
      )}

      <Layout>
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: 16,
            background: "#fff",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Space size="middle">
            {showSidebar && (
              <Button
                type="text"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed((c) => !c)}
              />
            )}
            <Link
              href="/"
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#1677ff",
                textDecoration: "none",
              }}
            >
              Nexivo
            </Link>
          </Space>

          {status === "loading" ? null : isAuthenticated ? (
            <Dropdown menu={{ items: userMenu }} trigger={["click"]}>
              <Space style={{ cursor: "pointer" }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span style={{ fontWeight: 500 }}>
                  {user?.full_name || user?.username}
                </span>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Link href="/login">
                <Button icon={<LoginOutlined />}>Login</Button>
              </Link>
              <Link href="/register">
                <Button type="primary" icon={<UserAddOutlined />}>
                  Register
                </Button>
              </Link>
            </Space>
          )}
        </Header>

        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
