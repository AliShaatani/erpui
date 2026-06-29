import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FrappeProvider } from 'frappe-react-sdk';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { WaedInfoList } from './pages/WaedInfoList';
import { WaedInfoForm } from './pages/WaedInfoForm';
import { ExamLagList } from './pages/ExamLagList';
import { ExamLagForm } from './pages/ExamLagForm';
import { ExamGroupList } from './pages/ExamGroupList';
import { ExamGroupForm } from './pages/ExamGroupForm';
import './App.css';

function App() {
  return (
    <FrappeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Dashboard routes */}
            <Route path="/TAQ_UI" element={<Dashboard />} />
            <Route path="/TAQ_UI/" element={<Dashboard />} />
            
            {/* Preachers (waed_info) routes */}
            <Route path="/TAQ_UI/waed_info" element={<WaedInfoList />} />
            <Route path="/TAQ_UI/waed_info/:name" element={<WaedInfoForm />} />
            
            {/* Committee (exam_lag_data) routes */}
            <Route path="/TAQ_UI/exam_lag_data" element={<ExamLagList />} />
            <Route path="/TAQ_UI/exam_lag_data/:name" element={<ExamLagForm />} />
            
            {/* Exam scheduling (exam_group_date) routes */}
            <Route path="/TAQ_UI/exam_group_date" element={<ExamGroupList />} />
            <Route path="/TAQ_UI/exam_group_date/:name" element={<ExamGroupForm />} />
            
            {/* Fallback routes */}
            <Route path="/" element={<Navigate to="/TAQ_UI" replace />} />
            <Route path="*" element={<Navigate to="/TAQ_UI" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </FrappeProvider>
  );
}

export default App;
