// config.js
const config = {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
    // apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://host.docker.internal:8080',
  };
  
  export default config;