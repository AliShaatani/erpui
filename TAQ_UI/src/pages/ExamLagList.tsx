import React from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { useFrappeGetDocList, useFrappeDeleteDoc } from 'frappe-react-sdk';
import { Link, useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLanguage } from '../contexts/LanguageContext';

export const ExamLagList: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { deleteDoc } = useFrappeDeleteDoc();

  const { data: committees, isLoading, mutate } = useFrappeGetDocList('exam_lag_data', {
    fields: ['name', 'creation'],
    orderBy: { field: 'creation', order: 'desc' },
    limit: 100,
  });

  const handleDelete = async (name: string) => {
    try {
      await deleteDoc('exam_lag_data', name);
      message.success(t('save_success'));
      mutate();
    } catch (err: any) {
      message.error(err.message || t('save_error'));
    }
  };

  const columns = [
    {
      title: t('exam_committee') + ' ID',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Link to={`/TAQ_UI/exam_lag_data/${text}`} className="font-bold text-indigo-600 hover:text-indigo-900 transition-colors">
          {text}
        </Link>
      ),
    },
    {
      title: t('field_cert_date'),
      dataIndex: 'creation',
      key: 'creation',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => navigate(`/TAQ_UI/exam_lag_data/${record.name}`)}
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
          <h1 className="text-2xl font-black text-slate-800 m-0">{t('menu_committees')}</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage active assessment panels and oral exam boards</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/TAQ_UI/exam_lag_data/new')}
          className="bg-indigo-600 hover:bg-indigo-700 h-10 px-5 rounded-lg shadow-sm font-semibold"
        >
          {t('create_new')}
        </Button>
      </div>

      <Table
        dataSource={committees || []}
        columns={columns}
        rowKey="name"
        loading={isLoading}
        pagination={{ pageSize: 15 }}
        className="shadow-sm border border-slate-100 rounded-xl overflow-hidden"
      />
    </div>
  );
};
