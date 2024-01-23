import requests as req
from flask import Flask, make_response, request
from flask_cors import CORS, cross_origin
from lxml import etree


app = Flask(__name__)
CORS(app)
app.config['DEBUG'] = True
@app.route("/", methods=['GET'])
@cross_origin()
def hello():
    url = request.args.get('url','')
    response = req.get(url)
    
    # Parsa il contenuto XML
    root = etree.fromstring(response.content)
    
    # Namespace mapping
    namespaces = {
        'wb': 'http://www.worldbank.org',
    }
    
    # Trova il valore per l'attributo 'value' con l'`id` desiderato (es. 'TIME_PERIOD')
    
    id_value = []

    for x in range(23):
        id_value.append(root.xpath("//wb:value/text()", namespaces=namespaces)[x])
        
    
    # Stampa il valore ottenuto
    print("Popolazione':", id_value)

    resp = make_response(id_value)
    return resp

if __name__ == "__main__":
    app.run("localhost", 6969)



