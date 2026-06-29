import React from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { useFrappeGetDocList, useFrappeDeleteDoc } from 'frappe-react-sdk';
import { Link, useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export const ExamLagList: React.FC = () => {
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
      message.success('Committee deleted successfully');
      mutate();
    } catch (err: any) {
      message.error(err.message || 'Failed to delete committee');
    }
  };

  const columns = [
    {
      title: 'Committee ID / Year',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Link to={`/TAQ_UI/exam_lag_data/${text}`} className="font-semibold text-indigo-600 hover:text-indigo-900">
          {text}
        </Link>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'creation',
      key: 'creation',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => navigate(`/TAQ_UI/exam_lag_data/${record.name}`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this committee?"
            onConfirm={() => handleDelete(record.name)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 m-0">Exam Committees</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/TAQ_UI/exam_lag_data/new')}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Create Committee
        </Button>
      </div>

      <Table
        dataSource={committees || []}
        columns={columns}
        rowKey="name"
        loading={isLoading}
        pagination={{ pageSize: 15 }}
        className="shadow-sm border rounded-lg overflow-hidden"
      />
    </div>
  );
};
