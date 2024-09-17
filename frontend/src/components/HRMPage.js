// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { LogOut, Upload, Download, Edit } from 'lucide-react';
// import { jsPDF } from "jspdf";
// import ReactMarkdown from 'react-markdown';

// const HRMPage = () => {
//   const navigate = useNavigate();
//   const [activeAgent, setActiveAgent] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState({
//     Position: '',
//     Number_of_Openings: 0,
//     Experience_Level: '',
//     Branch: '',
//     Location: '',
//     Primary_Skills: '',
//     Desired_Skills: '',
//     Certifications: '',
//     Job_Description: '',
//     input_file: '',
//     email: '',
//     password: ''
//   });
//   const [result, setResult] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [markdownContent, setMarkdownContent] = useState('');

//   const handleInputChange = (e) => {
//     const { name, value, type, files } = e.target;
//     if (type === 'file') {
//       const file = files[0];
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         const fileContent = event.target.result;
//         const base64Content = btoa(fileContent);
//         setFormData(prevData => ({
//           ...prevData,
//           [name]: base64Content
//         }));
//       };
//       reader.readAsBinaryString(file);
//     } else {
//       setFormData(prevData => ({
//         ...prevData,
//         [name]: name === 'Number_of_Openings' ? parseInt(value, 10) : value
//       }));
//     }
//   };

//   useEffect(() => {
//     console.log("Current result state:", result);
//   }, [result]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setResult(null);
  
//     let baseEndpoint;
//     let queryParams = new URLSearchParams();
  
//     if (activeAgent === 'Hiring_manager') {
//       baseEndpoint = 'http://localhost:8080/execute_crew_tasks/';
//       Object.keys(formData).forEach(key => {
//         if (key !== 'input_file' && key !== 'email' && key !== 'password') {
//           queryParams.append(key, formData[key]);
//         }
//       });
//     } else {
//       baseEndpoint = 'http://localhost:8080/execute_additional_tasks/';
//       queryParams.append('input_file', formData.input_file);
//       queryParams.append('email', formData.email);
//       queryParams.append('password', formData.password);
//     }
  
//     const endpoint = `${baseEndpoint}?${queryParams.toString()}`;
  
//     try {
//       console.log("Sending request to:", endpoint);
//       const response = await fetch(endpoint, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
  
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
  
//       const data = await response.json();
//       console.log("API Response Data:", data);
  
//       if (data) {
//         setResult(data);
//         console.log("Result set:", data);
        
//         if (activeAgent === 'Hiring_manager' && data.job_description_content) {
//           setMarkdownContent(data.job_description_content);
//         } else if (activeAgent === 'Job_analyst' && data.job_skills_content) {
//           setMarkdownContent(data.job_skills_content);
//         }
//       } else {
//         console.error("Received data does not contain expected result fields:", data);
//         setResult({ error: "Received data does not contain expected result fields" });
//       }
  
//       setShowForm(false);
//       setIsEditing(false);
//     } catch (error) {
//       console.error("Error executing tasks:", error);
//       setResult({ error: `Error: ${error.message}` });
//     }
//   };
//     const handleLogout = () => {
//       navigate('/login');
//     };

//     const handleAgentClick = (agent) => {
//       setActiveAgent(agent);
//       setShowForm(true);
//       setResult(null);
//       setIsEditing(false);
//       setMarkdownContent('');
//     };

   
//   const handleDownload = () => {
//     console.log("Download button clicked. Current result:", result);
//     if (result && (result.crew_task_results || result.additional_crew_task_results || result.job_description_content)) {
//       try {
//         const doc = new jsPDF();
//         const margin = 20;
//         const lineHeight = 7;
//         const maxWidth = 170;

//         doc.setFontSize(16);
//         doc.text("HRM Result", margin, margin);

//         doc.setFontSize(12);
//         let yPosition = margin + 10;

//         const addContent = (title, content) => {
//           if (content) {
//             doc.setFontSize(14);
//             doc.text(title, margin, yPosition);
//             yPosition += lineHeight * 1.5;
//             doc.setFontSize(12);

//             const cleanContent = typeof content === 'string' 
//               ? content.replace(/\*\*/g, '') 
//               : JSON.stringify(content, null, 2).replace(/\*\*/g, '');
//             const lines = doc.splitTextToSize(cleanContent, maxWidth);
//             lines.forEach((line) => {
//               if (yPosition > 280) {
//                 doc.addPage();
//                 yPosition = margin;
//               }
//               doc.text(line, margin, yPosition);
//               yPosition += lineHeight;
//             });
//             yPosition += lineHeight * 2;
//           }
//         };

//         addContent("Crew Task Results:", result.crew_task_results);
//         addContent("Additional Crew Task Results:", result.additional_crew_task_results);
//         addContent("Job Description:", result.job_description_content);

//         doc.save("hrm_result.pdf");
//       } catch (error) {
//         console.error("Error generating PDF:", error);
//         alert("Error generating PDF. Please check the console for details.");
//       }
//     } else {
//       console.error("No valid result available for download.");
//       alert("No valid result available for download. Please submit the form first.");
//     }
//   };

//     const handleEdit = () => {
//       setIsEditing(true);
//       setShowForm(true);
//       if (result && result.crew_task_results) {
//         const parsedResult = typeof result.crew_task_results === 'string' ? result.crew_task_results : JSON.stringify(result.crew_task_results);
//         const lines = parsedResult.split('\n');
//         const updatedFormData = {...formData};
//         lines.forEach(line => {
//           const [key, value] = line.split(':**').map(item => item.trim());
//           if (key && value) {
//             updatedFormData[key.replace(/ /g, '_')] = value;
//           }
//         });
//         setFormData(updatedFormData);
//       }
//     };

