import React, { useState, useEffect } from 'react';
import { Select, Spin } from 'antd';
import { useFrappeGetCall } from 'frappe-react-sdk';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

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
  }, [data, value, labelField]);

  return (
    <Select
      showSearch
      value={value}
      placeholder={placeholder || `Select ${doctype}`}
      defaultActiveFirstOption={false}
      showArrow={true}
      filterOption={false}
      onSearch={(val) => setSearchQuery(val)}
      onChange={(val) => onChange && onChange(val)}
      notFoundContent={isValidating ? <Spin size="small" /> : null}
      options={options}
      style={{ width: '100%', ...style }}
      allowClear
    />
  );
};
