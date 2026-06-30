import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Col, Row, DatePicker, Select, Upload, message, Spin, Tag, Space } from 'antd';
import { useFrappeGetDoc, useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeFileUpload, useFrappeGetCall } from 'frappe-react-sdk';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined, UploadOutlined, GlobalOutlined } from '@ant-design/icons';
import { LinkSelect } from '../components/LinkSelect';
import { SignaturePad } from '../components/SignaturePad';
import { useLanguage } from '../contexts/LanguageContext';
import { WorkflowSection } from '../components/WorkflowSection';

export const WaedInfoForm: React.FC = () => {
  const { t, language } = useLanguage();
  const { name } = useParams<{ name: string }>();
  const isEdit = name && name !== 'new';
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const { createDoc } = useFrappeCreateDoc();
  const { updateDoc } = useFrappeUpdateDoc();
  const { upload } = useFrappeFileUpload();

  // Load existing doc (Passing null as swrKey when creating new doc prevents SWR fetching)
  const { data: preacherData, isLoading, mutate } = useFrappeGetDoc(
    'waed_info',
    isEdit ? name : undefined,
    isEdit ? `waed_info_${name}` : null,
    { revalidateOnFocus: false }
  );

  // Check if workflow_state exists
  const { data: workflowCheck } = useFrappeGetCall(
    'taq_theme.taq_ui.api.check_workflow_state',
    {},
    'check_workflow_state'
  );
  const hasWorkflow = workflowCheck?.message?.has_workflow ?? false;

  // Child table states
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [booksStudied, setBooksStudied] = useState<any[]>([]);
  const [scholarsList, setScholarsList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [signature, setSignature] = useState<string>('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preacherData && isEdit) {
      form.setFieldsValue({
        namee: preacherData.namee,
        num_w: preacherData.num_w,
        agee: preacherData.agee,
        phoone: preacherData.phoone ? preacherData.phoone.replace(/^\+218/, '') : '',
        residence_place: preacherData.residence_place,
        place: preacherData.place,
        gender: preacherData.gender,
        marital_status: preacherData.marital_status,
        office: preacherData.office,
        email_address: preacherData.email_address,
        facebook_page: preacherData.facebook_page,
        other_pages: preacherData.other_pages,
        how_many_quran: preacherData.how_many_quran,
        markez_tahfed: preacherData.markez_tahfed,
        recommendations: preacherData.recommendations,
        attended_lessons: preacherData.attended_lessons,
        workflow_state: preacherData.workflow_state || 'Draft'
      });

      setQualifications(preacherData.academic_qualifications || []);
      setBooksStudied(preacherData.which_books_did_i_study_and_under_which_scholars || []);
      setScholarsList(preacherData.shakis || []);
      setSubjectsList(preacherData.subjects || []);
      setSignature(preacherData.signature || '');
      setProfilePictureUrl(preacherData.profile_picture || '');
    } else {
      form.resetFields();
      form.setFieldValue('workflow_state', 'Draft');
      setQualifications([]);
      setBooksStudied([]);
      setScholarsList([]);
      setSubjectsList([]);
      setSignature('');
      setProfilePictureUrl('');
    }
  }, [preacherData, isEdit, form]);

  const handleSave = async (values: any) => {
    setIsSaving(true);
    try {
      // Append country code back to phone number
      const cleanPhone = values.phoone ? `+218${values.phoone.trim()}` : '';

      const docPayload: any = {
        ...values,
        phoone: cleanPhone,
        academic_qualifications: qualifications,
        which_books_did_i_study_and_under_which_scholars: booksStudied,
        shakis: scholarsList,
        subjects: subjectsList,
        signature: signature,
        profile_picture: profilePictureUrl,
      };

      if (!hasWorkflow) {
        delete docPayload.workflow_state;
      }

      if (isEdit) {
        await updateDoc('waed_info', name, docPayload);
        message.success(t('save_success'));
      } else {
        await createDoc('waed_info', docPayload);
        message.success(t('save_success'));
      }
      navigate('/TAQ_UI/waed_info');
    } catch (err: any) {
      message.error(err.message || t('save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureUpload = async (file: any) => {
    try {
      const response = await upload(file, {
        doctype: 'waed_info',
        docname: isEdit ? name : 'temp',
        fieldname: 'profile_picture',
        is_private: 0
      });
      if (response?.file_url) {
        setProfilePictureUrl(response.file_url);
        message.success(t('save_success'));
      }
    } catch (err) {
      message.error('Upload failed');
    }
    return false;
  };

  // Qualifications Row Manipulation
  const addQualification = () => {
    setQualifications([
      ...qualifications,
      { certificate_type: undefined, specialization: undefined, date_of_obtaining_the_certificate: '', issuing_authority: undefined },
    ]);
  };

  const updateQualificationRow = (index: number, key: string, value: any) => {
    const updated = [...qualifications];
    updated[index] = { ...updated[index], [key]: value };
    setQualifications(updated);
  };

  // Books Studied Row Manipulation
  const addBookStudied = () => {
    setBooksStudied([...booksStudied, { sheikh_name: undefined, book_name: undefined, publication_of_the_book: '' }]);
  };

  const updateBookRow = (index: number, key: string, value: any) => {
    const updated = [...booksStudied];
    updated[index] = { ...updated[index], [key]: value };
    setBooksStudied(updated);
  };

  // Scholars Row Manipulation
  const addScholar = () => {
    setScholarsList([...scholarsList, { shaikh: undefined }]);
  };

  const updateScholarRow = (index: number, value: any) => {
    const updated = [...scholarsList];
    updated[index] = { ...updated[index], shaikh: value };
    setScholarsList(updated);
  };

  // Subjects Row Manipulation
  const addSubject = () => {
    setSubjectsList([...subjectsList, { subjecte_name: undefined }]);
  };

  const updateSubjectRow = (index: number, value: any) => {
    const updated = [...subjectsList];
    updated[index] = { ...updated[index], subjecte_name: value };
    setSubjectsList(updated);
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
      {/* Header Panel */}
      <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-4 bg-white sticky top-0 z-20">
        <Space size="middle">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/TAQ_UI/waed_info')}>
            {t('back_to_list')}
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-800 m-0">
              {isEdit ? preacherData?.namee || name : 'New waed_info'}
            </h1>
            {!isEdit ? (
              <Tag color="orange" className="font-semibold px-2 py-0.5 rounded">Not Saved</Tag>
            ) : (
              <Tag color="blue" className="font-semibold px-2 py-0.5 rounded">{preacherData?.workflow_state || 'Saved'}</Tag>
            )}
          </div>
        </Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => form.submit()}
          loading={isSaving}
          className="bg-black hover:bg-slate-800 h-10 px-6 rounded-lg shadow-sm font-semibold border-none"
        >
          Save
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        requiredMark={true}
      >
        {isEdit && (
          <WorkflowSection 
            doctype="waed_info" 
            docname={name!} 
            onActionApplied={mutate} 
          />
        )}

        <div className="space-y-8">
          {/* Section 1: Personal Data */}
          <Card bordered={true} className="border-slate-200 rounded-xl shadow-none" title={<span className="font-bold text-base text-slate-700">Personal data</span>}>
            <Row gutter={24}>
              <Col xs={24} md={12} className="space-y-4">
                <Form.Item
                  name="namee"
                  label={t('field_fullname')}
                  rules={[{ required: true, message: t('field_fullname') }]}
                >
                  <Input className="h-10 rounded-lg bg-slate-50 border-slate-200 hover:border-indigo-500" />
                </Form.Item>

                <Form.Item
                  name="agee"
                  label={t('field_age')}
                  rules={[{ required: true, message: t('field_age') }]}
                >
                  <Input className="h-10 rounded-lg bg-slate-50 border-slate-200 hover:border-indigo-500" />
                </Form.Item>

                <Form.Item label={t('field_profile_picture')} className="mb-0">
                  <div className="flex items-center gap-4 flex-wrap">
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt="Profile Preview"
                        className="w-20 h-20 rounded-lg object-cover border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 border-dashed text-slate-400 text-xs">
                        No Image
                      </div>
                    )}
                    <Upload beforeUpload={handleProfilePictureUpload} showUploadList={false} accept="image/*">
                      <Button icon={<UploadOutlined />} className="rounded-lg h-9 font-medium border-slate-300 hover:border-slate-400">Attach</Button>
                    </Upload>
                  </div>
                </Form.Item>
              </Col>

              <Col xs={24} md={12} className="space-y-4">
                <Form.Item
                  name="num_w"
                  label={t('field_national_id')}
                  rules={[
                    { required: true, message: t('field_national_id') },
                    { len: 12, message: 'Must be 12 digits' },
                  ]}
                >
                  <Input 
                    placeholder="ادخل الرقم الوطني" 
                    maxLength={12} 
                    className="h-10 rounded-lg bg-slate-50 border-slate-200 hover:border-indigo-500" 
                  />
                </Form.Item>

                <Form.Item
                  name="residence_place"
                  label={t('field_residence')}
                  rules={[{ required: true, message: t('field_residence') }]}
                >
                  <Input className="h-10 rounded-lg bg-slate-50 border-slate-200 hover:border-indigo-500" />
                </Form.Item>

                <Form.Item name="gender" label={t('field_gender')}>
                  <LinkSelect doctype="Gender" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Section 2: Detailed Housing Information */}
          <Card bordered={true} className="border-slate-200 rounded-xl shadow-none" title={<span className="font-bold text-base text-slate-700">Detailed Housing Information</span>}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="place"
                  label={t('field_address')}
                  rules={[{ required: true, message: t('field_address') }]}
                >
                  <Input.TextArea rows={4} className="rounded-lg bg-slate-50 border-slate-200 hover:border-indigo-500" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} className="space-y-4">
                <Form.Item
                  name="marital_status"
                  label={t('field_marital')}
                  rules={[{ required: true, message: t('field_marital') }]}
                >
                  <LinkSelect doctype="marital_status" />
                </Form.Item>

                <Form.Item
                  name="office"
                  label={t('field_office')}
                  rules={[{ required: true, message: t('field_office') }]}
                >
                  <LinkSelect doctype="Offices" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Section 3: Contact Information */}
          <Card bordered={true} className="border-slate-200 rounded-xl shadow-none" title={<span className="font-bold text-base text-slate-700">Contact Information</span>}>
            <Row gutter={24}>
              <Col xs={24} md={12} className="space-y-4">
                <Form.Item
                  name="phoone"
                  label={t('field_phone')}
                  rules={[{ required: true, message: t('field_phone') }]}
                >
                  <Input 
                    addonBefore={<Space><span style={{ fontSize: '16px' }}>🇱🇾</span><span className="text-slate-500 font-semibold">+218</span></Space>} 
                    className="h-10 rounded-lg overflow-hidden" 
                    placeholder="9XXXXXXXX"
                  />
                </Form.Item>

                <Form.Item name="email_address" label={t('field_email')}>
                  <Input className="h-10 rounded-lg bg-slate-50 border-slate-200 hover:border-indigo-500" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12} className="space-y-4">
                <Form.Item
                  name="facebook_page"
                  label={t('field_facebook')}
                  rules={[{ required: true, message: t('field_facebook') }]}
                >
                  <Input className="h-10 rounded-lg bg-slate-50 border-slate-200 hover:border-indigo-500" />
                </Form.Item>

                <Form.Item name="other_pages" label={t('field_other_pages')}>
                  <Input className="h-10 rounded-lg bg-slate-50 border-slate-200 hover:border-indigo-500" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Section 4: The Scientific and Qur'anic Background */}
          <Card bordered={true} className="border-slate-200 rounded-xl shadow-none" title={<span className="font-bold text-base text-slate-700">The Scientific and Qur'anic Background</span>}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="how_many_quran"
                  label={t('field_quran_memory')}
                  rules={[{ required: true, message: t('field_quran_memory') }]}
                >
                  <Select
                    style={{ height: 40 }}
                    placeholder="اختيار مقدار الحفظ"
                    options={[
                      { value: 'القرآن الكريم كاملا', label: 'القرآن الكريم كاملا' },
                      { value: 'ثلاثة أرباع القرآن', label: 'ثلاثة أرباع القرآن' },
                      { value: 'نصف القرآن', label: 'نصف القرآن' },
                      { value: 'ثلث القرآن', label: 'ثلث القرآن' },
                      { value: 'ربع القرآن', label: 'ربع القرآن' },
                      { value: 'أقل من الربع', label: 'أقل من الربع' },
                    ]}
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="markez_tahfed"
                  label={t('field_markez')}
                  rules={[{ required: true, message: t('field_markez') }]}
                >
                  <LinkSelect doctype="memorization_center" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Section 5: Qualifications and Certifications */}
          <Card bordered={true} className="border-slate-200 rounded-xl shadow-none" title={<span className="font-bold text-base text-slate-700">Qualifications and Certifications</span>}>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-600 font-bold text-sm">Academic Qualifications</span>
                <Button type="default" size="middle" icon={<PlusOutlined />} onClick={addQualification} className="rounded-lg border-slate-300 font-semibold text-slate-700 hover:text-slate-900 h-9">
                  Add Row
                </Button>
              </div>
              
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-inline-start text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                      <th className="p-3 w-12 text-center">No.</th>
                      <th className="p-3">{t('field_cert_type')} *</th>
                      <th className="p-3">{t('field_specialization')} *</th>
                      <th className="p-3">{t('field_cert_date')}</th>
                      <th className="p-3">{t('field_issuing_authority')} *</th>
                      <th className="p-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {qualifications.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                        <td className="p-2">
                          <Select
                            value={row.certificate_type || undefined}
                            onChange={(val) => updateQualificationRow(idx, 'certificate_type', val)}
                            placeholder="اختر نوع المؤهل العلمي"
                            style={{ width: '100%', height: 38 }}
                            options={[
                              { value: 'بكالوريس', label: 'بكالوريس' },
                              { value: 'دبلوم عالي', label: 'دبلوم عالي' },
                              { value: 'دبلوم متوسط', label: 'دبلوم متوسط' },
                            ]}
                          />
                        </td>
                        <td className="p-2">
                          <LinkSelect
                            doctype="Specialization"
                            value={row.specialization}
                            onChange={(val) => updateQualificationRow(idx, 'specialization', val)}
                          />
                        </td>
                        <td className="p-2">
                          <DatePicker
                            value={row.date_of_obtaining_the_certificate ? dayjs(row.date_of_obtaining_the_certificate) : null}
                            onChange={(date) => updateQualificationRow(idx, 'date_of_obtaining_the_certificate', date ? date.format('YYYY-MM-DD') : '')}
                            style={{ width: '100%', height: 38 }}
                            className="rounded-lg"
                          />
                        </td>
                        <td className="p-2">
                          <LinkSelect
                            doctype="Issuing_Authority"
                            value={row.issuing_authority}
                            onChange={(val) => updateQualificationRow(idx, 'issuing_authority', val)}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setQualifications(qualifications.filter((_, i) => i !== idx))} />
                        </td>
                      </tr>
                    ))}
                    {qualifications.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-slate-400 py-8 font-medium">No Data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Section 6: Sheikhs and Books */}
          <Card bordered={true} className="border-slate-200 rounded-xl shadow-none" title={<span className="font-bold text-base text-slate-700">Sheikhs and Books</span>}>
            <Row gutter={24}>
              {/* Scholars list */}
              <Col xs={24} md={12} className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600 font-bold text-sm">Who were the scholars from whom you studied?</span>
                  <Button type="default" size="middle" icon={<PlusOutlined />} onClick={addScholar} className="rounded-lg border-slate-300 font-semibold text-slate-700 h-9">
                    Add Row
                  </Button>
                </div>
                
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-inline-start text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                        <th className="p-3">{t('field_sheikh_name')} *</th>
                        <th className="p-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {scholarsList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <LinkSelect
                              doctype="Shaikh_Name"
                              value={row.shaikh}
                              onChange={(val) => updateScholarRow(idx, val)}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setScholarsList(scholarsList.filter((_, i) => i !== idx))} />
                          </td>
                        </tr>
                      ))}
                      {scholarsList.length === 0 && (
                        <tr>
                          <td colSpan={2} className="text-center text-slate-400 py-8 font-medium">No Data</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Col>

              {/* Books studied list */}
              <Col xs={24} md={12} className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600 font-bold text-sm">Which books did I study, and under which scholars?</span>
                  <Button type="default" size="middle" icon={<PlusOutlined />} onClick={addBookStudied} className="rounded-lg border-slate-300 font-semibold text-slate-700 h-9">
                    Add Row
                  </Button>
                </div>
                
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-inline-start text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                        <th className="p-3">{t('field_sheikh_name')} *</th>
                        <th className="p-3">{t('field_book_name')} *</th>
                        <th className="p-3">{t('field_publication')}</th>
                        <th className="p-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {booksStudied.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <LinkSelect
                              doctype="Shaikh_Name"
                              value={row.sheikh_name}
                              onChange={(val) => updateBookRow(idx, 'sheikh_name', val)}
                            />
                          </td>
                          <td className="p-2">
                            <LinkSelect
                              doctype="sheikhs_books"
                              value={row.book_name}
                              onChange={(val) => updateBookRow(idx, 'book_name', val)}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={row.publication_of_the_book || ''}
                              onChange={(e) => updateBookRow(idx, 'publication_of_the_book', e.target.value)}
                              placeholder="Publication of the book..."
                              className="h-[38px] rounded-lg bg-slate-50 border-slate-200 hover:border-indigo-500"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setBooksStudied(booksStudied.filter((_, i) => i !== idx))} />
                          </td>
                        </tr>
                      ))}
                      {booksStudied.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center text-slate-400 py-8 font-medium">No Data</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Section 7: Outreach and Teaching Activities */}
          <Card bordered={true} className="border-slate-200 rounded-xl shadow-none" title={<span className="font-bold text-base text-slate-700">Outreach and Teaching Activities</span>}>
            <Row gutter={24}>
              {/* Subjects to teach */}
              <Col xs={24} md={12} className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-600 font-bold text-sm">The subjects you tend to teach:</span>
                  <Button type="default" size="middle" icon={<PlusOutlined />} onClick={addSubject} className="rounded-lg border-slate-300 font-semibold text-slate-700 h-9">
                    Add Row
                  </Button>
                </div>
                
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-inline-start text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                        <th className="p-3">{t('field_subject')} *</th>
                        <th className="p-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {subjectsList.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <LinkSelect
                              doctype="subjects"
                              value={row.subjecte_name}
                              onChange={(val) => updateSubjectRow(idx, val)}
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setSubjectsList(subjectsList.filter((_, i) => i !== idx))} />
                          </td>
                        </tr>
                      ))}
                      {subjectsList.length === 0 && (
                        <tr>
                          <td colSpan={2} className="text-center text-slate-400 py-8 font-medium">No Data</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Col>

              {/* Recommendations textarea */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="recommendations"
                  label={<span className="font-semibold text-slate-600 text-sm">Recommendations, licenses, and academic certificates and their dates *</span>}
                  rules={[{ required: true, message: t('field_recommendations') }]}
                >
                  <Input.TextArea rows={6} className="rounded-lg bg-slate-50 border-slate-200 hover:border-indigo-500" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24} className="mt-6">
              {/* Lessons attended textarea */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="attended_lessons"
                  label={<span className="font-semibold text-slate-600 text-sm">The lessons and lectures that you attended, including the last lesson or lecture and the name of the sheik? *</span>}
                  rules={[{ required: true, message: t('field_lessons_attended') }]}
                >
                  <Input.TextArea rows={6} className="rounded-lg bg-slate-50 border-slate-200 hover:border-indigo-500" />
                </Form.Item>
              </Col>

              {/* Signature field */}
              <Col xs={24} md={12}>
                <Form.Item
                  label={<span className="font-semibold text-slate-600 text-sm">Signature of the concerned person</span>}
                  required
                >
                  <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 flex flex-col items-center">
                    <SignaturePad value={signature} onChange={setSignature} />
                    {!signature && (
                      <span className="text-red-500 text-xs mt-2">{t('signature_required')}</span>
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>
      </Form>
    </div>
  );
};
