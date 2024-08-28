from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import graphistry
import os
import math
import numbers

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # Allow CORS for frontend requests

# Set up Graphistry
API_KEY = '88V2EU7HT70K1X5V'
graphistry.register(api=3, username='skale', password='Graphistry@94087')

def convert_csv_to_nodes_edges(file_path):
    # Read the CSV file into a DataFrame
    df = pd.read_csv(file_path)
    
    # Assuming the first column is the node ID and the remaining columns are edges
    node_ids = df.iloc[:, 0]
    edges = df.iloc[:, 1:]

    # Create nodes DataFrame
    nodes = pd.DataFrame({
        'id': node_ids,
        'label': node_ids  # Assuming label is same as id, modify as needed
    })

    # Create edges DataFrame
    edges_list = []
    for i, src in enumerate(node_ids):
        for dst, weight in edges.iloc[i].items():
            if(isinstance(weight, numbers.Integral) == True):
                weight = int(weight) 
            else:
                weight = 0
            if (weight != 0):
                edges_list.append({'src': src, 'dst': dst, 'weight': weight})
    
    
    edges_df = pd.DataFrame(edges_list)

    nodes = pd.DataFrame({'id': df.index})
    nodes['label'] = nodes['id']

    # nodes_dict = nodes.to_dict(orient='records')
    # edges_dict = edges_df.to_dict(orient='records')

    nodes_dict = nodes
    edges_dict = edges_df

    return nodes_dict, edges_dict

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Save the uploaded file
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Save the file locally
        file_path = os.path.join('/tmp', file.filename)
        file.save(file_path)

        print('Got the file - ', file.filename)
        # Convert the CSV to nodes and edges
        nodes, edges = convert_csv_to_nodes_edges(file_path)

        # Create the Graphistry plot
        dataset = graphistry.bind(
            source='src',
            destination='dst',
            node='id'
        ).nodes(nodes).edges(edges)

        plot_url = dataset.plot(render=False)

        return jsonify({'dataset_url': plot_url})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
