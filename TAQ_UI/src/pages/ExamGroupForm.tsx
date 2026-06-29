import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, DatePicker, TimePicker, Table, Space, Spin, message } from 'antd';
import { useFrappeGetDoc, useFrappeCreateDoc, useFrappeUpdateDoc, useFrappePostCall } from 'frappe-react-sdk';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { SaveOutlined, ArrowLeftOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { LinkSelect } from '../components/LinkSelect';

export const ExamGroupForm: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const isEdit = name && name !== 'new';
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { createDoc } = useFrappeCreateDoc();
  const { updateDoc } = useFrappeUpdateDoc();
  
  // Whitelisted method caller (using post call)
  const { call: callGetPreachers, loading: loadingPreachers } = useFrappePostCall(
    'taq_theme.taq_ui.api.get_preachers_stateless'
  );

  const { data: examGroupData, isLoading } = useFrappeGetDoc(
    'exam_group_date',
    isEdit ? name : '',
    { revalidateOnFocus: false }
  );

  const [preachersTable, setPreachersTable] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (examGroupData) {
      form.setFieldsValue({
        exam_day: examGroupData.exam_day ? dayjs(examGroupData.exam_day) : null,
        exam_time: examGroupData.exam_time ? dayjs(examGroupData.exam_time, 'HH:mm:ss') : null,
        examination_committee: examGroupData.examination_committee,
        count_to_exam: examGroupData.count_to_exam || '30',
      });
      setPreachersTable(examGroupData.waed_info_to_exam || []);
    } else {
      form.resetFields();
      form.setFieldValue('count_to_exam', '30');
      setPreachersTable([]);
    }
  }, [examGroupData, form]);

  const handleGetPreachers = async () => {
    const limit = form.getFieldValue('count_to_exam') || '30';
    try {
      const response = await callGetPreachers({ count_to_exam: parseInt(limit, 10) });
      // The API return shape: the result is inside response.message
      if (response && response.message) {
        const preachers = response.message as any[];
        if (preachers.length === 0) {
          message.warning('No preachers found with status "Scheduling an appointment"');
        } else {
          message.success(`Successfully loaded ${preachers.length} candidate preachers`);
        }
        
        const rows = preachers.map((p) => ({
          waed_info: p.name,
          full_name: p.namee,
          phone: p.phoone,
          office: p.office,
          address: p.place,
        }));
        
        setPreachersTable(rows);
      }
    } catch (err: any) {
      message.error(err.message || 'Failed to fetch candidate preachers');
    }
  };

  const handleSave = async (values: any) => {
    if (preachersTable.length === 0) {
      message.error('Please load candidate preachers using the "Get Preachers" button.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        exam_day: values.exam_day ? values.exam_day.format('YYYY-MM-DD') : '',
        exam_time: values.exam_time ? values.exam_time.format('HH:mm:ss') : '',
        examination_committee: values.examination_committee,
        count_to_exam: values.count_to_exam,
        waed_info_to_exam: preachersTable,
      };

      if (isEdit) {
        await updateDoc('exam_group_date', name, payload);
        message.success('Exam schedule updated successfully');
      } else {
        await createDoc('exam_group_date', payload);
        message.success('Exam schedule created successfully');
      }
      navigate('/TAQ_UI/exam_group_date');
    } catch (err: any) {
      message.error(err.message || 'Failed to save exam schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const deletePreacherRow = (index: number) => {
    setPreachersTable(preachersTable.filter((_, i) => i !== index));
  };

  const columns = [
    {
      title: 'Applicant ID',
      dataIndex: 'waed_info',
      key: 'waed_info',
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Office',
      dataIndex: 'office',
      key: 'office',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => deletePreacherRow(index)}
        />
      ),
    },
  ];

  if (isEdit && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" tip="Loading schedule details..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/TAQ_UI/exam_group_date')}>
            Back to List
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 m-0">
            {isEdit ? `Edit Exam Schedule: ${name}` : 'Schedule New Exam Group'}
          </h1>
        </Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => form.submit()}
          loading={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Save Schedule
        </Button>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={true}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm md:col-span-1">
            <Form.Item
              name="exam_day"
              label="Exam Day"
              rules={[{ required: true, message: 'Please select exam day' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="exam_time"
              label="Exam Time"
              rules={[{ required: true, message: 'Please select exam time' }]}
            >
              <TimePicker format="HH:mm:ss" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="examination_committee"
              label="Examination Committee"
              rules={[{ required: true, message: 'Please select examination committee' }]}
            >
              <LinkSelect doctype="exam_lag_data" placeholder="Select Committee" />
            </Form.Item>

            <Form.Item
              name="count_to_exam"
              label="Preachers Limit"
              rules={[{ required: true, message: 'Please enter limit' }]}
            >
              <Input type="number" min={1} />
            </Form.Item>

            <Button
              type="default"
              icon={<SearchOutlined />}
              onClick={handleGetPreachers}
              loading={loadingPreachers}
              className="w-full mt-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            >
              Get Preachers
            </Button>
          </Card>

          <Card className="shadow-sm md:col-span-3" title="Candidates to be Tested">
            <Table
              dataSource={preachersTable}
              columns={columns}
              rowKey="waed_info"
              pagination={false}
              className="border rounded-lg overflow-hidden"
              locale={{ emptyText: 'No candidate preachers loaded. Click "Get Preachers" on the left.' }}
            />
          </Card>
        </div>
      </Form>
    </div>
  );
};
