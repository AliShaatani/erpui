import React, { useEffect, useState } from 'react';
import { Button, Card, Space, Select, message, Spin } from 'antd';
import { useFrappeGetDoc, useFrappeCreateDoc, useFrappeUpdateDoc } from 'frappe-react-sdk';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { LinkSelect } from '../components/LinkSelect';
import { useLanguage } from '../contexts/LanguageContext';

export const ExamLagForm: React.FC = () => {
  const { t } = useLanguage();
  const { name } = useParams<{ name: string }>();
  const isEdit = name && name !== 'new';
  const navigate = useNavigate();
  
  const { createDoc } = useFrappeCreateDoc();
  const { updateDoc } = useFrappeUpdateDoc();

  const { data: committeeData, isLoading } = useFrappeGetDoc(
    'exam_lag_data',
    isEdit ? name : undefined,
    isEdit ? `exam_lag_data_${name}` : null,
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
      message.error(t('empty_members'));
      return;
    }

    const hasEmptyField = members.some((m) => !m.user_name || m.the_adjective === 'اختر الصفة' || !m.the_adjective);
    if (hasEmptyField) {
      message.error(t('save_error'));
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        committee_members: members,
      };

      if (isEdit) {
        await updateDoc('exam_lag_data', name, payload);
        message.success(t('save_success'));
      } else {
        await createDoc('exam_lag_data', payload);
        message.success(t('save_success'));
      }
      navigate('/TAQ_UI/exam_lag_data');
    } catch (err: any) {
      message.error(err.message || t('save_error'));
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
      <div className="flex h-96 items-center justify-center">
        <Spin size="large" tip={t('loading')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-4">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/TAQ_UI/exam_lag_data')}>
            {t('back_to_list')}
          </Button>
          <h1 className="text-2xl font-black text-slate-800 m-0">
            {isEdit ? `${t('edit')}: ${name}` : t('create_new')}
          </h1>
        </Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 h-10 px-5 rounded-lg shadow-sm font-semibold"
        >
          {t('save_button')}
        </Button>
      </div>

      <Card bordered={false} className="border border-slate-100 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-slate-700 m-0">{t('committee_members')}</h3>
          <Button type="dashed" icon={<PlusOutlined />} onClick={addMember} className="rounded-lg">
            {t('add_row')}
          </Button>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 text-inline-start text-xs font-bold text-slate-600 uppercase border-b border-slate-100">
                <th className="p-3 w-2/3">{t('field_member_name')}</th>
                <th className="p-3 w-1/3">{t('field_role')}</th>
                <th className="p-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-2">
                    <LinkSelect
                      doctype="lag_user_name"
                      value={row.user_name}
                      onChange={(val) => updateMemberRow(idx, 'user_name', val)}
                      placeholder={t('field_member_name')}
                    />
                  </td>
                  <td className="p-2">
                    <Select
                      value={row.the_adjective}
                      onChange={(val) => updateMemberRow(idx, 'the_adjective', val)}
                      style={{ width: '100%', height: 36 }}
                      options={[
                        { value: 'اختر الصفة', label: 'اختر الصفة' },
                        { value: 'رئيس لجنة', label: 'رئيس لجنة' },
                        { value: 'مقرر', label: 'مقرر' },
                        { value: 'عضو', label: 'عضو' },
                      ]}
                      className="rounded"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteMember(idx)} />
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-slate-400 py-8">
                    {t('empty_members')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
