import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Component imports
import TaskResult from './components/TaskResult';

import HRMPage from './components/HRMPage';

import './App.css';

function App() {
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentAgent, setCurrentAgent] = useState('');
  const [taskData, setTaskData] = useState('');

  const handleTopicSubmit = (topic) => {
    setCurrentTopic(topic);
  };

  const handleAgentSelect = (agent) => {
    setCurrentAgent(agent);
  };

  const handleTaskGenerated = (data) => {
    setTaskData(data);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/agent-tasks"
          element={
            <div className="container">
              <div className="main-content">
                <TaskResult
                  agent={currentAgent}
                  topic={currentTopic}
                  taskData={taskData}
                  onTaskGenerated={handleTaskGenerated}
                  onTopicSubmit={handleTopicSubmit}
                  onAgentSelect={handleAgentSelect}
                />
              </div>
            </div>
          }
        />

        <Route path="/hrm" element={<HRMPage />} />
       
       
        <Route path="*" element={<Navigate to="/agent-tasks" />} />
      </Routes>
    </Router>
  );
}

export default App;


