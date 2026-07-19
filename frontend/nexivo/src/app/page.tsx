"use client";

// Dashboard home. Shows a welcome + stats when authenticated, otherwise a
// prompt to sign in.

import Link from "next/link";
import {
  AppstoreOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Spin,
  Statistic,
  Tag,
  Typography,
} from "antd";

import { useAuth } from "@/hooks/auth";

export default function Home() {
  const { user, status, isAuthenticated } = useAuth();

  if (status === "loading") {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "60vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "60vh" }}>
        <Card style={{ maxWidth: 460, textAlign: "center" }}>
          <Typography.Title level={3}>Welcome to Nexivo</Typography.Title>
          <Typography.Paragraph type="secondary">
            Sign in to view your dashboard, manage products, and track orders.
          </Typography.Paragraph>
          <Flex gap="small" justify="center">
            <Link href="/login">
              <Button type="primary" size="large">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="large">Create account</Button>
            </Link>
          </Flex>
        </Card>
      </Flex>
    );
  }

  return (
    <div>
      <Flex align="center" gap="small" wrap style={{ marginBottom: 24 }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Welcome back, {user?.full_name || user?.username}
        </Typography.Title>
        {user?.is_admin && <Tag color="gold">Admin</Tag>}
        {user?.is_verified ? (
          <Tag color="green">Verified</Tag>
        ) : (
          <Tag color="orange">Unverified</Tag>
        )}
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="Products" value={0} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="Orders" value={0} prefix={<AppstoreOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Role"
              value={user?.role ?? "—"}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Empty description="Your recent activity will appear here." />
      </Card>
    </div>
  );
}
