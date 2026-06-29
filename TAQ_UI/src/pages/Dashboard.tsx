import React from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import { useFrappeGetCall } from 'frappe-react-sdk';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t, dir } = useLanguage();
  const { data, error, isLoading } = useFrappeGetCall(
    'taq_theme.taq_ui.api.get_dashboard_summary',
    {},
    'dashboard_summary'
  );

  const summary = data?.message as DashboardSummary | undefined;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" tip={t('loading')} />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-red-700 shadow-sm">
        <h3 className="text-lg font-bold">{t('error_loading')}</h3>
        <p className="text-sm mt-1">Please ensure you are connected to the network and your bench environment is active.</p>
      </div>
    );
  }

  // Calculate status statistics
  const totalByStatus = summary.preachers_by_status.reduce((sum, item) => sum + item.count, 0) || 1;
  const statusColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const maxOfficeCount = Math.max(...summary.preachers_by_office.map(item => item.count), 1);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-black text-slate-800 m-0">{t('menu_dashboard')}</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of outreach applications and examination processes</p>
      </div>

      {/* KPI Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <UserOutlined style={{ fontSize: '72px', color: '#4f46e5' }} />
            </div>
            <span className="text-sm font-semibold text-slate-500">{t('kpi_total_preachers')}</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600">{summary.total_preachers}</span>
              <span className="text-xs text-indigo-400 font-medium">Applicants</span>
            </div>
          </div>
        </Col>
        
        <Col xs={24} sm={8}>
          <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <TeamOutlined style={{ fontSize: '72px', color: '#10b981' }} />
            </div>
            <span className="text-sm font-semibold text-slate-500">{t('kpi_active_committees')}</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">{summary.total_committees}</span>
              <span className="text-xs text-emerald-400 font-medium">Panels</span>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div className="relative overflow-hidden rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/50 to-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <CalendarOutlined style={{ fontSize: '72px', color: '#f59e0b' }} />
            </div>
            <span className="text-sm font-semibold text-slate-500">{t('kpi_scheduled_exams')}</span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600">{summary.total_exam_groups}</span>
              <span className="text-xs text-amber-400 font-medium">Schedules</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Visual Analytics */}
      <Row gutter={[24, 24]}>
        {/* Status Chart */}
        <Col xs={24} md={12}>
          <Card 
            title={<span className="font-bold text-slate-700">{t('chart_status_title')}</span>} 
            bordered={false} 
            className="shadow-sm border border-slate-100 rounded-xl"
          >
            {summary.preachers_by_status.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-slate-400 text-sm">
                <UserOutlined style={{ fontSize: '24px' }} className="mb-2" />
                {t('no_data')}
              </div>
            ) : (
              <div className="space-y-5">
                {summary.preachers_by_status.map((item, idx) => {
                  const labelText = item.workflow_state || 'Draft';
                  const percent = Math.round((item.count / totalByStatus) * 100);
                  const barColor = statusColors[idx % statusColors.length];

                  return (
                    <div key={labelText} className="group">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold text-slate-600 transition-colors group-hover:text-slate-800">
                          {labelText}
                        </span>
                        <span className="text-slate-500 font-bold">
                          {item.count} <span className="text-xs font-normal text-slate-400">({percent}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${percent}%`, backgroundColor: barColor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* Office Chart */}
        <Col xs={24} md={12}>
          <Card 
            title={<span className="font-bold text-slate-700">{t('chart_office_title')}</span>} 
            bordered={false} 
            className="shadow-sm border border-slate-100 rounded-xl"
          >
            {summary.preachers_by_office.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-slate-400 text-sm">
                <TeamOutlined style={{ fontSize: '24px' }} className="mb-2" />
                {t('no_data')}
              </div>
            ) : (
              <div className="space-y-5">
                {summary.preachers_by_office.map((item) => {
                  const officeName = item.office || 'Unassigned';
                  const percent = Math.round((item.count / maxOfficeCount) * 100);

                  return (
                    <div key={officeName} className="group">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold text-slate-600 transition-colors group-hover:text-slate-800">
                          {officeName}
                        </span>
                        <span className="text-slate-500 font-bold">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-700 ease-out"
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
