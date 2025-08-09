from flask import Blueprint, request, jsonify
from marshmallow import Schema, fields, ValidationError
import time
from app.services.explanation_service import ExplanationService
from app.services.image_service import ImageService
from app.models import Topic, ExplanationLog, db

api = Blueprint('api', __name__, url_prefix='/api')

# Validation schemas
class ExplanationRequestSchema(Schema):
    topic = fields.Str(required=True, validate=lambda x: len(x.strip()) > 0)
    depth = fields.Str(required=True, validate=lambda x: x in ['beginner', 'intermediate', 'advanced'])
    analogy = fields.Str(required=True, validate=lambda x: x in ['simple', 'moderate', 'complex', 'none'])

explanation_schema = ExplanationRequestSchema()
explanation_service = ExplanationService()
image_service = ImageService()

@api.route('/explain', methods=['POST'])
def generate_explanation():
    """Generate explanation for a topic"""
    try:
        # Validate request data
        data = explanation_schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    
    topic = data['topic']
    depth = data['depth']
    analogy = data['analogy']
    
    start_time = time.time()
    
    try:
        # Generate explanation
        explanation = explanation_service.generate_explanation(topic, depth, analogy)
        
        # Get relevant diagrams
        diagrams = image_service.get_diagrams_for_topic(topic)
        
        response_time = time.time() - start_time
        
        # Log the request
        log_entry = ExplanationLog(
            topic=topic,
            depth_level=depth,
            analogy_level=analogy,
            response_time=response_time
        )
        db.session.add(log_entry)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'explanation': explanation,
                'diagrams': diagrams,
                'metadata': {
                    'topic': topic,
                    'depth': depth,
                    'analogy': analogy,
                    'response_time': round(response_time, 2),
                    'diagram_sources': [d['source'] for d in diagrams]
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to generate explanation: {str(e)}'
        }), 500

@api.route('/topics/search', methods=['GET'])
def search_topics():
    """Search for topics with autocomplete"""
    query = request.args.get('q', '').strip()
    limit = min(int(request.args.get('limit', 10)), 50)
    
    if not query:
        return jsonify({'suggestions': []})
    
    # Search topics by name
    topics = Topic.query.filter(
        Topic.name.ilike(f'%{query}%')
    ).limit(limit).all()
    
    suggestions = [topic.to_dict() for topic in topics]
    
    return jsonify({'suggestions': suggestions})

@api.route('/topics', methods=['POST'])
def add_topic():
    """Add a new topic to the database"""
    data = request.json
    
    required_fields = ['name', 'category']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if topic already exists
    existing_topic = Topic.query.filter_by(name=data['name']).first()
    if existing_topic:
        return jsonify({'error': 'Topic already exists'}), 409
    
    topic = Topic(
        name=data['name'],
        category=data['category'],
        keywords=data.get('keywords', '[]'),
        curriculum_standard=data.get('curriculum_standard')
    )
    
    try:
        db.session.add(topic)
        db.session.commit()
        return jsonify({'success': True, 'topic': topic.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create topic: {str(e)}'}), 500

@api.route('/image-sources/status', methods=['GET'])
def get_image_sources_status():
    """Get status of available image sources"""
    try:
        sources = image_service.get_available_sources()
        return jsonify({
            'success': True,
            'sources': sources,
            'primary_source': 'shutterstock' if sources['shutterstock'] else 'unsplash' if sources['unsplash'] else 'wikimedia'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get source status: {str(e)}'
        }), 500

@api.route('/model/info', methods=['GET'])
def get_model_info():
    """Get information about the current LLM model"""
    try:
        model_info = explanation_service.get_model_info()
        return jsonify({
            'success': True,
            'model_info': model_info
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get model info: {str(e)}'
        }), 500

@api.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        sources = image_service.get_available_sources()
        available_sources = [k for k, v in sources.items() if v]
        
        return jsonify({
            'status': 'healthy',
            'timestamp': time.time(),
            'services': {
                'database': 'connected',
                'explanation_service': 'ready',
                'image_service': 'ready',
                'available_image_sources': available_sources
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'degraded',
            'error': str(e)
        }), 500

@api.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@api.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500
