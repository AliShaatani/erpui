import React, { useState, useEffect } from 'react';
import { Select, Spin, Divider, Space, Button, Modal, Input, Form, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useFrappeGetCall, useFrappeCreateDoc } from 'frappe-react-sdk';
import { useLanguage } from '../contexts/LanguageContext';

interface LinkSelectProps {
  doctype: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  filters?: any;
  labelField?: string;
  style?: React.CSSProperties;
}

export const LinkSelect: React.FC<LinkSelectProps> = ({
  doctype,
  value,
  onChange,
  placeholder,
  filters = {},
  labelField,
  style
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  
  // Modal quick-creation states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDocValue, setNewDocValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { createDoc } = useFrappeCreateDoc();

  // Complex DocTypes that cannot be quick-created with just a name field
  const isSimpleDocType = ![
    'waed_info',
    'exam_lag_data',
    'exam_group_date',
    'User'
  ].includes(doctype);

  // Query list using get_list
  const { data, isValidating } = useFrappeGetCall(
    'frappe.client.get_list',
    {
      doctype: doctype,
      filters: searchQuery
        ? { ...filters, name: ['like', `%${searchQuery}%`] }
        : filters,
      limit_page_length: 20,
    },
    doctype ? `get_list_${doctype}_${searchQuery}` : null
  );

  useEffect(() => {
    if (data?.message) {
      const items = data.message as any[];
      const opts = items.map((item) => {
        let label = item.name;
        if (labelField && item[labelField]) {
          label = item[labelField];
        } else if (item.name1) {
          label = item.name1; // for lag_user_name
        } else if (item.namee) {
          label = item.namee; // for waed_info
        } else if (item.title) {
          label = item.title;
        }
        return {
          value: item.name,
          label: label,
        };
      });

      // Keep current value in list if not present
      if (value && !opts.some((o) => o.value === value)) {
        opts.unshift({ value, label: value });
      }

      setOptions(opts);
    }
  }, [data, value, labelField, language]);

  const handleQuickCreate = async () => {
    if (!newDocValue.trim()) return;
    setIsCreating(true);
    try {
      const payload: any = { name: newDocValue.trim() };
      
      // Handle known simple schema field variations
      if (doctype === 'lag_user_name') {
        payload.name1 = newDocValue.trim();
      }
      if (doctype === 'Shaikh_Name' || doctype === 'Shaikh') {
        payload.shaikh_name = newDocValue.trim();
      }
      
      const response = await createDoc(doctype, payload);
      const createdName = response.name || newDocValue.trim();
      
      message.success(t('save_success'));
      
      // Update options and set the selected value
      setOptions(prev => [...prev, { value: createdName, label: newDocValue.trim() }]);
      if (onChange) {
        onChange(createdName);
      }
      
      // Reset
      setIsModalOpen(false);
      setNewDocValue('');
    } catch (err: any) {
      message.error(err.message || t('save_error'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Select
        showSearch
        value={value || undefined}
        placeholder={placeholder || `${t('create_new')} ${doctype}`}
        defaultActiveFirstOption={false}
        showArrow={true}
        filterOption={false}
        onSearch={(val) => setSearchQuery(val)}
        onChange={(val) => onChange && onChange(val)}
        notFoundContent={isValidating ? <Spin size="small" /> : <div style={{ padding: '8px 12px', color: '#94a3b8', fontSize: '13px' }}>{t('no_data')}</div>}
        options={options}
        style={{ width: '100%', ...style }}
        allowClear
        dropdownRender={(menu) => (
          <>
            {menu}
            {isSimpleDocType && (
              <>
                <Divider style={{ margin: '4px 0' }} />
                <div style={{ padding: '4px 8px', textAlign: 'center' }}>
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                    style={{ width: '100%', textAlign: 'left', color: '#4f46e5', fontWeight: 600 }}
                  >
                    {t('create_new')} {doctype}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      />

      <Modal
        title={`${t('create_new')} ${doctype}`}
        open={isModalOpen}
        onOk={handleQuickCreate}
        onCancel={() => {
          setIsModalOpen(false);
          setNewDocValue('');
        }}
        confirmLoading={isCreating}
        okText={t('yes')}
        cancelText={t('no')}
        okButtonProps={{ className: 'bg-indigo-600 border-none' }}
      >
        <Form layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item label={`${doctype} Name`} required>
            <Input 
              value={newDocValue} 
              onChange={(e) => setNewDocValue(e.target.value)} 
              placeholder="Enter name..."
              onPressEnter={handleQuickCreate}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