//     const formatResult = (result) => {
//       if (!result) return <p>No result available.</p>;
    
//       if (typeof result === 'object') {
//         if (result.crew_task_results) {
//           return (
//             <>
//               <h4>Crew Task Results:</h4>
//               {result.crew_task_results.split('\n').map((line, index) => (
//                 <p key={index} style={{ color: 'black' }}>{line}</p>
//               ))}
//             </>
//           );
//         }
//         if (result.additional_crew_task_results) {
//           return (
//             <>
//               <h4>Additional Crew Task Results:</h4>
//               {result.additional_crew_task_results.split('\n').map((line, index) => (
//                 <p key={index} style={{ color: 'black' }}>{line}</p>
//               ))}
//             </>
//           );
//         }
//       }
    
//       if (typeof result === 'string') {
//         return result.split('\n').map((line, index) => (
//           <p key={index} style={{ color: 'black' }}>{line}</p>
//         ));
//       }
    
    
//     };

//     return (
//       <div className="container">
//         <div className="sidebar">
//           <h2 className="section-title">
//             <img src="images.png" alt="Logo" className="sidebar-logo" />
//             HRM Dashboard
//           </h2>
//           <ul className="agent-list">
//             <li>
//               <button 
//                 onClick={() => handleAgentClick('Hiring_manager')} 
//                 className={activeAgent === 'Hiring_manager' ? "active" : ""}
//               >
//                 Hiring Manager
//               </button>
//             </li>
//             <li>
//               <button 
//                 onClick={() => handleAgentClick('Job_analyst')} 
//                 className={activeAgent === 'Job_analyst' ? "active" : ""}
//               >
//                 Job Analyst
//               </button>
//             </li>
//           </ul>
//         </div>

//         <div className="main-content">
//           <img src="image.png" alt="Logo" className="sidebars-logo" />
//           <div className="header">
//             <h1 className="main-title">Human Resource Management</h1>
//             <button onClick={handleLogout} className="logout-button">
//               <LogOut size={24} />
//               Logout
//             </button>
//           </div>

//           <div className="hrm-content">
//         <h2 className="hr-recruitment-title"  style={{ color: 'black' }}>HR Recruitment</h2>
//         {showForm && (
//           <form onSubmit={handleSubmit}>
//             {activeAgent === 'Hiring_manager' ? (
//               <>
//                 <div className="form-field">
//                   <label htmlFor="Position">Position:</label>
//                   <input
//                     type="text"
//                     id="Position"
//                     name="Position"
//                     value={formData.Position}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div className="form-field">
//                   <label htmlFor="Number_of_Openings">Number of Openings:</label>
//                   <input
//                     type="number"
//                     id="Number_of_Openings"
//                     name="Number_of_Openings"
//                     value={formData.Number_of_Openings}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div className="form-field">
//                   <label htmlFor="Experience_Level">Experience Level:</label>
//                   <input
//                     type="text"
//                     id="Experience_Level"
//                     name="Experience_Level"
//                     value={formData.Experience_Level}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div className="form-field">
//                   <label htmlFor="Branch">Branch:</label>
//                   <input
//                     type="text"
//                     id="Branch"
//                     name="Branch"
//                     value={formData.Branch}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div className="form-field">
//                   <label htmlFor="Location">Location:</label>
//                   <input
//                     type="text"
//                     id="Location"
//                     name="Location"
//                     value={formData.Location}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div className="form-field">
//                   <label htmlFor="Primary_Skills">Primary Skills:</label>
//                   <input
//                     type="text"
//                     id="Primary_Skills"
//                     name="Primary_Skills"
//                     value={formData.Primary_Skills}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div className="form-field">
//                   <label htmlFor="Desired_Skills">Desired Skills:</label>
//                   <input
//                     type="text"
//                     id="Desired_Skills"
//                     name="Desired_Skills"
//                     value={formData.Desired_Skills}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div className="form-field">
//                   <label htmlFor="Certifications">Certifications:</label>
//                   <input
//                     type="text"
//                     id="Certifications"
//                     name="Certifications"
//                     value={formData.Certifications}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div className="form-field">
//                   <label htmlFor="Job_Description">Job Description:</label>
//                   <textarea
//                     id="Job_Description"
//                     name="Job_Description"
//                     value={formData.Job_Description}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className="form-field">
//                       <label htmlFor="input_file">Upload PDF File:</label>
//                       <input
//                         type="file"
//                         id="input_file"
//                         name="input_file"
//                         accept=".pdf"
//                         onChange={handleInputChange}
//                         required
//                         style={{ color: 'black' }}
//                       />
//                     </div>
//                 <div className="form-field">
//                   <label htmlFor="email">Email:</label>
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div className="form-field">
//                   <label htmlFor="password">Password:</label>
//                   <input
//                     type="password"
//                     id="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//               </>
//             )}
//             <button type="submit" className="submit-button">
//               Submit
//             </button>
//           </form>
//         )}
//         {result && (
//           <div className="result-section">
//             <h3 style={{ color: 'black' }}>Result</h3>
//             {formatResult(result)}
//             {markdownContent && (
//               <div className="markdown-content" style={{ color: 'black' }}>
//                 <ReactMarkdown>{markdownContent}</ReactMarkdown>
//               </div>
//             )}
//             <button onClick={handleDownload} className="download-button">
//               <Download size={24} />
//               Download PDF
//             </button>
//             <button onClick={handleEdit} className="edit-button">
//               <Edit size={24} />
//               Edit
//             </button>
//           </div>
//         )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   export default HRMPage;
  
