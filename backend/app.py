from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
@app.before_request
def before_request():
    headers = {'Access-Control-Allow-Origin': '*',
               'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
               'Access-Control-Allow-Headers': 'Content-Type'}
    if request.method.lower() == 'options':
        return jsonify(headers), 200
CORS(app)

def convert_adj_matrix_to_edges(adj_matrix):
    edges = []
    rows, cols = adj_matrix.shape
    for i in range(rows):
        src = adj_matrix.index[i]
        for j in range(cols):
            dst = adj_matrix.columns[j]
            weight = adj_matrix.iat[i, j]
            if weight != 0:
                edges.append([src, dst, weight])
    return pd.DataFrame(edges, columns=['src', 'dst', 'weight'])

@app.route('/upload', methods=['POST'])
def upload_file():

    print("Uploading file")
    file = request.files['file']
    adj_matrix = pd.read_csv(file, header=0)

    print("file uploaded")
    
    # Convert to edges
    edges = convert_adj_matrix_to_edges(adj_matrix)
   
    # Extract nodes
    nodes = pd.DataFrame({'id': adj_matrix.index})
    nodes['label'] = nodes['id']

    # Convert DataFrames to dictionaries for JSON serialization
    nodes_dict = nodes.to_dict(orient='records')
    edges_dict = edges.to_dict(orient='records')


    return jsonify({'nodes': nodes_dict, 'edges': edges_dict})

if __name__ == '__main__':
    app.run(debug=True)
py