import React, { useState } from 'react';
import { Table, Button, Space, Input, Select, Tag, Popconfirm, message } from 'antd';
import { useFrappeGetDocList, useFrappeDeleteDoc } from 'frappe-react-sdk';
import { Link, useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { LinkSelect } from '../components/LinkSelect';

export const WaedInfoList: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [officeFilter, setOfficeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [genderFilter, setGenderFilter] = useState<string | undefined>(undefined);

  const { deleteDoc } = useFrappeDeleteDoc();

  // Re-build Frappe filters array
  const getFilters = () => {
    const filters: any[] = [];
    if (searchText) {
      filters.push(['namee', 'like', `%${searchText}%`]);
    }
    if (officeFilter) {
      filters.push(['office', '=', officeFilter]);
    }
    if (statusFilter) {
      filters.push(['workflow_state', '=', statusFilter]);
    }
    if (genderFilter) {
      filters.push(['gender', '=', genderFilter]);
    }
    return filters;
  };

  const { data: preachers, isLoading, mutate } = useFrappeGetDocList('waed_info', {
    fields: ['name', 'namee', 'num_w', 'phoone', 'office', 'workflow_state', 'gender', 'creation'],
    filters: getFilters(),
    orderBy: { field: 'creation', order: 'desc' },
    limit: 100,
  });

  const handleDelete = async (name: string) => {
    try {
      await deleteDoc('waed_info', name);
      message.success('Preacher record deleted successfully');
      mutate();
    } catch (err: any) {
      message.error(err.message || 'Failed to delete record');
    }
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'namee',
      key: 'namee',
      render: (text: string, record: any) => (
        <Link to={`/TAQ_UI/waed_info/${record.name}`} className="font-semibold text-indigo-600 hover:text-indigo-900">
          {text || record.name}
        </Link>
      ),
    },
    {
      title: 'National ID',
      dataIndex: 'num_w',
      key: 'num_w',
    },
    {
      title: 'Phone',
      dataIndex: 'phoone',
      key: 'phoone',
    },
    {
      title: 'Office',
      dataIndex: 'office',
      key: 'office',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => gender || 'Unspecified',
    },
    {
      title: 'Status',
      dataIndex: 'workflow_state',
      key: 'workflow_state',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Accepted') color = 'green';
        if (status === 'Rejected') color = 'red';
        if (status === 'Scheduling an appointment') color = 'orange';
        return <Tag color={color}>{status || 'Draft'}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => navigate(`/TAQ_UI/waed_info/${record.name}`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this preacher application?"
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
        <h1 className="text-2xl font-bold text-gray-800 m-0">Preachers Registration</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/TAQ_UI/waed_info/new')}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          New Application
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-center">
        <div style={{ width: 220 }}>
          <Input
            placeholder="Search by name..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>
        <div style={{ width: 200 }}>
          <LinkSelect
            doctype="Offices"
            value={officeFilter}
            onChange={setOfficeFilter}
            placeholder="Filter by Office"
          />
        </div>
        <div style={{ width: 180 }}>
          <Select
            placeholder="Filter by Gender"
            style={{ width: '100%' }}
            value={genderFilter}
            onChange={setGenderFilter}
            allowClear
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
            ]}
          />
        </div>
        <div style={{ width: 200 }}>
          <Select
            placeholder="Filter by Status"
            style={{ width: '100%' }}
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
            options={[
              { value: 'Draft', label: 'Draft' },
              { value: 'Scheduling an appointment', label: 'Scheduling an appointment' },
              { value: 'Accepted', label: 'Accepted' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
          />
        </div>
      </div>

      <Table
        dataSource={preachers || []}
        columns={columns}
        rowKey="name"
        loading={isLoading}
        pagination={{ pageSize: 15 }}
        className="shadow-sm border rounded-lg overflow-hidden"
      />
    </div>
  );
};