// // import React, { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { LogOut, Upload, Download, Edit } from 'lucide-react';
// // import { jsPDF } from "jspdf";

// // const HRMPage = () => {
// //   const navigate = useNavigate();
// //   const [activeAgent, setActiveAgent] = useState(null);
// //   const [showForm, setShowForm] = useState(false);
// //   const [formData, setFormData] = useState({
// //     Position: '',
// //     Number_of_Openings: 0,
// //     Experience_Level: '',
// //     Branch: '',
// //     Location: '',
// //     Primary_Skills: '',
// //     Desired_Skills: '',
// //     Certifications: '',
// //     Job_Description: '',
// //     email: '',
// //     password: '',
// //     fileName: ''
// //   });
// //   const [result, setResult] = useState(null);
// //   const [inputFile, setInputFile] = useState(null);
// //   const [isEditing, setIsEditing] = useState(false);

// //   const handleInputChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((prevData) => ({
// //       ...prevData,
// //       [name]: name === 'Number_of_Openings' ? parseInt(value, 10) : value
// //     }));
// //   };

// //   const handleFileChange = (e) => {
// //     const file = e.target.files[0];
// //     setInputFile(file);
// //     setFormData(prevData => ({
// //       ...prevData,
// //       fileName: file ? file.name : ''
// //     }));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setResult(null);
  
// //     let endpoint = activeAgent === 'Hiring_manager' 
// //       ? 'http://localhost:8080/execute_crew_tasks/' 
// //       : 'http://localhost:8080/execute_additional_tasks/';
  
// //     const queryParams = new URLSearchParams();
  
// //     if (activeAgent === 'Hiring_manager') {
// //       Object.entries(formData).forEach(([key, value]) => {
// //         if (value !== '') {
// //           queryParams.append(key, value);
// //         }
// //       });
// //     } else {
// //       // Job_analyst
// //       queryParams.append('input_file', formData.fileName);
// //       queryParams.append('file_path', formData.fileName);
// //       queryParams.append('email', formData.email);
// //       queryParams.append('password', formData.password);
// //     }
  
// //     endpoint += `?${queryParams.toString()}`;
  
