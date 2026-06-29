import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Tabs, Card, Table, Space, DatePicker, Select, Upload, message, Spin } from 'antd';
import { useFrappeGetDoc, useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeFileUpload } from 'frappe-react-sdk';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { LinkSelect } from '../components/LinkSelect';
import { SignaturePad } from '../components/SignaturePad';

const { TabPane } = Tabs;

export const WaedInfoForm: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const isEdit = name && name !== 'new';
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // Data mutations
  const { createDoc } = useFrappeCreateDoc();
  const { updateDoc } = useFrappeUpdateDoc();
  const { upload } = useFrappeFileUpload();

  // Load existing doc
  const { data: preacherData, isLoading, error } = useFrappeGetDoc(
    'waed_info',
    isEdit ? name : '',
    {
      // Auto refetch
      revalidateOnFocus: false,
    }
  );

  // Child table states
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [booksStudied, setBooksStudied] = useState<any[]>([]);
  const [scholarsList, setScholarsList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [signature, setSignature] = useState<string>('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Set initial form values when data loads
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

      // Child tables
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
      const docPayload = {
        ...values,
        academic_qualifications: qualifications,
        which_books_did_i_study_and_under_which_scholars: booksStudied,
        shakis: scholarsList,
        subjects: subjectsList,
        signature: signature,
        profile_picture: profilePictureUrl,
      };

      if (isEdit) {
        await updateDoc('waed_info', name, docPayload);
        message.success('Preacher application updated successfully');
      } else {
        await createDoc('waed_info', docPayload);
        message.success('Preacher application created successfully');
      }
      navigate('/TAQ_UI/waed_info');
    } catch (err: any) {
      message.error(err.message || 'Failed to save application');
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
        message.success('Profile picture uploaded successfully');
      }
    } catch (err) {
      message.error('Failed to upload profile picture');
    }
    return false; // prevent default upload action
  };

  // Qualifications Columns and Actions
  const addQualification = () => {
    setQualifications([
      ...qualifications,
      {
        certificate_type: '',
        specialization: '',
        date_of_obtaining_the_certificate: '',
        issuing_authority: '',
      },
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

  // Books Studied Actions
  const addBookStudied = () => {
    setBooksStudied([
      ...booksStudied,
      { sheikh_name: '', book_name: '', publication_of_the_book: '' },
    ]);
  };

  const updateBookRow = (index: number, key: string, value: any) => {
    const updated = [...booksStudied];
    updated[index] = { ...updated[index], [key]: value };
    setBooksStudied(updated);
  };

  // Scholars Actions
  const addScholar = () => {
    setScholarsList([...scholarsList, { shaikh: '' }]);
  };

  const updateScholarRow = (index: number, value: any) => {
    const updated = [...scholarsList];
    updated[index] = { ...updated[index], shaikh: value };
    setScholarsList(updated);
  };

  // Subjects Actions
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
      <div className="flex h-64 items-center justify-center">
        <Spin size="large" tip="Loading applicant data..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/TAQ_UI/waed_info')}>
            Back to List
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 m-0">
            {isEdit ? `Edit Preacher: ${name}` : 'New Preacher Application'}
          </h1>
        </Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => form.submit()}
          loading={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Save Application
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        requiredMark={true}
        initialValues={{ workflow_state: 'Draft' }}
      >
        <Tabs defaultActiveKey="personal" type="card" className="shadow-sm">
          {/* TAB 1: PERSONAL INFORMATION */}
          <TabPane tab="Personal Information" key="personal">
            <Card bordered={false}>
              <Row gutter={[24, 0]}>
                <Col xs={24} md={16}>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="namee"
                        label="Full name"
                        rules={[{ required: true, message: 'Please enter the full name' }]}
                      >
                        <Input placeholder="Enter full name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="num_w"
                        label="National ID Number"
                        rules={[
                          { required: true, message: 'Please enter National ID' },
                          { len: 12, message: 'National ID must be exactly 12 characters' },
                        ]}
                      >
                        <Input placeholder="12 digit National ID" maxLength={12} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="agee"
                        label="Age"
                        rules={[{ required: true, message: 'Please enter age' }]}
                      >
                        <Input placeholder="Age" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phoone"
                        label="Phone Number (WhatsApp)"
                        rules={[{ required: true, message: 'Please enter phone' }]}
                      >
                        <Input placeholder="e.g. +218..." />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="residence_place"
                        label="Place of residence"
                        rules={[{ required: true, message: 'Please enter place of residence' }]}
                      >
                        <Input placeholder="City or Region" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="gender" label="Gender">
                        <LinkSelect doctype="Gender" placeholder="Select gender" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="marital_status"
                        label="Marital Status"
                        rules={[{ required: true, message: 'Please select marital status' }]}
                      >
                        <LinkSelect doctype="marital_status" placeholder="Select marital status" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="office"
                        label="Office"
                        rules={[{ required: true, message: 'Please select Office' }]}
                      >
                        <LinkSelect doctype="Offices" placeholder="Select Office" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>

                <Col xs={24} md={8} className="flex flex-col items-center justify-start border-l pl-6">
                  <Form.Item label="Profile Picture" className="w-full text-center">
                    <div className="mb-4">
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt="Profile Preview"
                          className="w-36 h-36 rounded-full object-cover border border-gray-300 mx-auto shadow-sm"
                        />
                      ) : (
                        <div className="w-36 h-36 rounded-full bg-gray-100 flex items-center justify-center border border-gray-300 border-dashed mx-auto">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <Upload
                      beforeUpload={handleProfilePictureUpload}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />}>Select Image</Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item name="workflow_state" label="Workflow Status" className="w-full">
                    <Select
                      options={[
                        { value: 'Draft', label: 'Draft' },
                        { value: 'Scheduling an appointment', label: 'Scheduling an appointment' },
                        { value: 'Accepted', label: 'Accepted' },
                        { value: 'Rejected', label: 'Rejected' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="place"
                label="Detailed Address"
                rules={[{ required: true, message: 'Please enter address' }]}
              >
                <Input.TextArea rows={2} placeholder="Detailed physical address description" />
              </Form.Item>

              <div className="mt-4 border-t pt-4">
                <h3 className="text-base font-semibold text-gray-700 mb-4">Contact Information & Pages</h3>
                <Row gutter={16}>
                  <Col xs={24} sm={8}>
                    <Form.Item name="email_address" label="Email Address">
                      <Input placeholder="email@address.com" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="facebook_page"
                      label="Facebook Page"
                      rules={[{ required: true, message: 'Please enter Facebook Page URL/Name' }]}
                    >
                      <Input placeholder="Facebook profile link" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item name="other_pages" label="Other Social Pages">
                      <Input placeholder="LinkedIn, Twitter, etc." />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Card>
          </TabPane>

          {/* TAB 2: SCIENTIFIC BACKGROUND */}
          <TabPane tab="Scientific Background" key="scientific">
            <Card bordered={false}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="how_many_quran"
                    label="The extent to which the Book of God has been preserved"
                    rules={[{ required: true, message: 'Please select memory level' }]}
                  >
                    <Select
                      placeholder="Select preservation level"
                      options={[
                        { value: 'القرآن الكريم كاملا', label: 'القرآن الكريم كاملا' },
                        { value: 'ثلاثة أرباع القرآن', label: 'ثلاثة أرباع القرآن' },
                        { value: 'نصف القرآن', label: 'نصف القرآن' },
                        { value: 'ثلث القرآن', label: 'ثلث القرآن' },
                        { value: 'ربع القرآن', label: 'ربع القرآن' },
                        { value: 'أقل من الربع', label: 'أقل من الربع' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="markez_tahfed"
                    label="Memorization Center"
                    rules={[{ required: true, message: 'Please select memorization center' }]}
                  >
                    <LinkSelect doctype="memorization_center" placeholder="Select center" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Qualifications Child Table */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-gray-700 m-0">Academic Qualifications</h3>
                  <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addQualification}>
                    Add Qualification
                  </Button>
                </div>
                
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <th className="border border-gray-200 p-2">Certificate Type</th>
                      <th className="border border-gray-200 p-2">Specialization</th>
                      <th className="border border-gray-200 p-2">Obtained Date</th>
                      <th className="border border-gray-200 p-2">Issuing Authority</th>
                      <th className="border border-gray-200 p-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualifications.map((row, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-200 p-1">
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
                        <td className="border border-gray-200 p-1">
                          <LinkSelect
                            doctype="Specialization"
                            value={row.specialization}
                            onChange={(val) => updateQualificationRow(idx, 'specialization', val)}
                          />
                        </td>
                        <td className="border border-gray-200 p-1">
                          <DatePicker
                            value={row.date_of_obtaining_the_certificate ? dayjs(row.date_of_obtaining_the_certificate) : null}
                            onChange={(date) => updateQualificationRow(idx, 'date_of_obtaining_the_certificate', date ? date.format('YYYY-MM-DD') : '')}
                            style={{ width: '100%' }}
                          />
                        </td>
                        <td className="border border-gray-200 p-1">
                          <LinkSelect
                            doctype="Issuing_Authority"
                            value={row.issuing_authority}
                            onChange={(val) => updateQualificationRow(idx, 'issuing_authority', val)}
                          />
                        </td>
                        <td className="border border-gray-200 p-1 text-center">
                          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteQualification(idx)} />
                        </td>
                      </tr>
                    ))}
                    {qualifications.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-gray-400 py-4">No qualifications listed. Click Add.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabPane>

          {/* TAB 3: STUDY DETAILS */}
          <TabPane tab="Sheikhs & Books" key="study">
            <Card bordered={false}>
              {/* Study Details under Scholars & Books child table */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-gray-700 m-0">Studied Books & Scholars</h3>
                  <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addBookStudied}>
                    Add Book Detail
                  </Button>
                </div>
                
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <th className="border border-gray-200 p-2">Sheikh Name</th>
                      <th className="border border-gray-200 p-2">Book Name</th>
                      <th className="border border-gray-200 p-2">Publication</th>
                      <th className="border border-gray-200 p-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {booksStudied.map((row, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-200 p-1">
                          <LinkSelect
                            doctype="Shaikh_Name"
                            value={row.sheikh_name}
                            onChange={(val) => updateBookRow(idx, 'sheikh_name', val)}
                          />
                        </td>
                        <td className="border border-gray-200 p-1">
                          <LinkSelect
                            doctype="sheikhs_books"
                            value={row.book_name}
                            onChange={(val) => updateBookRow(idx, 'book_name', val)}
                          />
                        </td>
                        <td className="border border-gray-200 p-1">
                          <Input
                            value={row.publication_of_the_book}
                            onChange={(e) => updateBookRow(idx, 'publication_of_the_book', e.target.value)}
                            placeholder="Publisher/Edition"
                          />
                        </td>
                        <td className="border border-gray-200 p-1 text-center">
                          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setBooksStudied(booksStudied.filter((_, i) => i !== idx))} />
                        </td>
                      </tr>
                    ))}
                    {booksStudied.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-gray-400 py-4">No books listed. Click Add.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Scholars List Table */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-gray-700 m-0">All Scholars Studied From</h3>
                  <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addScholar}>
                    Add Scholar
                  </Button>
                </div>
                
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <th className="border border-gray-200 p-2">Scholar Name</th>
                      <th className="border border-gray-200 p-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scholarsList.map((row, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-200 p-1">
                          <LinkSelect
                            doctype="Shaikh_Name"
                            value={row.shaikh}
                            onChange={(val) => updateScholarRow(idx, val)}
                          />
                        </td>
                        <td className="border border-gray-200 p-1 text-center">
                          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setScholarsList(scholarsList.filter((_, i) => i !== idx))} />
                        </td>
                      </tr>
                    ))}
                    {scholarsList.length === 0 && (
                      <tr>
                        <td colSpan={2} className="text-center text-gray-400 py-4">No scholars listed. Click Add.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabPane>

          {/* TAB 4: OUTREACH & TEACHING */}
          <TabPane tab="Outreach & Signature" key="outreach">
            <Card bordered={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-semibold text-gray-700 m-0">Subjects you tend to teach</h3>
                    <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addSubject}>
                      Add Subject
                    </Button>
                  </div>
                  
                  <table className="w-full border-collapse border border-gray-200 mb-6">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <th className="border border-gray-200 p-2">Subject</th>
                        <th className="border border-gray-200 p-2 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectsList.map((row, idx) => (
                        <tr key={idx}>
                          <td className="border border-gray-200 p-1">
                            <LinkSelect
                              doctype="subjects"
                              value={row.subjecte_name}
                              onChange={(val) => updateSubjectRow(idx, val)}
                            />
                          </td>
                          <td className="border border-gray-200 p-1 text-center">
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setSubjectsList(subjectsList.filter((_, i) => i !== idx))} />
                          </td>
                        </tr>
                      ))}
                      {subjectsList.length === 0 && (
                        <tr>
                          <td colSpan={2} className="text-center text-gray-400 py-4">No subjects listed. Click Add.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <Form.Item
                    name="recommendations"
                    label="Recommendations, licenses, and academic certificates and their dates"
                    rules={[{ required: true, message: 'Please enter recommendations/details' }]}
                  >
                    <Input.TextArea rows={4} placeholder="Enter description of recommendations" />
                  </Form.Item>

                  <Form.Item
                    name="attended_lessons"
                    label="The lessons and lectures that you attended, including the last lesson or lecture and the name of the sheikh?"
                    rules={[{ required: true, message: 'Please enter attended lessons' }]}
                  >
                    <Input.TextArea rows={4} placeholder="Describe details of lessons attended" />
                  </Form.Item>
                </div>

                <div className="flex flex-col items-center">
                  <h3 className="text-base font-semibold text-gray-700 w-full mb-3 text-center">
                    Signature of the concerned person
                  </h3>
                  <SignaturePad
                    value={signature}
                    onChange={setSignature}
                  />
                  {!signature && (
                    <p className="text-red-500 mt-2 text-xs">Signature is required to complete the application</p>
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
