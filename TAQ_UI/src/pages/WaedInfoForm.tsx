import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Tabs, Card, Col, Row, DatePicker, Select, Upload, message, Spin } from 'antd';
import { useFrappeGetDoc, useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeFileUpload, useFrappeGetCall } from 'frappe-react-sdk';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { LinkSelect } from '../components/LinkSelect';
import { SignaturePad } from '../components/SignaturePad';
import { useLanguage } from '../contexts/LanguageContext';
import { WorkflowSection } from '../components/WorkflowSection';

const { TabPane } = Tabs;

export const WaedInfoForm: React.FC = () => {
  const { t } = useLanguage();
  const { name } = useParams<{ name: string }>();
  const isEdit = name && name !== 'new';
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const { createDoc } = useFrappeCreateDoc();
  const { updateDoc } = useFrappeUpdateDoc();
  const { upload } = useFrappeFileUpload();

  // Load existing doc
  const { data: preacherData, isLoading, mutate } = useFrappeGetDoc(
    'waed_info',
    isEdit ? name : '',
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
    if (preacherData) {
      form.setFieldsValue({
        namee: preacherData.namee,
        num_w: preacherData.num_w,
        agee: preacherData.agee,
        phoone: preacherData.phoone,
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
  }, [preacherData, form]);

  const handleSave = async (values: any) => {
    setIsSaving(true);
    try {
      const docPayload: any = {
        ...values,
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

  const addQualification = () => {
    setQualifications([
      ...qualifications,
      { certificate_type: '', specialization: '', date_of_obtaining_the_certificate: '', issuing_authority: '' },
    ]);
  };

  const updateQualificationRow = (index: number, key: string, value: any) => {
    const updated = [...qualifications];
    updated[index] = { ...updated[index], [key]: value };
    setQualifications(updated);
  };

  const deleteQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const addBookStudied = () => {
    setBooksStudied([...booksStudied, { sheikh_name: '', book_name: '', publication_of_the_book: '' }]);
  };

  const updateBookRow = (index: number, key: string, value: any) => {
    const updated = [...booksStudied];
    updated[index] = { ...updated[index], [key]: value };
    setBooksStudied(updated);
  };

  const addScholar = () => {
    setScholarsList([...scholarsList, { shaikh: '' }]);
  };

  const updateScholarRow = (index: number, value: any) => {
    const updated = [...scholarsList];
    updated[index] = { ...updated[index], shaikh: value };
    setScholarsList(updated);
  };

  const addSubject = () => {
    setSubjectsList([...subjectsList, { subjecte_name: '' }]);
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
      <div className="flex justify-between items-center border-b pb-4 flex-wrap gap-4">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/TAQ_UI/waed_info')}>
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
        <Tabs defaultActiveKey="personal" type="card" className="shadow-sm">
          {/* TAB 1: PERSONAL INFORMATION */}
          <TabPane tab={t('personal_info')} key="personal">
            <Card bordered={false} className="border border-slate-100 rounded-xl">
              <Row gutter={[24, 0]}>
                <Col xs={24} md={16}>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="namee"
                        label={t('field_fullname')}
                        rules={[{ required: true, message: t('field_fullname') }]}
                      >
                        <Input className="h-10 rounded-lg" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="num_w"
                        label={t('field_national_id')}
                        rules={[
                          { required: true, message: t('field_national_id') },
                          { len: 12, message: 'Must be 12 digits' },
                        ]}
                      >
                        <Input maxLength={12} className="h-10 rounded-lg" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="agee"
                        label={t('field_age')}
                        rules={[{ required: true, message: t('field_age') }]}
                      >
                        <Input className="h-10 rounded-lg" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phoone"
                        label={t('field_phone')}
                        rules={[{ required: true, message: t('field_phone') }]}
                      >
                        <Input className="h-10 rounded-lg" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="residence_place"
                        label={t('field_residence')}
                        rules={[{ required: true, message: t('field_residence') }]}
                      >
                        <Input className="h-10 rounded-lg" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="gender" label={t('field_gender')}>
                        <LinkSelect doctype="Gender" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="marital_status"
                        label={t('field_marital')}
                        rules={[{ required: true, message: t('field_marital') }]}
                      >
                        <LinkSelect doctype="marital_status" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="office"
                        label={t('field_office')}
                        rules={[{ required: true, message: t('field_office') }]}
                      >
                        <LinkSelect doctype="Offices" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>

                <Col xs={24} md={8} className="flex flex-col items-center justify-start border-inline-start pl-6 pr-6">
                  <Form.Item label={t('field_profile_picture')} className="w-full text-center">
                    <div className="mb-4">
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt="Profile Preview"
                          className="w-32 h-32 rounded-full object-cover border border-slate-200 mx-auto shadow-sm"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 border-dashed mx-auto text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <Upload beforeUpload={handleProfilePictureUpload} showUploadList={false} accept="image/*">
                      <Button icon={<UploadOutlined />} className="rounded-lg">{t('create_new')} Image</Button>
                    </Upload>
                  </Form.Item>

                  {!hasWorkflow && (
                    <Form.Item name="workflow_state" label={t('field_status')} className="w-full">
                      <Select
                        style={{ height: 40 }}
                        options={[
                          { value: 'Draft', label: 'Draft' },
                          { value: 'Scheduling an appointment', label: 'Scheduling an appointment' },
                          { value: 'Accepted', label: 'Accepted' },
                          { value: 'Rejected', label: 'Rejected' },
                        ]}
                        className="rounded-lg"
                      />
                    </Form.Item>
                  )}
                </Col>
              </Row>
              
              <Form.Item
                name="place"
                label={t('field_address')}
                rules={[{ required: true, message: t('field_address') }]}
              >
                <Input.TextArea rows={2} className="rounded-lg" />
              </Form.Item>

              <div className="mt-4 border-t pt-4">
                <h3 className="text-base font-bold text-slate-700 mb-4">Contact Channels</h3>
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Form.Item name="email_address" label={t('field_email')}>
                      <Input className="h-10 rounded-lg" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="facebook_page"
                      label={t('field_facebook')}
                      rules={[{ required: true, message: t('field_facebook') }]}
                    >
                      <Input className="h-10 rounded-lg" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="other_pages" label={t('field_other_pages')}>
                      <Input className="h-10 rounded-lg" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Card>
          </TabPane>

          {/* TAB 2: SCIENTIFIC BACKGROUND */}
          <TabPane tab={t('scientific_background')} key="scientific">
            <Card bordered={false} className="border border-slate-100 rounded-xl">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="how_many_quran"
                    label={t('field_quran_memory')}
                    rules={[{ required: true, message: t('field_quran_memory') }]}
                  >
                    <Select
                      style={{ height: 40 }}
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
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="markez_tahfed"
                    label={t('field_markez')}
                    rules={[{ required: true, message: t('field_markez') }]}
                  >
                    <LinkSelect doctype="memorization_center" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Qualifications Table */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-slate-700 m-0">{t('field_qualifications')}</h3>
                  <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addQualification} className="rounded-lg">
                    {t('add_row')}
                  </Button>
                </div>
                
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-inline-start text-xs font-bold text-slate-600 uppercase border-b border-slate-100">
                        <th className="p-3">{t('field_cert_type')}</th>
                        <th className="p-3">{t('field_specialization')}</th>
                        <th className="p-3">{t('field_cert_date')}</th>
                        <th className="p-3">{t('field_issuing_authority')}</th>
                        <th className="p-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {qualifications.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <Select
                              value={row.certificate_type}
                              onChange={(val) => updateQualificationRow(idx, 'certificate_type', val)}
                              style={{ width: '100%' }}
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
                              style={{ width: '100%' }}
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
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteQualification(idx)} />
                          </td>
                        </tr>
                      ))}
                      {qualifications.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-slate-400 py-6">{t('empty_members')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabPane>

          {/* TAB 3: STUDY DETAILS */}
          <TabPane tab={t('sheikhs_books')} key="study">
            <Card bordered={false} className="border border-slate-100 rounded-xl">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-slate-700 m-0">{t('field_books_studied')}</h3>
                  <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addBookStudied} className="rounded-lg">
                    {t('add_row')}
                  </Button>
                </div>
                
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-inline-start text-xs font-bold text-slate-600 uppercase border-b border-slate-100">
                        <th className="p-3">{t('field_sheikh_name')}</th>
                        <th className="p-3">{t('field_book_name')}</th>
                        <th className="p-3">{t('field_publication')}</th>
                        <th className="p-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
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
                              value={row.publication_of_the_book}
                              onChange={(e) => updateBookRow(idx, 'publication_of_the_book', e.target.value)}
                              placeholder="Publisher/Edition"
                              className="h-8 rounded"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setBooksStudied(booksStudied.filter((_, i) => i !== idx))} />
                          </td>
                        </tr>
                      ))}
                      {booksStudied.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center text-slate-400 py-6">{t('empty_members')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Scholars List Table */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-bold text-slate-700 m-0">{t('field_scholars_list')}</h3>
                  <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addScholar} className="rounded-lg">
                    {t('add_row')}
                  </Button>
                </div>
                
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-inline-start text-xs font-bold text-slate-600 uppercase border-b border-slate-100">
                        <th className="p-3">{t('field_sheikh_name')}</th>
                        <th className="p-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
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
                          <td colSpan={2} className="text-center text-slate-400 py-6">{t('empty_members')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabPane>

          {/* TAB 4: OUTREACH & TEACHING */}
          <TabPane tab={t('outreach_signature')} key="outreach">
            <Card bordered={false} className="border border-slate-100 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-base font-bold text-slate-700 m-0">{t('field_teach_subjects')}</h3>
                      <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addSubject} className="rounded-lg">
                        {t('add_row')}
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto border border-slate-100 rounded-xl mb-4">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-inline-start text-xs font-bold text-slate-600 uppercase border-b border-slate-100">
                            <th className="p-3">{t('field_subject')}</th>
                            <th className="p-3 w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
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
                              <td colSpan={2} className="text-center text-slate-400 py-6">{t('empty_members')}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Form.Item
                    name="recommendations"
                    label={t('field_recommendations')}
                    rules={[{ required: true, message: t('field_recommendations') }]}
                  >
                    <Input.TextArea rows={4} className="rounded-lg" />
                  </Form.Item>

                  <Form.Item
                    name="attended_lessons"
                    label={t('field_lessons_attended')}
                    rules={[{ required: true, message: t('field_lessons_attended') }]}
                  >
                    <Input.TextArea rows={4} className="rounded-lg" />
                  </Form.Item>
                </div>

                <div className="flex flex-col items-center border-l pl-6 pr-6">
                  <h3 className="text-base font-bold text-slate-700 w-full mb-4 text-center">
                    {t('field_signature')}
                  </h3>
                  <SignaturePad value={signature} onChange={setSignature} />
                  {!signature && (
                    <p className="text-red-500 mt-2 text-xs">{t('signature_required')}</p>
                  )}
                </div>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Form>
    </div>
  );
};