// //     try {
// //       const response = await fetch(endpoint, {
// //         method: 'GET',
// //       });
  
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! Status: ${response.status}`);
// //       }
  
// //       const data = await response.json();
// //       setResult(data);
// //       setShowForm(false);
// //       setIsEditing(false);
// //     } catch (error) {
// //       console.error("Error executing tasks:", error);
// //       setResult({ message: `Error: ${error.message}` });
// //     }
// //   };

// //   const handleLogout = () => {
// //     navigate('/login');
// //   };

// //   const handleAgentClick = (agent) => {
// //     setActiveAgent(agent);
// //     setShowForm(true);
// //     setResult(null);
// //     setIsEditing(false);
// //   };
// //   const handleDownload = () => {
// //     if (result && result.result) {
// //       const doc = new jsPDF();
// //       const margin = 20;
// //       const lineHeight = 7;
// //       const maxWidth = 180; // Maximum width of text in PDF
// //       const content = typeof result.result === 'string' ? result.result : JSON.stringify(result.result, null, 2);
  
// //       doc.setFontSize(16);
// //       doc.text("HRM Task Result", margin, margin);
      
// //       doc.setFontSize(12);
// //       let yPosition = margin + 10; // Start position for text
  
// //       const lines = doc.splitTextToSize(content, maxWidth);
// //       lines.forEach(line => {
// //         if (yPosition > 280) {
// //           doc.addPage();
// //           yPosition = margin;
// //         }
// //         doc.text(line, margin, yPosition);
// //         yPosition += lineHeight;
// //       });
  
// //       doc.save("hrm_result.pdf");
// //     }
// //   };

// //   const handleEdit = () => {
// //     setIsEditing(true);
// //     setShowForm(true);
// //     if (result && result.result) {
// //       const parsedResult = typeof result.result === 'string' ? result.result : JSON.stringify(result.result);
// //       const lines = parsedResult.split('\n');
// //       const updatedFormData = {...formData};
// //       lines.forEach(line => {
// //         const [key, value] = line.split(':**').map(item => item.trim());
// //         if (key && value) {
// //           updatedFormData[key.replace(/ /g, '_')] = value;
// //         }
// //       });
// //       setFormData(updatedFormData);
// //     }
// //   };
// //   const formatResult = (result) => {
// //     if (!result) return null;
  
// //     // Ensure the result is processed only once, avoiding duplicate outputs
// //     const uniqueTaskOutputs = [];
// //     const seenRawOutputs = new Set();
  
// //     // Function to remove '*' and '**' formatting and return plain text
// //     const cleanFormatting = (text) => {
// //       return text.replace(/\*\*/g, '').replace(/\*/g, '').trim(); // Removes ** and * and trims whitespace
// //     };
  
// //     // Check if result is an object with tasks_output
// //     if (typeof result === 'object' && result.tasks_output) {
// //       result.tasks_output.forEach((taskOutput) => {
// //         // Avoid adding duplicates by checking the raw content
// //         if (!seenRawOutputs.has(taskOutput.raw)) {
// //           seenRawOutputs.add(taskOutput.raw);
// //           uniqueTaskOutputs.push(cleanFormatting(taskOutput.raw));
// //         }
// //       });
  
// //       // Render only the first unique output
// //       if (uniqueTaskOutputs.length > 0) {
// //         return uniqueTaskOutputs.slice(0, 1).map((output, index) => (
// //           <div key={index} className="task-output">
// //             <p>{output}</p>
// //           </div>
// //         ));
// //       }
// //     }
  
// //     // Fallback if result is a string
// //     if (typeof result === 'string') {
// //       return <p>{cleanFormatting(result)}</p>;
// //     }
  
// //     return <p>No valid result found.</p>;
// //   };
// //   return (
// //     <div className="container">
// //       {/* Sidebar */}
// //       <div className="sidebar">
// //         <h2 className="section-title">
// //           <img src="images.png" alt="Logo" className="sidebar-logo" />
// //           HRM Dashboard
// //         </h2>
// //         <ul className="agent-list">
// //           <li>
// //             <button 
// //               onClick={() => handleAgentClick('Hiring_manager')} 
// //               className={activeAgent === 'Hiring_manager' ? "active" : ""}
// //             >
// //               Hiring Manager
// //             </button>
// //           </li>
// //           <li>
// //             <button 
// //               onClick={() => handleAgentClick('Job_analyst')} 
// //               className={activeAgent === 'Job_analyst' ? "active" : ""}
// //             >
// //               Job Analyst
// //             </button>
// //           </li>
// //         </ul>
// //       </div>

// //       {/* Main Content */}
// //       <div className="main-content">
// //         <img src="image.png" alt="Logo" className="sidebars-logo" />
// //         <div className="header">
// //           <h1 className="main-title">Human Resource Management</h1>
// //           <button onClick={handleLogout} className="logout-button">
// //             <LogOut size={24} />
// //             Logout
// //           </button>
// //         </div>

// //         {/* HRM Content */}
// //         <div className="hrm-content">
// //           <h2 className="hr-recruitment-title">HR Recruitment</h2>
// //           {showForm && (
// //             <form onSubmit={handleSubmit}>
// //               {activeAgent === 'Hiring_manager' ? (
// //                 // Hiring Manager form fields
// //                 Object.entries(formData).slice(0, 9).map(([key, value]) => (
// //                   <div className="form-field" key={key}>
// //                     <label htmlFor={key}>{key.replace(/_/g, ' ')}:</label>
// //                     {key === 'Job_Description' ? (
// //                       <textarea
// //                         id={key}
// //                         name={key}
// //                         value={value}
// //                         onChange={handleInputChange}
// //                         placeholder={`Enter ${key.replace(/_/g, ' ')}`}
// //                         required
// //                       />
// //                     ) : (
// //                       <input
// //                         type={key === 'Number_of_Openings' ? 'number' : 'text'}
// //                         id={key}
// //                         name={key}
// //                         value={value}
// //                         onChange={handleInputChange}
// //                         placeholder={`Enter ${key.replace(/_/g, ' ')}`}
// //                         required
// //                       />
// //                     )}
// //                   </div>
// //                 ))
// //               ) : (
// //                 // Job Analyst form fields
// //                 <>
// //                   <div className="form-field">
// //                     <label htmlFor="input_file">Input File:</label>
// //                     <input
// //                       type="file"
// //                       id="input_file"
// //                       onChange={handleFileChange}
// //                       required
// //                     />
// //                     {formData.fileName && (
// //                       <p className="file-name">Selected file: {formData.fileName}</p>
// //                     )}
// //                   </div>
// //                   <div className="form-field">
// //                     <label htmlFor="email">LinkedIn Email:</label>
// //                     <input
// //                       type="email"
// //                       id="email"
// //                       name="email"
// //                       value={formData.email}
// //                       onChange={handleInputChange}
// //                       placeholder="Enter LinkedIn email"
// //                       required
// //                     />
// //                   </div>
// //                   <div className="form-field">
// //                     <label htmlFor="password">LinkedIn Password:</label>
// //                     <input
// //                       type="password"
// //                       id="password"
// //                       name="password"
// //                       value={formData.password}
// //                       onChange={handleInputChange}
// //                       placeholder="Enter LinkedIn password"
// //                       required
// //                     />
// //                   </div>
// //                 </>
// //               )}
// //               <button type="submit" className="submit-button">
// //                 <Upload size={20} />
// //                 {isEditing ? 'Update' : 'Submit'}
// //               </button>
// //             </form>
// //           )}

// //           {/* Result Display */}
// //           {result && (
// //             <div className="result-card">
// //               <h2 className="result-title">
// //                 {activeAgent === 'Hiring_manager' ? 'Hiring Manager Task:' : 'Job Analysis Result:'}
// //               </h2>
// //               <div className="result-content">
// //                 <div className="task-output">
// //                   <h3>{activeAgent === 'Hiring_manager' ? 'Hiring Manager Output:' : 'Job Analyst Output:'}</h3>
// //                   <div className="task-description">
// //                     {formatResult(result.result)}
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="button-group">
// //                 <button className="action-button" onClick={handleDownload}>
// //                   <Download size={20} />
// //                   Download PDF
// //                 </button>
// //                 <button className="action-button" onClick={handleEdit}>
// //                   <Edit size={20} />
// //                   Edit
// //                 </button>
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default HRMPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {  Upload, Download, Edit } from 'lucide-react';
import { jsPDF } from "jspdf";
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import config from './config'; 
const HRMPage = () => {
  const navigate = useNavigate();
  const [activeAgent, setActiveAgent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    Position: '',
    Number_of_Openings: 0,
    Experience_Level: '',
    Branch: '',
    Location: '',
    Primary_Skills: '',
    Desired_Skills: '',
    Certifications: '',
    Job_Description: '',
    input_file: null,
    email: '',
    password: ''
  });
  const [result, setResult] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prevData => ({
        ...prevData,
        [name]: files[0]
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: name === 'Number_of_Openings' ? parseInt(value, 10) : value
      }));
    }
  };
  useEffect(() => {
    console.log("Current result state:", result);
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    let endpoint = activeAgent === 'Hiring_manager' 
      ? `${config.apiBaseUrl}/execute_crew_tasks/`
      : `${config.apiBaseUrl}/execute_additional_tasks/`;

    let params = {};

    if (activeAgent === 'Hiring_manager') {
      Object.keys(formData).forEach(key => {
        if (key !== 'input_file' && key !== 'email' && key !== 'password') {
          params[key] = formData[key];
        }
      });
    } else {
      const file = formData.input_file;
      const reader = new FileReader();
      reader.onload = async function() {
        const base64File = reader.result.split(',')[1];
        params = {
          input_file: base64File,
          email: formData.email,
          password: formData.password
        };
        await sendRequest(endpoint, params);
      };
      reader.readAsDataURL(file);
      return;
    }

    await sendRequest(endpoint, params);
  };

  const sendRequest = async (endpoint, params) => {
    try {
      const response = await axios.get(endpoint, { params });
      if (response.data) {
        setResult(response.data);
        console.log("Result set:", response.data);
        
        if (response.data.job_description_content) {
          setMarkdownContent(response.data.job_description_content);
        } else if (response.data.job_skills_content) {
          setMarkdownContent(response.data.job_skills_content);
        }
      } else {
        console.error("Received data does not contain expected result fields:", response.data);
        setResult({ error: "Received data does not contain expected result fields" });
      }

      setShowForm(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Error executing tasks:", error);
      setResult({ error: `Error: ${error.message}` });
    }
  };

  const handleDownload = () => {
    if (result && (result.job_description_content || result.job_skills_content)) {
      try {
        const doc = new jsPDF();
        const margin = 20;
        const lineHeight = 7;
        const maxWidth = 170;

        doc.setFontSize(16);
        doc.text("HRM Result", margin, margin);

        doc.setFontSize(12);
        let yPosition = margin + 10;

        const addContent = (title, content) => {
          if (content) {
            doc.setFontSize(14);
            doc.text(title, margin, yPosition);
            yPosition += lineHeight * 1.5;
            doc.setFontSize(12);

            const cleanContent = content.replace(/\*\*/g, '');
            const lines = doc.splitTextToSize(cleanContent, maxWidth);
            lines.forEach((line) => {
              if (yPosition > 280) {
                doc.addPage();
                yPosition = margin;
              }
              doc.text(line, margin, yPosition);
              yPosition += lineHeight;
            });
            yPosition += lineHeight * 2;
          }
        };

        addContent("Job Description:", result.job_description_content);
        addContent("Job Skills:", result.job_skills_content);

        doc.save("hrm_result.pdf");
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Error generating PDF. Please check the console for details.");
      }
    } else {
      console.error("No valid result available for download.");
      alert("No valid result available for download. Please submit the form first.");
    }
  };
    
    
        const handleAgentClick = (agent) => {
          setActiveAgent(agent);
          setShowForm(true);
          setResult(null);
          setIsEditing(false);
          setMarkdownContent('');
        };
    
       
      
        const handleEdit = () => {
          setIsEditing(true);
          setShowForm(true);
          if (result && result.crew_task_results) {
            const parsedResult = typeof result.crew_task_results === 'string' ? result.crew_task_results : JSON.stringify(result.crew_task_results);
            const lines = parsedResult.split('\n');
            const updatedFormData = {...formData};
            lines.forEach(line => {
              const [key, value] = line.split(':**').map(item => item.trim());
              if (key && value) {
                updatedFormData[key.replace(/ /g, '_')] = value;
              }
            });
            setFormData(updatedFormData);
          }
        };
    
        const formatResult = (result) => {
          if (!result) return <p>No result available.</p>;
        
          if (typeof result === 'object') {
            if (result.crew_task_results) {
              return (
                <>
                  <h4>Crew Task Results:</h4>
                  {result.crew_task_results.split('\n').map((line, index) => (
                    <p key={index} style={{ color: 'black' }}>{line}</p>
                  ))}
                </>
              );
            }
            if (result.additional_crew_task_results) {
              return (
                <>
                  <h4>Additional Crew Task Results:</h4>
                  {result.additional_crew_task_results.split('\n').map((line, index) => (
                    <p key={index} style={{ color: 'black' }}>{line}</p>
                  ))}
                </>
              );
            }
          }
        
          if (typeof result === 'string') {
            return result.split('\n').map((line, index) => (
              <p key={index} style={{ color: 'black' }}>{line}</p>
            ));
          }
        
        
        };


    return (
      <div className="container">
        <div className="sidebar">
          <h2 className="section-title">
            <img src="images.png" alt="Logo" className="sidebar-logo" />
            HRM Dashboard
          </h2>
          <ul className="agent-list">
            <li>
              <button 
                onClick={() => handleAgentClick('Hiring_manager')} 
                className={activeAgent === 'Hiring_manager' ? "active" : ""}
              >
                Hiring Manager
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleAgentClick('Job_analyst')} 
                className={activeAgent === 'Job_analyst' ? "active" : ""}
              >
                Job Analyst
              </button>
            </li>
          </ul>
        </div>

        <div className="main-content">
          <img src="image.png" alt="Logo" className="sidebars-logo" />
          <div className="header">
            <h1 className="main-title">Human Resource Management</h1>
           
          </div>

          <div className="hrm-content">
        <h2 className="hr-recruitment-title"  style={{ color: 'black' }}>HR Recruitment</h2>
        {showForm && (
          <form onSubmit={handleSubmit}>
            {activeAgent === 'Hiring_manager' ? (
              <>
                <div className="form-field">
                  <label htmlFor="Position">Position:</label>
                  <input
                    type="text"
                    id="Position"
                    name="Position"
                    value={formData.Position}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="Number_of_Openings">Number of Openings:</label>
                  <input
                    type="number"
                    id="Number_of_Openings"
                    name="Number_of_Openings"
                    value={formData.Number_of_Openings}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="Experience_Level">Experience Level:</label>
                  <input
                    type="text"
                    id="Experience_Level"
                    name="Experience_Level"
                    value={formData.Experience_Level}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="Branch">company:</label>
                  <input
                    type="text"
                    id="Branch"
                    name="Branch"
                    value={formData.Branch}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="Location">Location:</label>
                  <input
                    type="text"
                    id="Location"
                    name="Location"
                    value={formData.Location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="Primary_Skills">Primary Skills:</label>
                  <input
                    type="text"
                    id="Primary_Skills"
                    name="Primary_Skills"
                    value={formData.Primary_Skills}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="Desired_Skills">Desired Skills:</label>
                  <input
                    type="text"
                    id="Desired_Skills"
                    name="Desired_Skills"
                    value={formData.Desired_Skills}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="Certifications">Certifications:</label>
                  <input
                    type="text"
                    id="Certifications"
                    name="Certifications"
                    value={formData.Certifications}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="Job_Description">Job Description:</label>
                  <textarea
                    id="Job_Description"
                    name="Job_Description"
                    value={formData.Job_Description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-field">
                      <label htmlFor="input_file">Upload PDF File:</label>
                      <input
                        type="file"
                        id="input_file"
                        name="input_file"
                        accept=".pdf"
                        onChange={handleInputChange}
                        required
                        style={{ color: 'black' }}
                      />
                    </div>
                <div className="form-field">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}
            <button type="submit" className="submit-button">
                <Upload size={20} />
                Submit
              </button>
            </form>
        )}
        {result && (
          <div className="result-section">
            <h3 style={{ color: 'black' }}>Result</h3>
            {formatResult(result)}
            {markdownContent && (
              <div className="markdown-content" style={{ color: 'black' }}>
                <ReactMarkdown>{markdownContent}</ReactMarkdown>
              </div>
            )}
            <button onClick={handleDownload} className="download-button">
              <Download size={24} />
              Download PDF
            </button>
            <button onClick={handleEdit} className="edit-button">
              <Edit size={24} />
              Edit
            </button>
          </div>
        )}
          </div>
          
        </div>
      </div>
    );
  };

  export default HRMPage;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { LogOut, Upload, Download, Edit, Search } from 'lucide-react';
// import { jsPDF } from "jspdf";
// import ReactMarkdown from 'react-markdown';
// import axios from 'axios';

// const HRMPage = () => {
//   const navigate = useNavigate();
//   const [activeAgent, setActiveAgent] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [formData, setFormData] = useState({
//     Position: '',
//     Number_of_Openings: 0,
//     Experience_Level: '',
//     Branch: '',
//     Location: '',
//     Primary_Skills: '',
//     Desired_Skills: '',
//     Certifications: '',
//     Job_Description: '',
//     input_file: null,
//     email: '',
//     password: '',
//     md_file_path: ''
//   });
//   const [result, setResult] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [markdownContent, setMarkdownContent] = useState('');
//   const [scrapedProfiles, setScrapedProfiles] = useState([]);

//   const handleInputChange = (e) => {
//     const { name, value, type, files } = e.target;
//     if (type === 'file') {
//       setFormData(prevData => ({
//         ...prevData,
//         [name]: files[0]
//       }));
//     } else {
//       setFormData(prevData => ({
//         ...prevData,
//         [name]: name === 'Number_of_Openings' ? parseInt(value, 10) : value
//       }));
//     }
//   };

//   useEffect(() => {
//     console.log("Current result state:", result);
//   }, [result]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setResult(null);

//     let endpoint;
//     let params = {};

//     switch (activeAgent) {
//       case 'Hiring_manager':
//         endpoint = 'http://localhost:8080/execute_crew_tasks/';
//         Object.keys(formData).forEach(key => {
//           if (key !== 'input_file' && key !== 'email' && key !== 'password' && key !== 'md_file_path') {
//             params[key] = formData[key];
//           }
//         });
//         break;
//       case 'Job_analyst':
//         endpoint = 'http://localhost:8080/execute_additional_tasks/';
//         const file = formData.input_file;
//         const reader = new FileReader();
//         reader.onload = async function() {
//           const base64File = reader.result.split(',')[1];
//           params = {
//             input_file: base64File,
//             email: formData.email,
//             password: formData.password
//           };
//           await sendRequest(endpoint, params);
//         };
//         reader.readAsDataURL(file);
//         return;
//       case 'scraper_agent':
//         endpoint = 'http://127.0.0.1:8080/scrape';
//         params = { md_file_path: formData.md_file_path };
//         break;
//       default:
//         console.error("Unknown agent");
//         return;
//     }

//     await sendRequest(endpoint, params);
//   };

//   const sendRequest = async (endpoint, params) => {
//     try {
//       const response = await axios.get(endpoint, { params });
//       if (response.data) {
//         setResult(response.data);
//         console.log("Result set:", response.data);
        
//         if (response.data.job_description_content) {
//           setMarkdownContent(response.data.job_description_content);
//         } else if (response.data.job_skills_content) {
//           setMarkdownContent(response.data.job_skills_content);
//         }

//         if (activeAgent === 'scraper_agent' && response.data.profiles) {
//           setScrapedProfiles(response.data.profiles);
//         }
//       } else {
//         console.error("Received data does not contain expected result fields:", response.data);
//         setResult({ error: "Received data does not contain expected result fields" });
//       }

//       setShowForm(false);
//       setIsEditing(false);
//     } catch (error) {
//       console.error("Error executing tasks:", error);
//       setResult({ error: `Error: ${error.message}` });
//     }
//   };

//   const handleDownload = () => {
//     if (result && (result.job_description_content || result.job_skills_content)) {
//       try {
//         const doc = new jsPDF();
//         const margin = 20;
//         const lineHeight = 7;
//         const maxWidth = 170;

//         doc.setFontSize(16);
//         doc.text("HRM Result", margin, margin);

//         doc.setFontSize(12);
//         let yPosition = margin + 10;

//         const addContent = (title, content) => {
//           if (content) {
//             doc.setFontSize(14);
//             doc.text(title, margin, yPosition);
//             yPosition += lineHeight * 1.5;
//             doc.setFontSize(12);

//             const cleanContent = content.replace(/\*\*/g, '');
//             const lines = doc.splitTextToSize(cleanContent, maxWidth);
//             lines.forEach((line) => {
//               if (yPosition > 280) {
//                 doc.addPage();
//                 yPosition = margin;
//               }
//               doc.text(line, margin, yPosition);
//               yPosition += lineHeight;
//             });
//             yPosition += lineHeight * 2;
//           }
//         };

//         addContent("Job Description:", result.job_description_content);
//         addContent("Job Skills:", result.job_skills_content);

//         doc.save("hrm_result.pdf");
//       } catch (error) {
//         console.error("Error generating PDF:", error);
//         alert("Error generating PDF. Please check the console for details.");
//       }
//     } else {
//       console.error("No valid result available for download.");
//       alert("No valid result available for download. Please submit the form first.");
//     }
//   };

//   const handleLogout = () => {
//     navigate('/login');
//   };

//   const handleAgentClick = (agent) => {
//     setActiveAgent(agent);
//     setShowForm(true);
//     setResult(null);
//     setIsEditing(false);
//     setMarkdownContent('');
//     setScrapedProfiles([]);
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//     setShowForm(true);
//     if (result && result.crew_task_results) {
//       const parsedResult = typeof result.crew_task_results === 'string' ? result.crew_task_results : JSON.stringify(result.crew_task_results);
//       const lines = parsedResult.split('\n');
//       const updatedFormData = {...formData};
//       lines.forEach(line => {
//         const [key, value] = line.split(':**').map(item => item.trim());
//         if (key && value) {
//           updatedFormData[key.replace(/ /g, '_')] = value;
//         }
//       });
//       setFormData(updatedFormData);
//     }
//   };

//   const formatResult = (result) => {
//     if (!result) return <p>No result available.</p>;
  
//     if (typeof result === 'object') {
//       if (result.crew_task_results) {
//         return (
//           <>
//             <h4>Crew Task Results:</h4>
//             {result.crew_task_results.split('\n').map((line, index) => (
//               <p key={index} style={{ color: 'black' }}>{line}</p>
//             ))}
//           </>
//         );
//       }
//       if (result.additional_crew_task_results) {
//         return (
//           <>
//             <h4>Additional Crew Task Results:</h4>
//             {result.additional_crew_task_results.split('\n').map((line, index) => (
//               <p key={index} style={{ color: 'black' }}>{line}</p>
//             ))}
//           </>
//         );
//       }
//     }
  
//     if (typeof result === 'string') {
//       return result.split('\n').map((line, index) => (
//         <p key={index} style={{ color: 'black' }}>{line}</p>
//       ));
//     }
//   };

//   const handleSearch = async () => {
//     try {
//       const response = await axios.get('http://localhost:8080/search_candidates', {
//         params: { primary_skill: searchQuery }
//       });
//       setSearchResults(response.data);
//     } catch (error) {
//       console.error("Error searching candidates:", error);
//       setSearchResults([]);
//     }
//   };

//   const CandidateSearchResults = () => (
//     <div className="candidate-search-results">
//       <div className="search-bar">
//         <input
//           type="text"
//           placeholder="Search candidates"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//         <button onClick={handleSearch}>
//           <Search size={20} />
//         </button>
//       </div>
//       <table className="candidates-table">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Title</th>
//             <th>Location</th>
//             <th>Company Name</th>
//             <th>Zip Code</th>
//           </tr>
//         </thead>
//         <tbody>
//           {searchResults.map((candidate, index) => (
//             <tr key={index}>
//               <td>{candidate.Name}</td>
//               <td>{candidate.Title}</td>
//               <td>{candidate.Location}</td>
//               <td>{candidate.CompanyName}</td>
//               <td>{candidate.ZipCode}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );

//   return (
//     <div className="container">
//       <div className="sidebar">
//         <h2 className="section-title">
//           <img src="images.png" alt="Logo" className="sidebar-logo" />
//           HRM Dashboard
//         </h2>
//         <ul className="agent-list">
//           <li>
//             <button 
//               onClick={() => handleAgentClick('Hiring_manager')} 
//               className={activeAgent === 'Hiring_manager' ? "active" : ""}
//             >
//               Hiring Manager
//             </button>
//           </li>
//           <li>
//             <button 
//               onClick={() => handleAgentClick('Job_analyst')} 
//               className={activeAgent === 'Job_analyst' ? "active" : ""}
//             >
//               Job Analyst
//             </button>
//           </li>
//           <li>
//             <button 
//               onClick={() => handleAgentClick('scraper_agent')} 
//               className={activeAgent === 'scraper_agent' ? "active" : ""}
//             >
//               Scraper Agent
//             </button>
//           </li>
//         </ul>
//       </div>

//       <div className="main-content">
//         <img src="image.png" alt="Logo" className="sidebars-logo" />
//         <div className="header">
//           <h1 className="main-title">Human Resource Management</h1>
//           <button onClick={handleLogout} className="logout-button">
//             <LogOut size={24} />
//             Logout
//           </button>
//         </div>

//         <div className="hrm-content">
//           <h2 className="hr-recruitment-title" style={{ color: 'black' }}>HR Recruitment</h2>
//           {showForm && (
//             <form onSubmit={handleSubmit}>
//               {activeAgent === 'Hiring_manager' && (
//                 <>
//                   <div className="form-field">
//                     <label htmlFor="Position">Position:</label>
//                     <input
//                       type="text"
//                       id="Position"
//                       name="Position"
//                       value={formData.Position}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-field">
//                     <label htmlFor="Number_of_Openings">Number of Openings:</label>
//                     <input
//                       type="number"
//                       id="Number_of_Openings"
//                       name="Number_of_Openings"
//                       value={formData.Number_of_Openings}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-field">
//                     <label htmlFor="Experience_Level">Experience Level:</label>
//                     <input
//                       type="text"
//                       id="Experience_Level"
//                       name="Experience_Level"
//                       value={formData.Experience_Level}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-field">
//                     <label htmlFor="Branch">Company:</label>
//                     <input
//                       type="text"
//                       id="Branch"
//                       name="Branch"
//                       value={formData.Branch}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-field">
//                     <label htmlFor="Location">Location:</label>
//                     <input
//                       type="text"
//                       id="Location"
//                       name="Location"
//                       value={formData.Location}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-field">
//                     <label htmlFor="Primary_Skills">Primary Skills:</label>
//                     <input
//                       type="text"
//                       id="Primary_Skills"
//                       name="Primary_Skills"
//                       value={formData.Primary_Skills}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-field">
//                     <label htmlFor="Desired_Skills">Desired Skills:</label>
//                     <input
//                       type="text"
//                       id="Desired_Skills"
//                       name="Desired_Skills"
//                       value={formData.Desired_Skills}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-field">
//                     <label htmlFor="Certifications">Certifications:</label>
//                     <input
//                       type="text"
//                       id="Certifications"
//                       name="Certifications"
//                       value={formData.Certifications}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-field">
//                     <label htmlFor="Job_Description">Job Description:</label>
//                     <textarea
//                       id="Job_Description"
//                       name="Job_Description"
//                       value={formData.Job_Description}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                 </>
//               )}
//               {activeAgent === 'Job_analyst' && (
//                 <>
//                   <div className="form-field">
//                     <label htmlFor="input_file">Upload PDF File:</label>
//                     <input
//                       type="file"
//                       id="input_file"
//                       name="input_file"
//                       accept=".pdf"
//                       onChange={handleInputChange}
//                       required
//                       style={{ color: 'black' }}
//                     />
//                   </div>
//                   <div className="form-field">
//                     <label htmlFor="email">Email:</label>
//                     <input
//                       type="email"
//                       id="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="form-field">
//                     <label htmlFor="password">Password:</label>
//                     <input
//                       type="password"
//                       id="password"
//                       name="password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                 </>
//               )}
//               {activeAgent === 'scraper_agent' && (
//                 <div className="form-field">
//                   <label htmlFor="md_file_path">MD File Path:</label>
//                   <input
//                     type="text"
//                     id="md_file_path"
//                     name="md_file_path"
//                     value={formData.md_file_path}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//               )}
//               <button type="submit" className="submit-button">
//                 <Upload size={20} />
//                 Submit
//               </button>
//             </form>
//           )}
//           {result && (
//             <div className="result-section">
//               <h3 style={{ color: 'black' }}>Result</h3>
//               {formatResult(result)}
//               {markdownContent && (
//                 <div className="markdown-content" style={{ color: 'black' }}>
//                   <ReactMarkdown>{markdownContent}</ReactMarkdown>
//                 </div>
//               )}
//               {activeAgent === 'scraper_agent' && <CandidateSearchResults />}
//               <button onClick={handleDownload} className="download-button">
//                 <Download size={24} />
//                 Download PDF
//               </button>
//               <button onClick={handleEdit} className="edit-button">
//                 <Edit size={24} />
//                 Edit
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HRMPage;