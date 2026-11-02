# ml_service/app.py
from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

# Initializes a lightweight toxic comment classification model
classifier = pipeline("text-classification", model="unitary/toxic-bert")

@app.route('/moderate', methods=['POST'])
def moderate():
    data = request.json
    text = data.get('text', '')
    
    if not text.strip():
        return jsonify({'is_toxic': False, 'score': 0.0})
        
    # Process the text through the NLP model
    result = classifier(text)[0]
    
    # Define the threshold for abusive content
    is_toxic = result['label'] == 'toxic' and result['score'] > 0.85
    
    return jsonify({
        'is_toxic': is_toxic,
        'score': result['score'],
        'label': result['label']
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)