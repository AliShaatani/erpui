import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, DatePicker, TimePicker, Table, Space, Spin, message } from 'antd';
import { useFrappeGetDoc, useFrappeCreateDoc, useFrappeUpdateDoc, useFrappePostCall } from 'frappe-react-sdk';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { SaveOutlined, ArrowLeftOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { LinkSelect } from '../components/LinkSelect';
import { useLanguage } from '../contexts/LanguageContext';

export const ExamGroupForm: React.FC = () => {
  const { t } = useLanguage();
  const { name } = useParams<{ name: string }>();
  const isEdit = name && name !== 'new';
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { createDoc } = useFrappeCreateDoc();
  const { updateDoc } = useFrappeUpdateDoc();
  
  const { call: callGetPreachers, loading: loadingPreachers } = useFrappePostCall(
    'taq_theme.taq_ui.api.get_preachers_stateless'
  );

  const { data: examGroupData, isLoading } = useFrappeGetDoc(
    'exam_group_date',
    isEdit ? name : undefined,
    isEdit ? `exam_group_date_${name}` : null,
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
      if (response && response.message) {
        const preachers = response.message as any[];
        if (preachers.length === 0) {
          message.warning(t('get_preachers_warning'));
        } else {
          message.success(`${t('get_preachers_success')}: ${preachers.length}`);
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
      message.error(t('get_preachers_empty'));
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
        message.success(t('save_success'));
      } else {
        await createDoc('exam_group_date', payload);
        message.success(t('save_success'));
      }
      navigate('/TAQ_UI/exam_group_date');
    } catch (err: any) {
      message.error(err.message || t('save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const deletePreacherRow = (index: number) => {
    setPreachersTable(preachersTable.filter((_, i) => i !== index));
  };

  const columns = [
    {
      title: t('candidate_id'),
      dataIndex: 'waed_info',
      key: 'waed_info',
    },
    {
      title: t('candidate_name'),
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: t('candidate_phone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: t('candidate_office'),
      dataIndex: 'office',
      key: 'office',
    },
    {
      title: t('candidate_address'),
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: t('actions'),
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
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" tip={t('loading')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-4">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/TAQ_UI/exam_group_date')}>
            {t('back_to_list')}
          </Button>
          <h1 className="text-2xl font-black text-slate-800 m-0">
            {isEdit ? `${t('edit')}: ${name}` : t('create_new')}
          </h1>
        </Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => form.submit()}
          loading={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 h-10 px-5 rounded-lg shadow-sm font-semibold"
        >
          {t('save_button')}
        </Button>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={true}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card className="shadow-sm border border-slate-100 rounded-xl">
              <Form.Item
                name="exam_day"
                label={t('exam_day')}
                rules={[{ required: true, message: t('exam_day') }]}
              >
                <DatePicker style={{ width: '100%', height: 40 }} className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="exam_time"
                label={t('exam_time')}
                rules={[{ required: true, message: t('exam_time') }]}
              >
                <TimePicker format="HH:mm:ss" style={{ width: '100%', height: 40 }} className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="examination_committee"
                label={t('exam_committee')}
                rules={[{ required: true, message: t('exam_committee') }]}
              >
                <LinkSelect doctype="exam_lag_data" />
              </Form.Item>

              <Form.Item
                name="count_to_exam"
                label={t('preachers_limit')}
                rules={[{ required: true, message: t('preachers_limit') }]}
              >
                <Input type="number" min={1} className="h-10 rounded-lg" />
              </Form.Item>

              <Button
                type="default"
                icon={<SearchOutlined />}
                onClick={handleGetPreachers}
                loading={loadingPreachers}
                className="w-full h-10 mt-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold rounded-lg"
              >
                {t('get_preachers_btn')}
              </Button>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card className="shadow-sm border border-slate-100 rounded-xl" title={<span className="font-bold text-slate-700">{t('candidates_title')}</span>}>
              <Table
                dataSource={preachersTable}
                columns={columns}
                rowKey="waed_info"
                pagination={false}
                className="border border-slate-100 rounded-xl overflow-hidden"
                locale={{ emptyText: t('get_preachers_empty') }}
              />
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
