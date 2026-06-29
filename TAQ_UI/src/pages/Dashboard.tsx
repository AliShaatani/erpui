import React from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import { useFrappeGetCall } from 'frappe-react-sdk';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

interface StatusGroup {
  workflow_state: string | null;
  count: number;
}

interface OfficeGroup {
  office: string | null;
  count: number;
}

interface DashboardSummary {
  total_preachers: number;
  total_committees: number;
  total_exam_groups: number;
  preachers_by_office: OfficeGroup[];
  preachers_by_status: StatusGroup[];
}

export const Dashboard: React.FC = () => {
  const { data, error, isLoading } = useFrappeGetCall(
    'taq_theme.taq_ui.api.get_dashboard_summary',
    {},
    'dashboard_summary'
  );

  const summary = data?.message as DashboardSummary | undefined;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" tip="Loading statistics..." />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-red-700">
        <h3 className="text-lg font-semibold">Error Loading Dashboard</h3>
        <p>Could not load database statistics. Please ensure you are logged in and the server is running.</p>
      </div>
    );
  }

  // Preachers by Status calculations
  const totalByStatus = summary.preachers_by_status.reduce((sum, item) => sum + item.count, 0) || 1;
  const statusColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Preachers by Office calculations
  const maxOfficeCount = Math.max(...summary.preachers_by_office.map(item => item.count), 1);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Taqafia Dashboard</h1>
      
      {/* KPI Stats Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Preachers Registered"
              value={summary.total_preachers}
              prefix={<UserOutlined className="mr-2 text-indigo-600" />}
              valueStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Active Committees"
              value={summary.total_committees}
              prefix={<TeamOutlined className="mr-2 text-emerald-600" />}
              valueStyle={{ color: '#10b981', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Scheduled Exams"
              value={summary.total_exam_groups}
              prefix={<CalendarOutlined className="mr-2 text-amber-600" />}
              valueStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Grid */}
      <Row gutter={[24, 24]}>
        {/* Preachers by Status (Workflow States) */}
        <Col xs={24} md={12}>
          <Card title="Preachers by Workflow Status" bordered={false} className="shadow-sm min-h-[350px]">
            {summary.preachers_by_status.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No data recorded</p>
            ) : (
              <div className="space-y-4">
                {summary.preachers_by_status.map((item, idx) => {
                  const stateLabel = item.workflow_state || 'Draft / Not Submitted';
                  const percent = Math.round((item.count / totalByStatus) * 100);
                  const color = statusColors[idx % statusColors.length];
                  
                  return (
                    <div key={stateLabel} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{stateLabel}</span>
                        <span className="text-gray-500 font-semibold">{item.count} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* Preachers by Office */}
        <Col xs={24} md={12}>
          <Card title="Preachers by Regional Office" bordered={false} className="shadow-sm min-h-[350px]">
            {summary.preachers_by_office.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No data recorded</p>
            ) : (
              <div className="space-y-4">
                {summary.preachers_by_office.map((item, idx) => {
                  const officeLabel = item.office || 'Unassigned';
                  const percent = Math.round((item.count / maxOfficeCount) * 100);
                  
                  return (
                    <div key={officeLabel} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{officeLabel}</span>
                        <span className="text-gray-500 font-semibold">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
