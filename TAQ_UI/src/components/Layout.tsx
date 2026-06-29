import React from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Resolve current active menu item based on URL path
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/TAQ_UI/waed_info')) return 'preachers';
    if (path.startsWith('/TAQ_UI/exam_lag_data')) return 'committees';
    if (path.startsWith('/TAQ_UI/exam_group_date')) return 'exams';
    return 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/TAQ_UI/">Dashboard</Link>,
    },
    {
      key: 'preachers',
      icon: <UserOutlined />,
      label: <Link to="/TAQ_UI/waed_info">Preachers</Link>,
    },
    {
      key: 'committees',
      icon: <TeamOutlined />,
      label: <Link to="/TAQ_UI/exam_lag_data">Committees</Link>,
    },
    {
      key: 'exams',
      icon: <CalendarOutlined />,
      label: <Link to="/TAQ_UI/exam_group_date">Exam Scheduling</Link>,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        theme="dark"
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          zIndex: 10,
        }}
      >
        <div style={{ height: '64px', margin: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            TAQAFIA APP
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <AntLayout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#1f1f1f' }}>
            Taqafia Management Portal
          </h2>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360, borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};
