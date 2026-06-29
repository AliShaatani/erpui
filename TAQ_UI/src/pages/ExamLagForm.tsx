import React, { useEffect, useState } from 'react';
import { Button, Card, Space, Select, Table, message, Spin, Popconfirm } from 'antd';
import { useFrappeGetDoc, useFrappeCreateDoc, useFrappeUpdateDoc } from 'frappe-react-sdk';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { LinkSelect } from '../components/LinkSelect';

export const ExamLagForm: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const isEdit = name && name !== 'new';
  const navigate = useNavigate();
  
  const { createDoc } = useFrappeCreateDoc();
  const { updateDoc } = useFrappeUpdateDoc();

  const { data: committeeData, isLoading } = useFrappeGetDoc(
    'exam_lag_data',
    isEdit ? name : '',
    { revalidateOnFocus: false }
  );

  const [members, setMembers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (committeeData) {
      setMembers(committeeData.committee_members || []);
    } else {
      setMembers([]);
    }
  }, [committeeData]);

  const handleSave = async () => {
    // Validate members
    if (members.length === 0) {
      message.error('Please add at least one committee member.');
      return;
    }

    const hasEmptyField = members.some((m) => !m.user_name || m.the_adjective === 'اختر الصفة' || !m.the_adjective);
    if (hasEmptyField) {
      message.error('Please fill in all member names and roles.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        committee_members: members,
      };

      if (isEdit) {
        await updateDoc('exam_lag_data', name, payload);
        message.success('Committee updated successfully');
      } else {
        await createDoc('exam_lag_data', payload);
        message.success('Committee created successfully');
      }
      navigate('/TAQ_UI/exam_lag_data');
    } catch (err: any) {
      message.error(err.message || 'Failed to save committee');
    } finally {
      setIsSaving(false);
    }
  };

  const addMember = () => {
    setMembers([
      ...members,
      {
        user_name: '',
        the_adjective: 'اختر الصفة',
      },
    ]);
  };

  const updateMemberRow = (index: number, key: string, value: any) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [key]: value };
    setMembers(updated);
  };

  const deleteMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" tip="Loading committee details..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/TAQ_UI/exam_lag_data')}>
            Back to List
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 m-0">
            {isEdit ? `Edit Committee: ${name}` : 'Create New Committee'}
          </h1>
        </Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Save Committee
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-gray-700 m-0">Committee Members</h3>
          <Button type="dashed" icon={<PlusOutlined />} onClick={addMember}>
            Add Member
          </Button>
        </div>

        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="border border-gray-200 p-2">Member / User Name</th>
              <th className="border border-gray-200 p-2">Role / Adjective</th>
              <th className="border border-gray-200 p-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((row, idx) => (
              <tr key={idx}>
                <td className="border border-gray-200 p-1 w-2/3">
                  <LinkSelect
                    doctype="lag_user_name"
                    value={row.user_name}
                    onChange={(val) => updateMemberRow(idx, 'user_name', val)}
                    placeholder="Search name"
                  />
                </td>
                <td className="border border-gray-200 p-1 w-1/3">
                  <Select
                    value={row.the_adjective}
                    onChange={(val) => updateMemberRow(idx, 'the_adjective', val)}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'اختر الصفة', label: 'اختر الصفة' },
                      { value: 'رئيس لجنة', label: 'رئيس لجنة' },
                      { value: 'مقرر', label: 'مقرر' },
                      { value: 'عضو', label: 'عضو' },
                    ]}
                  />
                </td>
                <td className="border border-gray-200 p-1 text-center">
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteMember(idx)} />
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-gray-400 py-6">
                  No members added yet. Click 'Add Member' to add a committee member.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
