"use client";

// Client-side provider stack shared by the whole app:
// - AntdRegistry: collects antd's CSS-in-JS for SSR (no style flash).
// - ConfigProvider: brand theme tokens.
// - AntApp: enables the App-level message/notification/modal context.
// - AuthProvider: global auth state.

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App as AntApp, ConfigProvider, theme } from "antd";

import { AuthProvider } from "@/context/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "#1677ff",
            borderRadius: 8,
          },
        }}
      >
        <AntApp>
          <AuthProvider>{children}</AuthProvider>
        </AntApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}
