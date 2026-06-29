import React from 'react';
import { Layout as AntLayout, Menu, ConfigProvider, Button, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import arEG from 'antd/locale/ar_EG';
import enUS from 'antd/locale/en_US';
import { useFrappeAuth } from 'frappe-react-sdk';
import { Spin } from 'antd';

const { Header, Content, Sider } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { language, toggleLanguage, t, dir } = useLanguage();
  const location = useLocation();
  const { currentUser, isLoading: authLoading } = useFrappeAuth();

  React.useEffect(() => {
    if (!authLoading && !currentUser) {
      window.location.href = `/login?redirect-to=${window.location.pathname}`;
    }
  }, [currentUser, authLoading]);
  
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/waed_info')) return 'preachers';
    if (path.includes('/exam_lag_data')) return 'committees';
    if (path.includes('/exam_group_date')) return 'exams';
    return 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/TAQ_UI/">{t('menu_dashboard')}</Link>,
    },
    {
      key: 'preachers',
      icon: <UserOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/TAQ_UI/waed_info">{t('menu_preachers')}</Link>,
    },
    {
      key: 'committees',
      icon: <TeamOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/TAQ_UI/exam_lag_data">{t('menu_committees')}</Link>,
    },
    {
      key: 'exams',
      icon: <CalendarOutlined style={{ fontSize: '18px' }} />,
      label: <Link to="/TAQ_UI/exam_group_date">{t('menu_exams')}</Link>,
    },
  ];

  if (authLoading || !currentUser) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Spin size="large" tip="Verifying session..." />
      </div>
    );
  }

  return (
    <ConfigProvider
      direction={dir}
      locale={language === 'ar' ? arEG : enUS}
      theme={{
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 8,
          fontFamily: 'Cairo, Outfit, sans-serif',
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <AntLayout style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          theme="dark"
          style={{
            boxShadow: dir === 'rtl' ? '-2px 0 8px 0 rgba(29,35,41,.05)' : '2px 0 8px 0 rgba(29,35,41,.05)',
            zIndex: 10,
            background: '#0f172a',
          }}
        >
          <div style={{ height: '64px', margin: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ color: 'white', margin: 0, fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.5px', textAlign: 'center' }}>
              {t('portal_title')}
            </h1>
            <span style={{ color: '#94a3b8', fontSize: '10px', marginTop: '2px' }}>
              {t('portal_subtitle')}
            </span>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            style={{ background: '#0f172a', border: 'none' }}
          />
        </Sider>
        <AntLayout style={{ background: '#f8fafc' }}>
          <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
              {t(getSelectedKey() === 'dashboard' ? 'menu_dashboard' : `menu_${getSelectedKey()}`)}
            </h2>
            <Button
              type="text"
              icon={<TranslationOutlined />}
              onClick={toggleLanguage}
              style={{ fontWeight: 600, color: '#4f46e5' }}
            >
              {t('lang_toggle')}
            </Button>
          </Header>
          <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}>
            <div style={{ padding: 28, background: '#fff', minHeight: 'calc(100vh - 140px)', borderRadius: '12px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.02), 0 1px 2px -1px rgba(0,0,0,0.02)' }}>
              {children}
            </div>
          </Content>
        </AntLayout>
      </AntLayout>
    </ConfigProvider>
  );
};
