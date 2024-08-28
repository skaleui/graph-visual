import React, { useState } from 'react';
import axios from 'axios';
import { Client, Dataset, File, EdgeFile, NodeFile } from '@graphistry/client-api';
import '@graphistry/client-api-react/assets/index.less';



const GraphistryComponent = () => {
  const [file, setFile] = useState(null);
  const [graphUrl, setGraphUrl] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };



  async function handleUpload() {
    try {
      // Prepare the form data
      const formData = new FormData();
      formData.append('file', file);
  
      // Send the file to the Flask server
      const response = await axios.post(process.env.REACT_APP_UPLOAD_ENDPOINT, formData, {
               'Content-Type': 'multipart/form-data'
      });
  
      // Get the dataset URL from the response
      const { dataset_url } = response.data;
      console.log('Graphistry visualization URL:', dataset_url);
  
      // Return the URL for further use (e.g., embedding in an iframe)
      setGraphUrl(dataset_url);
      return dataset_url;
  
    } catch (error) {
      console.error('Error uploading CSV:', error);
      throw error;
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload and Visualize</button>
      {graphUrl && (
        <iframe
        src={graphUrl}
        width="100%"
        height="600px"
        title="Graphistry Visualization"
        />
      )}
    </div>
  );
};

export default GraphistryComponent;
