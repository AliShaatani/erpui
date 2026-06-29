import React from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { useFrappeGetDocList, useFrappeDeleteDoc } from 'frappe-react-sdk';
import { Link, useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLanguage } from '../contexts/LanguageContext';

export const ExamGroupList: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { deleteDoc } = useFrappeDeleteDoc();

  const { data: examGroups, isLoading, mutate } = useFrappeGetDocList('exam_group_date', {
    fields: ['name', 'exam_day', 'exam_time', 'examination_committee', 'count_to_exam', 'creation'],
    orderBy: { field: 'creation', order: 'desc' },
    limit: 100,
  });

  const handleDelete = async (name: string) => {
    try {
      await deleteDoc('exam_group_date', name);
      message.success(t('save_success'));
      mutate();
    } catch (err: any) {
      message.error(err.message || t('save_error'));
    }
  };

  const columns = [
    {
      title: t('menu_exams') + ' ID',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Link to={`/TAQ_UI/exam_group_date/${text}`} className="font-bold text-indigo-600 hover:text-indigo-900 transition-colors">
          {text}
        </Link>
      ),
    },
    {
      title: t('exam_day'),
      dataIndex: 'exam_day',
      key: 'exam_day',
      render: (text: string) => text || '—',
    },
    {
      title: t('exam_time'),
      dataIndex: 'exam_time',
      key: 'exam_time',
      render: (text: string) => text || '—',
    },
    {
      title: t('exam_committee'),
      dataIndex: 'examination_committee',
      key: 'examination_committee',
    },
    {
      title: t('preachers_limit'),
      dataIndex: 'count_to_exam',
      key: 'count_to_exam',
      render: (val: any) => val || '30',
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => navigate(`/TAQ_UI/exam_group_date/${record.name}`)}
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
          <h1 className="text-2xl font-black text-slate-800 m-0">{t('menu_exams')}</h1>
          <p className="text-slate-500 text-sm mt-1">Configure examination dates, designate panels, and schedule candidates</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/TAQ_UI/exam_group_date/new')}
          className="bg-indigo-600 hover:bg-indigo-700 h-10 px-5 rounded-lg shadow-sm font-semibold"
        >
          {t('create_new')}
        </Button>
      </div>

      <Table
        dataSource={examGroups || []}
        columns={columns}
        rowKey="name"
        loading={isLoading}
        pagination={{ pageSize: 15 }}
        className="shadow-sm border border-slate-100 rounded-xl overflow-hidden"
      />
    </div>
  );
};
