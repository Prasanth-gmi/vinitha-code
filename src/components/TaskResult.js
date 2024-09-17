  import React, { useState, useEffect, useCallback } from 'react';
  import { jsPDF } from "jspdf";
  import { saveAs } from 'file-saver';
  import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
  import { Settings } from 'lucide-react';
  import { useNavigate } from 'react-router-dom';
  import confetti from 'canvas-confetti';
  import { motion } from 'framer-motion'; 
  import { X } from 'lucide-react';
  import config from './config'; 




  const AgentTasks = () => {
    const [currentTopic, setCurrentTopic] = useState("");
    const [currentTaskData, setCurrentTaskData] = useState("");
    const [activeAgent, setActiveAgent] = useState(null);
    const [results, setResults] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editableContent, setEditableContent] = useState("");
    const [mindmapUrl, setMindmapUrl] = useState("");
    const [isMindmapLoading, setIsMindmapLoading] = useState(false);
    const [topicType, setTopicType] = useState("general");
    const [validationMessage, setValidationMessage] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [industry, setIndustry] = useState("");
    const [reportContent, setReportContent] = useState("");
    const [designHtml, setDesignHtml] = useState('');
    const [designCss, setDesignCss] = useState('');
    const [taskGenerated, setTaskGenerated] = useState(false);
    const [jobRole, setJobRole] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [showCustomCreation, setShowCustomCreation] = useState(false); // New state for custom creation view
    const [createdAgent, setCreatedAgent] = useState(null);
    const [createdTask, setCreatedTask] = useState(null);
    const [executionResult, setExecutionResult] = useState(null);
    const [showCustomAgentForm, setShowCustomAgentForm] = useState(false);
    const [showHrmSubmenu, setShowHrmSubmenu] = useState(false);
    
    const navigate = useNavigate();


    const slideInFromLeft = {
      initial: { x: '-100%', opacity: 0 },
      animate: { x: '0%', opacity: 1, transition: { duration: 1, ease: 'easeInOut' } },
      exit: { x: '-100%', opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
    };
    
    const slideInFromRight = {
      initial: { x: '100%', opacity: 0 },
      animate: { x: '0%', opacity: 1, transition: { duration: 1, ease: 'easeInOut' } },
      exit: { x: '100%', opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
    };


    const slideInFromTop = {
      initial: { y: '-100%', opacity: 0 },
      animate: { y: '0%', opacity: 1, transition: { duration: 1, ease: 'easeInOut' } },
      exit: { y: '-100%', opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
    };

    const handleHrmClick = () => {
      setShowHrmSubmenu(!showHrmSubmenu);
    };
  
    const handleHrRecruitmentClick = () => {
      navigate('/hrm'); // Redirect to the HRM page
    };

    // Settings-related state
    const [availableAgents, setAvailableAgents] = useState([
      "Stakeholder", "Business Analyst", "Product Owner", "Scrum Master", "Designer", "Developer", "Tester", "Competitive Analyst", "Job Report", "Digital Marketing Agent"
    ]);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
  
  

    const handleCustomAgentClick = () => {
      setShowCustomAgentForm(true);
      setActiveAgent(null);
      setCreatedAgent(null);
      setCreatedTask(null);
      setExecutionResult(null);
    };


    
    const handleDateChange = (date) => {
      setSelectedDate(date);
    };

    useEffect(() => {
      if (activeAgent && currentTopic && activeAgent !== "Competitive Analyst" && activeAgent !== "Job Report") {
        generateTaskForAgent(activeAgent, currentTopic);
      }
    }, [activeAgent, currentTopic]);

    
  const handleAgentClick = (agent) => {
    setActiveAgent(agent);
    setShowCustomAgentForm(false);
    console.log("Agent selected:", agent);
    if (agent !== "Competitive Analyst" && agent !== "Job Report" && currentTopic) {
      generateTaskForAgent(agent, currentTopic);
    }
  };

  const handleCancelCustomAgent = () => {
    setShowCustomAgentForm(false);
    setActiveAgent(null);
  };

    const handleTopicChange = (event) => {
      setCurrentTopic(event.target.value);
      if (event.target.value) {
        setValidationMessage("");
      }
    };

    const handleTopicTypeChange = (event) => {
      if (currentTopic) {
        setTopicType(event.target.value);
        setValidationMessage("");
      } else {
        setValidationMessage("Please enter a topic before selecting the type.");
      }
    };
    const handleSubmit = async (event) => {
      event.preventDefault();
      console.log("Form submitted");
      console.log("Active Agent:", activeAgent);
    
      if (activeAgent === "Competitive Analyst") {
        generateCompetitiveReport();
      } else if (activeAgent === "Job Report") {
        console.log("Generating Job Report");
        handleJobReportSubmit();
      } else if (activeAgent === "Digital Marketing Agent") {
        handleDigitalMarketingSubmit();
      } else {
        if (!currentTopic) {
          setValidationMessage("Please enter a topic before generating tasks.");
          return;
        }
        if (!topicType) {
          setValidationMessage("Please select a topic type (General or Project) before generating tasks.");
          return;
        }
        setValidationMessage("");
        generateTaskForAgent(activeAgent, currentTopic);
      }
    };
    
    const handleDigitalMarketingSubmit = async () => {
      if (!currentTopic) {
        setValidationMessage("Please enter a topic for digital marketing.");
        return;
      }
    
      try {
        setTaskGenerated(false); // Reset task generated state
        const response = await fetch(`${config.apiBaseUrl}/digital_marketing_agent/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ topic: currentTopic }),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        setReportContent(data.result);
        const formattedReport = formatReportData(data.result);
        updateResults("Digital Marketing Agent", formattedReport);
        setTaskGenerated(true);
        toast.success("Digital marketing content generated successfully!");
      } catch (error) {
        console.error("Error generating digital marketing content:", error);
        setResults(`
          <div class="error-container">
            <h3>Error generating digital marketing content:</h3>
            <p>${error.message}</p>
          </div>
        `);
        setTaskGenerated(true);
        toast.error("Failed to generate digital marketing content. Please try again.");
      }
    };
    const generateTaskForAgent = async (agent, topic) => {
      try {
        const endpoint = `${config.apiBaseUrl}/${agent.toLowerCase().replace(/\s+/g, '_')}/`;
        console.log('Fetching from endpoint:', endpoint); // Log the endpoint
    
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ topic }),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.text();
        setCurrentTaskData(data);
        const formattedData = formatTaskData(data);
        setEditableContent(formattedData);
        updateResults(agent, formattedData);
        setTaskGenerated(true);
        setTimeout(() => {
          setEditableContent(formattedData);
          updateResults(agent, formattedData);
          setTaskGenerated(true);
        }, 500);
      } catch (error) {
        console.error(`Error with ${agent} task:`, error);
        console.error('Error details:', error.message); // Log more error details
        setResults(`
          <div class="error-container">
            <h3>Error with ${agent} task:</h3>
            <p>${error.message}</p>
            <p>Please check your network connection and API server status.</p>
          </div>
        `);
        setTaskGenerated(true);
      }
    };

    const generateCompetitiveReport = async () => {
      if (!companyName || !industry) {
        setValidationMessage("Please enter both company name and industry.");
        return;
      }

      try {
        const response = await fetch(`${config.apiBaseUrl}/generate_report/?company_name=${encodeURIComponent(companyName)}&industry=${encodeURIComponent(industry)}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.text();
        setReportContent(data);
        const formattedReport = formatReportData(data);
        updateResults("Competitive Analyst", formattedReport);
        setTaskGenerated(true);
      } catch (error) {
        console.error("Error generating competitive report:", error);
        setResults(`
          <div class="error-container">
            <h3>Error generating competitive report:</h3>
            <p>${error.message}</p>
          </div>
        `);
        setTaskGenerated(true);
      }
    };

    const formatTaskData = (data) => {
      const lines = data.split('\n');
      let formattedHtml = '';
      let inSubpoints = false;

      lines.forEach(line => {
        if (line.startsWith('#')) {
          if (inSubpoints) {
            formattedHtml += '</div>';
            inSubpoints = false;
          }
          const headingLevel = line.match(/^#+/)[0].length;
          const headingText = line.replace(/^#+\s*/, '');
          switch (headingLevel) {
            case 1:
              formattedHtml += `<h1 class="main-title">${headingText}</h1>`;
              break;
            case 2:
              formattedHtml += `<h2 class="section-title">${headingText}</h2>`;
              break;
            case 3:
              formattedHtml += `<h3 class="subsection-title">${headingText}</h3>`;
              break;
            case 4:
              formattedHtml += `<h4 class="topic-title">${headingText}</h4>`;
              break;
            default:
              formattedHtml += `<h${headingLevel} class="subtopic-title">${headingText}</h${headingLevel}>`;
          }
        } else if (line.trim().startsWith('-')) {
          if (!inSubpoints) {
            formattedHtml += '<div class="subpoints-panel">';
            inSubpoints = true;
          }
          formattedHtml += `<p>${line}</p>`;
        } else {
          if (inSubpoints) {
            formattedHtml += '</div>';
            inSubpoints = false;
          }
          formattedHtml += `<p>${line}</p>`;
        }
      });

      if (inSubpoints) {
        formattedHtml += '</div>';
      }

      return formattedHtml;
    };

    const formatReportData = (data) => {
      const lines = data.split('\n');
      let formattedHtml = '';
      let inList = false;

      lines.forEach(line => {
        if (line.startsWith('#')) {
          if (inList) {
            formattedHtml += '</ul>';
            inList = false;
          }
          const headingLevel = line.match(/^#+/)[0].length;
          const headingText = line.replace(/^#+\s*/, '');
          switch (headingLevel) {
            case 1:
              formattedHtml += `<h1 class="main-title">${headingText}</h1>`;
              break;
            case 2:
              formattedHtml += `<h2 class="section-title">${headingText}</h2>`;
              break;
            case 3:
              formattedHtml += `<h3 class="subsection-title">${headingText}</h3>`;
              break;
            case 4:
              formattedHtml += `<h4 class="topic-title">${headingText}</h4>`;
              break;
            default:
              formattedHtml += `<h${headingLevel} class="subtopic-title">${headingText}</h${headingLevel}>`;
          }
        } else if (line.trim().startsWith('-')) {
          if (!inList) {
            formattedHtml += '<ul>';
            inList = true;
          }
          formattedHtml += `<li>${line.replace(/^-/, '').trim()}</li>`;
        } else {
          if (inList) {
            formattedHtml += '</ul>';
            inList = false;
          }
          formattedHtml += `<p>${line}</p>`;
        }
      });

      if (inList) {
        formattedHtml += '</ul>';
      }

      return formattedHtml;
    };

    const triggerConfettiShower = () => {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }
    
      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
    
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
    
        const particleCount = 50 * (timeLeft / duration);
        
        // Create confetti from random positions
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 }
        }));
        confetti(Object.assign({}, defaults, { 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 }
        }));
      }, 250);

   
      // Add some large confetti for extra pop
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        scalar: 2
      });
    };

    const updateResults = useCallback((agent, content) => {
      setResults(`
        <div class="task-header">
          <h2 class="section-title">Generated ${agent === "Competitive Analyst" ? "Report" : "Task"} for ${agent}:</h2>
          <div class="action-buttons">
            <div class="download-container">
              <button class="download-btn">Download</button>
              <div class="download-options" style="display: none;">
                <button data-type="txt">TXT</button>
                <button data-type="pdf">PDF</button>
                <button data-type="doc">DOC</button>
              </div>
            </div>
            <button class="edit-button">Edit</button>
          </div>
        </div>
        <div class="task-container">
          <h1 class="main-title">${agent} ${agent === "Competitive Analyst" ? "Report" : "Task"}:</h1>
          <div id="editable-content" class="content-editable">${content}</div>
        </div>
      `);
      triggerConfettiShower();
    }, []);

    const downloadFile = useCallback((fileType) => {
      const fileName = `${activeAgent}_${activeAgent === "Competitive Analyst" ? "report" : "task"}.${fileType}`;
      let content = currentTaskData;

      switch (fileType) {
        case 'txt':
          downloadTextFile(fileName, content);
          break;
        case 'pdf':
          downloadPDFFile(fileName, content);
          break;
        case 'doc':
          downloadDOCFile(fileName, content);
          break;
        default:
          console.error("Unsupported file type:", fileType);
      }
    }, [currentTaskData, activeAgent]);

    const downloadTextFile = (fileName, content) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    };

    const downloadPDFFile = (fileName, content) => {
      const doc = new jsPDF();
      const splitContent = doc.splitTextToSize(content, 180);
      doc.text(splitContent, 10, 10);
      doc.save(fileName);
    };

    const downloadDOCFile = (fileName, content) => {
      const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
      const postHtml = "</body></html>";
      const html = preHtml + content + postHtml;
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    };

    const handleEdit = useCallback(() => {
      setIsEditing(true);
      const editableDiv = document.getElementById('editable-content');
      if (editableDiv) {
        editableDiv.contentEditable = 'true';
        editableDiv.focus();
      }
    }, []);

    const handleSave = () => {
      setIsEditing(false);
      const editableDiv = document.getElementById('editable-content');
      if (editableDiv) {
        editableDiv.contentEditable = 'false';
        const editedContent = editableDiv.innerHTML;
        setCurrentTaskData(editedContent);
        setEditableContent(editedContent);
        updateResults(activeAgent, editedContent);
      }
    };

    const handleCancel = () => {
      setIsEditing(false);
      const editableDiv = document.getElementById('editable-content');
      if (editableDiv) {
        editableDiv.contentEditable = 'false';
        editableDiv.innerHTML = editableContent;
      }
    };

    const generateMindmap = async () => {
          if (!currentTopic) {
            alert("Please enter a topic first.");
            return;
          }
    
          setIsMindmapLoading(true);
          try {
            const endpoint = topicType === "general" ? "/mindmap/" : "/mindmap_generator/";
            const formData = new FormData();
            formData.append(topicType === "general" ? 'topic' : 'project', currentTopic);
            formData.append('subtopics', "");
    
            const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
              method: "POST",
              body: formData,
            });
    
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
            const mindmap_file_path  = result.result;
    
            setMindmapUrl(`${config.apiBaseUrl}${ mindmap_file_path }`);
          } catch (error) {
            console.error("Error generating mindmap:", error);
            alert(`Error generating mindmap: ${error.message}`);
          } finally {
            setIsMindmapLoading(false);
          }
        };

    const generateDesign = async (topic) => {
      try {
        const formData = new FormData();
        formData.append('topic', topic);

        const response = await fetch(`${config.apiBaseUrl}/designer/`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const { result } = data;

        if (result && result.html_content && result.css_content) {
          setDesignHtml(result.html_content);
          setDesignCss(result.css_content);
          renderDesign(result.html_content, result.css_content);
        } else {
          throw new Error('Failed to generate design');
        }
      } catch (error) {
        console.error('Error generating design:', error);
        alert(`Error generating design: ${error.message}`);
      }
    };

    const renderDesign = (html, css) => {
      const designContainer = document.createElement('div');
      designContainer.innerHTML = html;

      const styleElement = document.createElement('style');
      styleElement.textContent = css;

      designContainer.prepend(styleElement);

      const resultsElement = document.getElementById('results');
      if (resultsElement) {
        resultsElement.innerHTML = '';
        resultsElement.appendChild(designContainer);
      }
    };

    useEffect(() => {
      const handleResultsClick = (e) => {
        if (e.target.classList.contains('edit-button')) {
          handleEdit();
        } else if (e.target.classList.contains('download-btn')) {
          const downloadOptions = e.target.nextElementSibling;
          if (downloadOptions) {
            downloadOptions.style.display = downloadOptions.style.display === 'none' ? 'block' : 'none';
          }
        } else if (e.target.closest('.download-options')) {
          const fileType = e.target.getAttribute('data-type');
          if (fileType) {
            downloadFile(fileType);
          }
        }
      };

      const resultsElement = document.getElementById('results');
      if (resultsElement) {
        resultsElement.addEventListener('click', handleResultsClick);
      }

      return () => {
        if (resultsElement) {
          resultsElement.removeEventListener('click', handleResultsClick);
        }
      };
    }, [handleEdit, downloadFile]);

    // Initialize selectedAgents with all available agents
    useEffect(() => {
      setSelectedAgents(availableAgents);
    }, [availableAgents]);

    const handleJobReportSubmit = async () => {
      console.log("Job Report Submit Called");
      if (!jobRole || !jobDescription) {
        setValidationMessage("Please enter both job role and description.");
        return;
      }
    
      try {
        console.log("Sending API Request");
        const queryParams = new URLSearchParams({
          job_role: jobRole,
          description: jobDescription
        });
        const url = `${config.apiBaseUrl}/Job_report/?${queryParams}`;
        
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Accept": "text/html",
          },
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.text();
        setReportContent(data);
        const formattedReport = formatReportData(data);
        updateResults("Job Report", formattedReport);
        setTaskGenerated(true);
      } catch (error) {
        console.error("Error generating job report:", error);
        setResults(`
          <div class="error-container">
            <h3>Error generating job report:</h3>
            <p>${error.message}</p>
          </div>
        `);
        setTaskGenerated(true);
      }
    };

    // New functions for settings and logout
    const toggleSettings = () => {
      setShowSettings(!showSettings);
      
    };

    const handleAgentSelection = (agent) => {
      setSelectedAgents(prev =>
        prev.includes(agent)
          ? prev.filter(a => a !== agent)
          : [...prev, agent]
      );
    };

    const applySettings = () => {
      setShowSettings(false);
    };

   

    
    const CustomCreationPage = () => {
      const [createdAgent, setCreatedAgent] = useState(null);
      const [createdTask, setCreatedTask] = useState(null);
      const [executionResult, setExecutionResult] = useState(null);
      const navigate = useNavigate();
    
      const handleNavigate = () => {
        navigate('/agent-tasks');
      };
    
      return (
        <div className="custom-creation-page">
       
          <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          {!executionResult ? (
            <>
              {!createdAgent ? (
                <CustomAgentCreation onAgentCreated={setCreatedAgent} />
              ) : (
                <>
                  {!createdTask ? (
                    <CustomTaskCreation agentName={createdAgent.name} onTaskCreated={setCreatedTask} />
                  ) : (
                    <CustomTaskExecution 
                      agentName={createdAgent.name} 
                      taskDescription={createdTask.description} 
                      onTaskExecuted={setExecutionResult}
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <TaskResult result={executionResult} onNavigate={handleNavigate} />
          )}
         
        </div>
      );
    };
    
    const CustomAgentCreation = ({ onAgentCreated }) => {
      const [agentName, setAgentName] = useState('');
      const [role, setRole] = useState('');
      const [goal, setGoal] = useState('');
      const [backstory, setBackstory] = useState('');
      const [selectedLLMType, setSelectedLLMType] = useState('ollama');
      const [selectedModel, setSelectedModel] = useState('');
      const [availableModels, setAvailableModels] = useState({});
      const [apiKey, setApiKey] = useState('');
      
      const navigate = useNavigate();
    
      useEffect(() => {
        fetchAvailableModels();
      }, []);
    
      const fetchAvailableModels = async () => {
        try {
          const response = await fetch(`${config.apiBaseUrl}/get-available-models/`);
          if (response.ok) {
            const models = await response.json();
            setAvailableModels(models);
            setSelectedLLMType('ollama');
            if (models.ollama && models.ollama.length > 0) {
              setSelectedModel(models.ollama[0]);
            }
          } else {
            toast.error('Failed to fetch available models');
          }
        } catch (error) {
          console.error('Error:', error);
          toast.error('An error occurred while fetching available models');
        }
      };
    
      const handleLLMTypeChange = (e) => {
        const newLLMType = e.target.value;
        setSelectedLLMType(newLLMType);
        if (availableModels[newLLMType] && availableModels[newLLMType].length > 0) {
          setSelectedModel(availableModels[newLLMType][0]);
        } else {
          setSelectedModel('');
        }
      };
    
      const handleCreateAgent = async (e) => {
        e.preventDefault();
        try {
          const formData = new FormData();
          formData.append('name', agentName);
          formData.append('role', role);
          formData.append('goal', goal);
          formData.append('backstory', backstory);
          formData.append('llm_type', selectedLLMType);
          formData.append('model_name', selectedModel);
          if (selectedLLMType === 'chatgroq') {
            formData.append('api_key', apiKey);
          }
    
          const response = await fetch(`${config.apiBaseUrl}/create-custom-agent/`, {
            method: 'POST',
            body: formData,
          });
    
          if (response.ok) {
            const result = await response.json();
            toast.success(result.message);
            onAgentCreated({ name: agentName, role, goal, backstory, llm_type: selectedLLMType, model: selectedModel });
          } else {
            const errorData = await response.json();
            toast.error(`Error: ${errorData.detail}`);
          }
        } catch (error) {
          console.error('Error:', error);
          toast.error('An error occurred while creating the custom agent.');
        }
      };
    
      const handleCancel = () => {
        navigate('/agent-tasks');
      };
    
      return (
        <motion.div
      className="custom-agent-container"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={ slideInFromLeft}  // Applying the right-to-left animation here
    >
        <div className="custom-agent-container">
    
         <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          <h2 className="custom-agent-title">Create Custom Agent</h2>
          <form onSubmit={handleCreateAgent} className="custom-agent-form">
            <label className="custom-agent-label">
              Agent Name
              <input
                type="text"
                className="custom-agent-input"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
              />
            </label>
            <label className="custom-agent-label">
              Role
              <input
                type="text"
                className="custom-agent-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </label>
            <label className="custom-agent-label">
              Goal
              <textarea
                className="custom-agent-input"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </label>
            <label className="custom-agent-label">
              Backstory
              <textarea
                className="custom-agent-input"
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                required
              />
            </label>
            <label className="custom-agent-label">
              Select LLM Type
              <select
                className="custom-agent-input"
                value={selectedLLMType}
                onChange={handleLLMTypeChange}
                required
              >
                <option value="ollama">Ollama</option>
                <option value="chatgroq">ChatGroq</option>
              </select>
            </label>
            <label className="custom-agent-label">
              Select Model
              <select
                className="custom-agent-input"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                required
              >
                {availableModels[selectedLLMType] && availableModels[selectedLLMType].map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </label>
            {selectedLLMType === 'chatgroq' && (
              <label className="custom-agent-label">
                API Key
                <input
                  type="password"
                  className="custom-agent-input"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </label>
            )}
            <div className="flex justify-between">
              <button type="submit" className="custom-agent-button">Create Custom Agent</button>
              <button type="button" onClick={handleCancel} className="custom-agent-buttons bg-gray-300 hover:bg-gray-400">Cancel</button>
            </div>
          </form>
        
        </div>
        </motion.div>
      );
    };
    const CustomTaskCreation = ({ agentName, onTaskCreated }) => {
      const [taskDescription, setTaskDescription] = useState('');
      const [expectedOutput, setExpectedOutput] = useState('');
      const [outputFile, setOutputFile] = useState('');
      const [toolName, setToolName] = useState('SerperTool');  // Default tool
      const [apiKey, setApiKey] = useState('');  // For tools that require API key
      const [showApiKeyInput, setShowApiKeyInput] = useState(true); // Show API key input based on tool
      const navigate = useNavigate();
    
      // Handle tool change
      const handleToolChange = (e) => {
        const selectedTool = e.target.value;
        setToolName(selectedTool);
    
        // Conditionally show API key input if the tool requires an API key
        if (selectedTool === 'SerperTool') {
          setShowApiKeyInput(true);
        } else {
          setShowApiKeyInput(false);
          setApiKey('');  // Clear API key if not required
        }
      };
    
      const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
          const formData = new FormData();
          formData.append('agent_name', agentName);
          formData.append('task_description', taskDescription);
          formData.append('expected_output', expectedOutput);
          formData.append('output_file', outputFile.replace(/\s+/g, '_'));
          formData.append('tool_name', toolName);  // Pass the selected tool
          if (showApiKeyInput) formData.append('api_key', apiKey);  // Pass API key if applicable
    
          const response = await fetch(`${config.apiBaseUrl}/create-custom-task/ `, {
            method: 'POST',
            body: formData,
          });
    
          if (response.ok) {
            const result = await response.json();
            toast.success(result.message);
            onTaskCreated({ description: taskDescription, expectedOutput, outputFile: outputFile.replace(/\s+/g, '_') });
          } else {
            const errorData = await response.json();
            toast.error(`Error: ${errorData.detail}`);
          }
        } catch (error) {
          console.error('Error:', error);
          toast.error('An error occurred while creating the custom task.');
        }
      };
    
      const handleCancel = () => {
        navigate('/agent-tasks');
      };
    
      return (
        <motion.div
      className="custom-agent-container"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={ slideInFromRight}  // Applying the right-to-left animation here
    >
        <div className="custom-agent-container">
         <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          <h2 className="custom-agent-title">Create Custom Task</h2>
          <form onSubmit={handleCreateTask} className="custom-agent-form">
            <p style={{ color: 'black' }}>Creating task for agent: {agentName}</p>
            <label className="custom-agent-label">
              Task Description
              <textarea
                className="custom-agent-input"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                required
              />
            </label>
            <label className="custom-agent-label">
              Expected Output
              <textarea
                className="custom-agent-input"
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                required
              />
            </label>
            <label className="custom-agent-label">
              Output File
              <input
                type="text"
                className="custom-agent-input"
                value={outputFile}
                onChange={(e) => setOutputFile(e.target.value)}
                required
              />
            </label>
    
            {/* Tool Selection */}
            <label className="custom-agent-label">
              Select Tool
              <select
                className="custom-agent-input"
                value={toolName}
                onChange={handleToolChange}
                required
              >
                <option value="SerperTool">Serper Tool</option>
                <option value="FileReadTool">File Read Tool</option>
                {/* Add more tools here */}
              </select>
            </label>
    
            {/* Conditionally render the API Key input */}
            {showApiKeyInput && (
              <label className="custom-agent-label">
                API Key
                <input
                  type="text"
                  className="custom-agent-input"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required={showApiKeyInput}
                />
              </label>
            )}
    
            <div className="flex justify-between">
              <button type="submit" className="custom-agent-button">Create Custom Task</button>
              <button type="button" onClick={handleCancel} className="custom-agent-buttons bg-gray-300 hover:bg-gray-400">Cancel</button>
            </div>
          </form>
        </div>
        </motion.div>
      );
    };
    
    const CustomTaskExecution = ({ agentName, taskDescription, onTaskExecuted }) => {
      const navigate = useNavigate();
    
      const handleExecuteTask = async (e) => {
        e.preventDefault();
        try {
          const formData = new FormData();
          formData.append('agent_name', agentName);
          formData.append('task_description', taskDescription);
    
          const response = await fetch(`${config.apiBaseUrl}/execute-custom-task/`, {
            method: 'POST',
            body: formData,
          });
    
          if (response.ok) {
            const result = await response.json();
            toast.success('Task executed successfully');
            onTaskExecuted(result.result);
          } else {
            const errorData = await response.json();
            toast.error(`Error: ${errorData.detail}`);
          }
        } catch (error) {
          console.error('Error:', error);
          toast.error('An error occurred while executing the custom task.');
        }
      };
    
      const handleCancel = () => {
        navigate('/agent-tasks');
      };
    
      return (
        <motion.div
        className="custom-agent-container"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={ slideInFromTop}  // Applying the right-to-left animation here
      >
        <div className="custom-task-execution-container">
         <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          <h2 className="custom-task-execution-title">Execute Custom Task</h2>
          <form onSubmit={handleExecuteTask} className="custom-task-execution-form">
            <p>Agent Name: {agentName}</p>
            <p>Task Description: {taskDescription}</p>
            <div className="flex justify-between">
              <button type="submit" className="custom-task-execution-button">Execute Task</button>
              <button type="button" onClick={handleCancel} className="custom-task-execution-buttons bg-gray-300 hover:bg-gray-400">Cancel</button>
            </div>
          </form>
        </div>
        </motion.div>
      );
    };
    const TaskResult = ({ result, onNavigate }) => {
      const [editedResult, setEditedResult] = useState(result);
      const [isEditing, setIsEditing] = useState(false);
      const [isDownloadOpen, setIsDownloadOpen] = useState(false);
    
      const handleDownload = (fileType) => {
        if (fileType === 'pdf') {
          const doc = new jsPDF();
          doc.text(editedResult, 10, 10);
          doc.save('task_result.pdf');
        } else {
          const blob = new Blob([editedResult], { type: 'text/plain;charset=utf-8' });
          const fileExtension = fileType === 'tex' ? 'tex' : 'doc';
          saveAs(blob, `task_result.${fileExtension}`);
        }
        setIsDownloadOpen(false);
      };
    
      const handleEdit = () => {
        setIsEditing(true);
      };
    
      const handleSave = () => {
        setIsEditing(false);
        toast.success('Result updated successfully');
      };
    
      const handleCancel = () => {
        setIsEditing(false);
        setEditedResult(result);
      };
    
      return (
        <div className="task-result-card">
          <h3 className="task-result-header">Task Execution Result</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div className="relative inline-block">
              <button 
                onClick={() => setIsDownloadOpen(!isDownloadOpen)} 
                style={{
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  padding: '10px 15px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  borderRadius: '5px',
                }}
              >
                Download
              </button>
              {isDownloadOpen && (
                <div style={{ position: 'absolute', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '5px', zIndex: 1 }}>
                  {['TXT', 'PDF', 'DOC'].map((type) => (
                    <button 
                      key={type}
                      onClick={() => handleDownload(type.toLowerCase())} 
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
    
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={isEditing ? handleSave : handleEdit} 
                style={{
                  backgroundColor: '#008CBA', 
                  color: 'white', 
                  padding: '10px 15px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  borderRadius: '5px',
                  width: '80px',
                }}
              >
                {isEditing ? 'Save' : 'Edit'}
              </button>
              <button 
                onClick={isEditing ? handleCancel : onNavigate} 
                style={{
                  backgroundColor: '#008CBA', 
                  color: 'white', 
                  padding: '10px 15px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  borderRadius: '5px',
                  width: '80px',
                }}
              >
                {isEditing ? 'Cancel' : 'Ok'}
              </button>
            </div>
          </div>
    
          <div className="task-result-content">
            {isEditing ? (
              <textarea
                value={editedResult}
                onChange={(e) => setEditedResult(e.target.value)}
                style={{ width: '1500px',  height: '1500px', padding: '10px',backgroundColor: '#f5f5f5', whiteSpace: 'pre-wrap', }}
              />
            ) : (
              <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{editedResult}</pre>
            )}
          </div>
        </div>
      );
    };
    return (
      <div className="container">
       
        <div className="sidebar">
          <h2 className="section-title">
            <span>
              {/* <img src="images.png" alt="Logo" className="sidebar-logo" /> */}
            </span>
            Agents
          </h2>
          <ul className="agent-list">
            {selectedAgents.map((agent, index) => (
              <li key={index}>
                <button
                  onClick={() => handleAgentClick(agent)}
                  className={activeAgent === agent ? 'active' : ''}
                >
                  {agent}
                </button>
              </li>
            ))}
            <li>
              <button onClick={handleCustomAgentClick} className="custom-agent-button">
                Custom Agent
              </button>
            </li>
            <li>
              <button onClick={handleHrmClick}>HRM</button>
              {showHrmSubmenu && (
                <ul className="submenu">
                  <li>
                    <button onClick={handleHrRecruitmentClick}>HR Recruitment</button>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
        {showSettings && (
          <div className="settings-panel">
            <h3>Select Agents to Display</h3>
            {availableAgents.map((agent, index) => (
              <label key={index}>
                <input
                  type="checkbox"
                  checked={selectedAgents.includes(agent)}
                  onChange={() => handleAgentSelection(agent)}
                />
                {agent}
              </label>
            ))}
            <button onClick={applySettings}>Apply</button>  
            
           
          </div>
        )}
        <div className="main-content">
          {/* <img src="image.png" alt="Logo" className="sidebars-logo" /> */}
          <div className="header">
            <h1 className="main-title">Agent Tasks</h1>
            <button onClick={toggleSettings} className="settings-icon-button">
              <Settings size={34} />
            </button>
          </div>
        
          {showCustomAgentForm ? (
            
          <>
            {!createdAgent ? (
              <CustomAgentCreation 
                onAgentCreated={(agent) => {
                  setCreatedAgent(agent);
                  toast.success(`Agent "${agent.name}" created successfully!`);
                }}
                onCancel={() => setShowCustomAgentForm(false)}
              />
            ) : !createdTask ? (
              <CustomTaskCreation 
                agentName={createdAgent.name}
                onTaskCreated={(task) => {
                  setCreatedTask(task);
                  toast.success(`Task created successfully for agent "${createdAgent.name}"!`);
                }}
              />
            ) : !executionResult ? (
              <CustomTaskExecution 
                agentName={createdAgent.name}
                taskDescription={createdTask.description}
                onTaskExecuted={(result) => {
                  setExecutionResult(result);
                  toast.success(`Task executed successfully!`);
                }}
              />
            ) : (
              <TaskResult 
                result={executionResult}
                onNavigate={() => {
                  setShowCustomAgentForm(false);
                  setCreatedAgent(null);
                  setCreatedTask(null);
                  setExecutionResult(null);
                }}
              />
            )}
          </>
        ) : (
            <form onSubmit={handleSubmit} className="task-form">
              {/* Existing form content remains unchanged */}
              {activeAgent === "Competitive Analyst" ? (
                <>
                  <label htmlFor="companyName" className="input-label">Company Name:</label>
                  <input
                    type="text"
                    id="companyNameInput"
                    name="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="e.g., Acme Corp"
                    className="input-field"
                  />
                  <label htmlFor="industry" className="input-label">Industry:</label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    required
                    placeholder="e.g., Technology"
                    className="input-field"
                  />
                </>
              ) : activeAgent === "Job Report" ? (
                <>
                  <label htmlFor="jobRole" className="input-label">Job Role:</label>
                  <input
                    type="text"
                    id="jobRole"
                    name="jobRole"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    required
                    placeholder="e.g., Software Engineer"
                    className="input-field"
                  />
                  <label htmlFor="jobDescription" className="input-label">Job Description:</label>
                  <textarea
                    id="jobDescription"
                    name="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                    placeholder="Enter the job description"
                    className="input-field"
                    rows="4"
                  />
                </>
                  ) : activeAgent === "Digital Marketing Agent" ? (
                  <>
                    <label htmlFor="topic" className="input-label">Enter your marketing topic:</label>
                    <input
                      type="text"
                      id="topic"
                      name="topic"
                      value={currentTopic}
                      onChange={handleTopicChange}
                      required
                      placeholder="e.g., New Product Launch"
                      className="input-field"
                    />
                  </>
 
                
              ) : (
                   
                <>
                  <label htmlFor="topic" className="input-label">Enter your topic:</label>
                  <input
                    type="text"
                    id="topic"
                    name="topic"
                    value={currentTopic}
                    onChange={handleTopicChange}
                    required
                    placeholder="e.g., Project Management"
                    className="input-field"
                  />
                  {currentTopic && (
                    <div className="topic-type-selection">
                      <label className="input-label">
                        <input
                          type="radio"
                          value="general"
                          checked={topicType === "general"}
                          onChange={handleTopicTypeChange}
                        />
                        General
                      </label>
                      <label className="input-label">
                        <input
                          type="radio"
                          value="project"
                          checked={topicType === "project"}
                          onChange={handleTopicTypeChange}
                        />
                        Project
                      </label>
                    </div>
                  )}
                </>
              )}
              {validationMessage && (
                <div className="validation-message">{validationMessage}</div>
              )}
  
              <button type="submit" className="generate-button">
    Generate {activeAgent === "Competitive Analyst" ? "Report" : 
              activeAgent === "Job Report" ? "Job Report" : 
              activeAgent === "Digital Marketing Agent" ? "Marketing Content" : 
              "Tasks"}
  </button>

  
              {activeAgent !== "Competitive Analyst" && activeAgent !== "Job Report" && (
                <button
                  type="button"
                  onClick={generateMindmap}
                  disabled={isMindmapLoading || !currentTopic || !topicType}
                  className="mindmap-button"
                >
                  {isMindmapLoading ? 'Generating Mindmap...' : 'Generate Mindmap'}
                </button>
              )}
  
              {activeAgent === "Designer" && (
                <button
                  type="button"
                  onClick={() => generateDesign(currentTopic)}
                  disabled={!currentTopic}
                  className="mindmap-button"
                >
                  Generate Design
                </button>
              )}
            </form>
          )}
          {taskGenerated && (
            <>
              {isEditing && (
                <div className="edit-buttons">
                  <button className="save-button" onClick={handleSave}>Save</button>
                  <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                </div>
              )}
              <div
                id="results"
                dangerouslySetInnerHTML={{ __html: results }}
              />
            </>
          )}
  
          {mindmapUrl && (
            <div className="mindmap-container">
              <h2 className="section-title">Generated Mindmap:</h2>
              <iframe src={mindmapUrl} width="100%" height="600px" title="Generated Mindmap" />
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default AgentTasks;
  
  
  