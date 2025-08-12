from flask import Blueprint, request, jsonify
from app.services.explanation_service import ExplanationService
from app.services.image_service import ImageService
from datetime import datetime

api = Blueprint('api', __name__)

explanation_service = ExplanationService()
image_service = ImageService()

@api.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'services': {
            'database': 'connected',
            'explanation_service': 'ready',
            'image_service': 'ready'
        }
    })

@api.route('/explain', methods=['POST'])
def explain():
    data = request.json
    topic = data.get('topic')
    depth = data.get('depth', 'intermediate')
    analogy = data.get('analogy', 'moderate')
    
    if not topic:
        return jsonify({'success': False, 'error': 'Topic is required'}), 400
    
    start_time = datetime.utcnow()
    
    try:
        explanation = explanation_service.generate_explanation(topic, depth, analogy)
        diagrams = image_service.get_diagrams_for_topic(topic)
        
        response_time = (datetime.utcnow() - start_time).total_seconds()
        
        return jsonify({
            'success': True,
            'data': {
                'explanation': explanation,
                'diagrams': diagrams
            },
            'response_time': response_time
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api.route('/topics/search', methods=['GET'])
def search_topics():
    # Dummy implementation - replace with actual search logic if needed
    query = request.args.get('q', '')
    limit = int(request.args.get('limit', 5))
    suggestions = [{'name': f"{query} Topic {i}", 'category': 'general'} for i in range(limit)]
    return jsonify({'suggestions': suggestions})

@api.route('/image-sources/status', methods=['GET'])
def image_sources_status():
    sources = image_service.get_available_sources()
    return jsonify({'sources': sources})

@api.route('/model/info', methods=['GET'])
def model_info():
    return jsonify(explanation_service.get_model_info())
