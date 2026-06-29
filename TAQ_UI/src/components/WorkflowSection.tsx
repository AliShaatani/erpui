import React, { useState } from 'react';
import { Card, Button, Space, Tag, Spin, message } from 'antd';
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import { CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useLanguage } from '../contexts/LanguageContext';

interface WorkflowSectionProps {
  doctype: string;
  docname: string;
  onActionApplied?: () => void;
}

export const WorkflowSection: React.FC<WorkflowSectionProps> = ({
  doctype,
  docname,
  onActionApplied
}) => {
  const { t } = useLanguage();
  const [applying, setApplying] = useState(false);

  // Fetch current state & transitions
  const { data, isLoading, mutate } = useFrappeGetCall(
    'taq_theme.taq_ui.api.get_workflow_state_details',
    { doctype, docname },
    `workflow_details_${doctype}_${docname}`
  );

  const { call: applyAction } = useFrappePostCall('taq_theme.taq_ui.api.apply_workflow_action');

  const details = data?.message;

  if (isLoading) {
    return <Spin size="small" />;
  }

  if (!details || !details.has_workflow) {
    return null;
  }

  const handleAction = async (action: string) => {
    setApplying(true);
    try {
      await applyAction({
        doctype,
        docname,
        action
      });
      message.success(t('save_success'));
      mutate();
      if (onActionApplied) {
        onActionApplied();
      }
    } catch (err: any) {
      message.error(err.message || t('save_error'));
    } finally {
      setApplying(false);
    }
  };

  // Get state color
  const getStateColor = (state: string) => {
    const s = state.toLowerCase();
    if (s.includes('approve') || s.includes('accept') || s.includes('مقبول') || s.includes('موافق')) return 'success';
    if (s.includes('reject') || s.includes('refuse') || s.includes('مرفوض')) return 'error';
    if (s.includes('schedule') || s.includes('جدولة')) return 'warning';
    return 'processing';
  };

  return (
    <Card 
      className="border border-indigo-100 bg-indigo-50/20 rounded-xl mb-6 shadow-sm"
      bodyStyle={{ padding: '16px 24px' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Space size="middle" align="center">
          <span className="font-bold text-slate-700">{t('field_status')}:</span>
          <Tag 
            color={getStateColor(details.current_state)} 
            icon={getStateColor(details.current_state) === 'processing' ? <SyncOutlined spin /> : <CheckCircleOutlined />}
            className="text-sm px-3 py-1 font-bold rounded-lg uppercase"
          >
            {details.current_state}
          </Tag>
        </Space>

        {details.transitions && details.transitions.length > 0 && (
          <Space size="small">
            {details.transitions.map((trans: any) => (
              <Button
                key={trans.action}
                type="primary"
                loading={applying}
                onClick={() => handleAction(trans.action)}
                className="bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg h-9 px-4 shadow-sm"
              >
                {trans.action}
              </Button>
            ))}
          </Space>
        )}
      </div>
    </Card>
  );
};
