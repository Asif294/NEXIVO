"use client";

// Login page. Uses `identifier` (username or phone) + password, matching
// the backend UserLoginSerializer.

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
  App as AntApp,
  Button,
  Card,
  Form,
  Input,
  Typography,
} from "antd";

import { useAuth } from "@/hooks/auth";
import { ApiError } from "@/lib/api";
import type { LoginPayload } from "@/types/auth.types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message } = AntApp.useApp();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: LoginPayload) => {
    setSubmitting(true);
    try {
      await login(values);
      message.success("Welcome back!");
      // Return to where the user came from, or the dashboard.
      router.push(searchParams.get("next") || "/");
    } catch (err) {
      const text =
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.";
      message.error(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#f5f5f5",
      }}
    >
      <Card style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Typography.Title level={3} style={{ color: "#1677ff", marginBottom: 4 }}>
            Nexivo
          </Typography.Title>
          <Typography.Text type="secondary">
            Sign in to your account
          </Typography.Text>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          disabled={submitting}
        >
          <Form.Item
            name="identifier"
            label="Username or phone"
            rules={[
              { required: true, message: "Enter your username or phone number" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username or phone number"
              autoComplete="username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="current-password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={submitting}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Typography.Text type="secondary">
            Don&apos;t have an account? <Link href="/register">Register</Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
