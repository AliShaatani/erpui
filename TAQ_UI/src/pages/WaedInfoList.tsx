import React, { useState } from 'react';
import { Table, Button, Space, Input, Select, Tag, Popconfirm, message } from 'antd';
import { useFrappeGetCall, useFrappeDeleteDoc } from 'frappe-react-sdk';
import { Link, useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { LinkSelect } from '../components/LinkSelect';
import { useLanguage } from '../contexts/LanguageContext';

export const WaedInfoList: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [officeFilter, setOfficeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [genderFilter, setGenderFilter] = useState<string | undefined>(undefined);

  const { deleteDoc } = useFrappeDeleteDoc();

  const { data, isValidating: isLoading, mutate } = useFrappeGetCall(
    'taq_theme.taq_ui.api.get_preachers_list',
    {
      search_text: searchText || undefined,
      office: officeFilter || undefined,
      status: statusFilter || undefined,
      gender: genderFilter || undefined,
      limit: 100,
    },
    `preachers_list_${searchText}_${officeFilter}_${statusFilter}_${genderFilter}`
  );

  const preachers = data?.message || [];


  const handleDelete = async (name: string) => {
    try {
      await deleteDoc('waed_info', name);
      message.success(t('save_success'));
      mutate();
    } catch (err: any) {
      message.error(err.message || t('save_error'));
    }
  };

  const columns = [
    {
      title: t('field_fullname'),
      dataIndex: 'namee',
      key: 'namee',
      render: (text: string, record: any) => (
        <Link to={`/TAQ_UI/waed_info/${record.name}`} className="font-bold text-indigo-600 hover:text-indigo-900 transition-colors">
          {text || record.name}
        </Link>
      ),
    },
    {
      title: t('field_national_id'),
      dataIndex: 'num_w',
      key: 'num_w',
    },
    {
      title: t('field_phone'),
      dataIndex: 'phoone',
      key: 'phoone',
    },
    {
      title: t('field_office'),
      dataIndex: 'office',
      key: 'office',
    },
    {
      title: t('field_gender'),
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => gender || '—',
    },
    {
      title: t('field_status'),
      dataIndex: 'workflow_state',
      key: 'workflow_state',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Accepted') color = 'green';
        if (status === 'Rejected') color = 'red';
        if (status === 'Scheduling an appointment') color = 'orange';
        return <Tag color={color} className="font-semibold px-2 py-0.5 rounded">{status || 'Draft'}</Tag>;
      },
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => navigate(`/TAQ_UI/waed_info/${record.name}`)}
            className="hover:bg-blue-50 font-medium"
          >
            {t('edit')}
          </Button>
          <Popconfirm
            title={t('confirm_delete')}
            onConfirm={() => handleDelete(record.name)}
            okText={t('yes')}
            cancelText={t('no')}
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-red-50 font-medium">
              {t('delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 m-0">{t('menu_preachers')}</h1>
          <p className="text-slate-500 text-sm mt-1">Review, register, and update details for active preachers and applicants</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/TAQ_UI/waed_info/new')}
          className="bg-indigo-600 hover:bg-indigo-700 h-10 px-5 rounded-lg shadow-sm font-semibold"
        >
          {t('create_new')}
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-wrap gap-4 items-center">
        <div style={{ width: 240 }}>
          <Input
            placeholder={t('search_placeholder')}
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="h-10 rounded-lg"
          />
        </div>
        <div style={{ width: 200 }}>
          <LinkSelect
            doctype="Offices"
            value={officeFilter}
            onChange={setOfficeFilter}
            placeholder={t('field_office')}
          />
        </div>
        <div style={{ width: 180 }}>
          <Select
            placeholder={t('field_gender')}
            style={{ width: '100%', height: 40 }}
            value={genderFilter}
            onChange={setGenderFilter}
            allowClear
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
            ]}
            className="rounded-lg"
          />
        </div>
        <div style={{ width: 200 }}>
          <Select
            placeholder={t('field_status')}
            style={{ width: '100%', height: 40 }}
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            options={[
              { value: 'Draft', label: 'Draft' },
              { value: 'Scheduling an appointment', label: 'Scheduling an appointment' },
              { value: 'Accepted', label: 'Accepted' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
            className="rounded-lg"
          />
        </div>
      </div>

      <Table
        dataSource={preachers || []}
        columns={columns}
        rowKey="name"
        loading={isLoading}
        pagination={{ pageSize: 15 }}
        className="shadow-sm border border-slate-100 rounded-xl overflow-hidden"
      />
    </div>
  );
};
