"use client";

// Registration page. Mirrors UserRegistrationSerializer fields. The backend
// does not return tokens on register, so on success we send the user to /login.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  App as AntApp,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Typography,
} from "antd";
import type { Dayjs } from "dayjs";

import { useAuth } from "@/hooks/auth";
import { ApiError } from "@/lib/api";
import type { RegisterPayload } from "@/types/auth.types";

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirm: string;
  full_name?: string;
  phone_number?: string;
  date_of_birth?: Dayjs;
}

export default function RegisterPage() {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const { register } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
      const payload: RegisterPayload = {
        username: values.username,
        email: values.email,
        password: values.password,
        full_name: values.full_name || undefined,
        phone_number: values.phone_number || undefined,
        date_of_birth: values.date_of_birth?.format("YYYY-MM-DD"),
      };
      await register(payload);
      message.success("Registration successful! Please sign in.");
      router.push("/login");
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
      <Card style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Typography.Title level={3} style={{ color: "#1677ff", marginBottom: 4 }}>
            Nexivo
          </Typography.Title>
          <Typography.Text type="secondary">Create your account</Typography.Text>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          disabled={submitting}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Choose a username" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              autoComplete="username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Enter your email" },
              { type: "email", message: "Enter a valid email address" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="you@example.com"
              autoComplete="email"
              size="large"
            />
          </Form.Item>

          <Form.Item name="full_name" label="Full name">
            <Input placeholder="Full name (optional)" size="large" />
          </Form.Item>

          <Form.Item name="phone_number" label="Phone number">
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Phone number (optional)"
              autoComplete="tel"
              size="large"
            />
          </Form.Item>

          <Form.Item name="date_of_birth" label="Date of birth">
            <DatePicker
              style={{ width: "100%" }}
              size="large"
              format="YYYY-MM-DD"
              placeholder="Select date (optional)"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Create a password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="new-password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm password"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm password"
              autoComplete="new-password"
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
              Create account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Typography.Text type="secondary">
            Already have an account? <Link href="/login">Sign in</Link>
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}
