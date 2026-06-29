import React from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { useFrappeGetDocList, useFrappeDeleteDoc } from 'frappe-react-sdk';
import { Link, useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export const ExamGroupList: React.FC = () => {
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
      message.success('Exam schedule deleted successfully');
      mutate();
    } catch (err: any) {
      message.error(err.message || 'Failed to delete exam schedule');
    }
  };

  const columns = [
    {
      title: 'Exam Schedule ID',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Link to={`/TAQ_UI/exam_group_date/${text}`} className="font-semibold text-indigo-600 hover:text-indigo-900">
          {text}
        </Link>
      ),
    },
    {
      title: 'Exam Day',
      dataIndex: 'exam_day',
      key: 'exam_day',
      render: (text: string) => text || 'TBD',
    },
    {
      title: 'Exam Time',
      dataIndex: 'exam_time',
      key: 'exam_time',
      render: (text: string) => text || 'TBD',
    },
    {
      title: 'Committee',
      dataIndex: 'examination_committee',
      key: 'examination_committee',
    },
    {
      title: 'Max Candidates',
      dataIndex: 'count_to_exam',
      key: 'count_to_exam',
      render: (val: any) => val || '30',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => navigate(`/TAQ_UI/exam_group_date/${record.name}`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this scheduled exam group?"
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
        <h1 className="text-2xl font-bold text-gray-800 m-0">Exam Scheduling</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/TAQ_UI/exam_group_date/new')}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Schedule Exam
        </Button>
      </div>

      <Table
        dataSource={examGroups || []}
        columns={columns}
        rowKey="name"
        loading={isLoading}
        pagination={{ pageSize: 15 }}
        className="shadow-sm border rounded-lg overflow-hidden"
      />
    </div>
  );
};
