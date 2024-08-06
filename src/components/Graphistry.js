import React, { useState } from 'react';
import axios from 'axios';
import { Client, Dataset, File, EdgeFile, NodeFile } from '@graphistry/client-api';
import '@graphistry/client-api-react/assets/index.less';
import {GRAPHISTRY_API_KEY, GRAPHISTRY_USER, GRAPHISTRY_PW} from '../config';


const GraphistryComponent = () => {
  const [file, setFile] = useState(null);
  const [graphUrl, setGraphUrl] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  function jsonToCSV(json) {
    const fields = Object.keys(json[0]);
    const csvRows = json.map(row => fields.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csvRows.unshift(fields.join(','));
    return csvRows.join('\r\n');
  }

  function replacer(key, value) {
    return value === null ? '' : value;
  }

  const con2csv = (filename, jsonData)=> {
    const csv = jsonToCSV(jsonData);

    // Create a Blob from the CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // Create a link to download the file
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename +'.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log('CSV file has been created');
  }

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);

    // Assuming you have an endpoint in your Flask app to handle file uploads
    const response = await axios.post('http://localhost:5000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    const { nodes, edges } = JSON.parse(response.data.replace(/\bNaN\b/g, 0));

    // Initialize Graphistry
    const client = new Client(
     GRAPHISTRY_USER,
     GRAPHISTRY_PW
    );

    const nodeFile = new NodeFile({ rows: nodes });
    const edgeFile = new EdgeFile({ rows: edges });

    con2csv('nodefile', nodeFile.data.rows);
    con2csv('eddgefile', edgeFile.data.rows);

    const dataset = new Dataset({
      node_encodings: { bindings: {} },
      edge_encodings: { bindings: {} },
      metadata: {},
      name: 'skaleData'
    });
    dataset.addFile(nodeFile);
    dataset.addFile(edgeFile);
    dataset.upload(client).then(
       () => { 
        console.log(`Dataset ${dataset.datasetID} uploaded to ${dataset.datasetURL}`)
        setGraphUrl(dataset.datasetURL);
      }
   ).catch(err => {
    console.error('Error uploading dataset:', err);
    if (err.response) {
      // The request was made, and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', err.response.data);
      console.error('Response status:', err.response.status);
      console.error('Response headers:', err.response.headers);
    } else if (err.request) {
      // The request was made, but no response was received
      console.error('Request data:', err.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', err.message);
    }
    alert(`Error uploading dataset: ${err.message}`);
  });

    console.log('created dataset');

  };
 

  return (
    <div>
      <h2>Graphistry Visualization</h2>
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
