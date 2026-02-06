"use client";

import { useEffect, useState } from "react";
import { Container, Grid, Paper, Text, Group, SimpleGrid, Stack, ThemeIcon, Table, Badge, Loader, Center, RingProgress } from "@mantine/core";
import { IconCoin, IconReceipt2, IconUsers, IconAlertTriangle, IconTrendingUp, IconPackage } from "@tabler/icons-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";

interface SummaryData {
  revenue: number;
  transactions: number;
  lowStock: number;
  activeUsers: number;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface TopProductData {
  name: string;
  sold: number;
  stock: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface RecentTrxData {
  id: number;
  user: string;
  total: number;
  status: string;
  date: string;
}

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [recentTrx, setRecentTrx] = useState<RecentTrxData[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [resSum, resRev, resTop, resCat, resRec] = await Promise.all([
          fetch("/api/dashboard/summary").then((r) => r.json()),
          fetch("/api/dashboard/revenue-chart").then((r) => r.json()),
          fetch("/api/dashboard/top-products").then((r) => r.json()),
          fetch("/api/dashboard/category-stats").then((r) => r.json()),
          fetch("/api/dashboard/recent-transactions").then((r) => r.json()),
        ]);

        if (resSum.success) setSummary(resSum.data);
        if (resRev.success) setRevenueData(resRev.data);
        if (resTop.success) setTopProducts(resTop.data);
        if (resCat.success) setCategoryData(resCat.data);
        if (resRec.success) setRecentTrx(resRec.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <Container fluid py="xl" style={{ minHeight: "100vh" }}>
      <Stack gap="lg">
        <div>
          <Text size="xl" fw={700}>
            Dashboard Overview
          </Text>
          <Text c="dimmed" size="sm">
            Monitor your business performance in real-time
          </Text>
        </div>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <KPICard title="Total Revenue" value={formatRupiah(summary?.revenue || 0)} icon={IconCoin} color="blue" diff="This Month" />
          <KPICard title="Transactions" value={summary?.transactions.toString() || "0"} icon={IconReceipt2} color="teal" diff="Success Orders" />
          <KPICard title="Active Users" value={summary?.activeUsers.toString() || "0"} icon={IconUsers} color="violet" diff="Monthly Active" />
          <KPICard
            title="Low Stock Alert"
            value={summary?.lowStock.toString() || "0"}
            icon={IconAlertTriangle}
            color="red"
            diff="Items need restock"
          />
        </SimpleGrid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper shadow="sm" radius="md" p="md" h="100%">
              <Text fw={600} mb="md">
                Revenue Trend (Last 30 Days)
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(str) => str.substring(8, 10)} tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(val) => new Intl.NumberFormat("en", { notation: "compact" }).format(val)} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number | undefined) => formatRupiah(value ?? 0)} labelFormatter={(label) => `Date: ${label}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#228be6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper shadow="sm" radius="md" p="md" h="100%">
              <Text fw={600} mb="md">
                Sales by Category
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number | undefined) => formatRupiah(value ?? 0)} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" radius="md" p="md">
              <Text fw={600} mb="md">
                Top 5 Best Selling Products
              </Text>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart layout="vertical" data={topProducts} margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="sold" fill="#40c057" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" radius="md" p="md" h="100%">
              <Group justify="space-between" mb="md">
                <Text fw={600}>Recent Transactions</Text>
                <Badge variant="light" color="gray">
                  Last 5
                </Badge>
              </Group>

              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Total</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {recentTrx.map((trx) => (
                    <Table.Tr key={trx.id}>
                      <Table.Td style={{ fontSize: "12px" }}>{trx.user}</Table.Td>
                      <Table.Td style={{ fontWeight: 500 }}>{formatRupiah(trx.total)}</Table.Td>
                      <Table.Td>
                        <StatusBadge status={trx.status} />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

const KPICard = ({ title, value, icon: Icon, color, diff }: { title: string; value: string; icon: any; color: string; diff: string }) => {
  return (
    <Paper withBorder p="md" radius="md" shadow="sm">
      <Group justify="space-between">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
          {title}
        </Text>
        <ThemeIcon color={color} variant="light" size="lg" radius="md">
          <Icon size="1.2rem" stroke={1.5} />
        </ThemeIcon>
      </Group>

      <Group align="flex-end" gap="xs" mt={25}>
        <Text fw={700} size="xl" style={{ lineHeight: 1 }}>
          {value}
        </Text>
      </Group>

      <Text c="dimmed" size="xs" mt="sm">
        {diff}
      </Text>
    </Paper>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  let color = "gray";
  if (status === "PAID") color = "blue";
  if (status === "SENT") color = "yellow";
  if (status === "COMPLETED") color = "green";
  if (status === "CANCELLED") color = "red";

  return (
    <Badge color={color} size="sm" variant="light">
      {status}
    </Badge>
  );
};

export default Dashboard;
