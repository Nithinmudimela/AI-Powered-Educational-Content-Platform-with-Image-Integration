from flask import Flask
from flask_cors import CORS
from config import Config
from app.models import db
from typing import List, Dict, Any, Optional


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
    # Register blueprints
    from app.routes import api
    app.register_blueprint(api)
    
    # Create tables
    with app.app_context():
        db.create_all()
        
        # Add some default topics
        from app.models import Topic
        default_topics = [
            Topic(name='Photosynthesis', category='Biology', keywords='["chloroplast", "light reactions", "calvin cycle"]'),
            Topic(name='Pythagorean Theorem', category='Mathematics', keywords='["right triangle", "hypotenuse", "geometry"]'),
            Topic(name='French Revolution', category='History', keywords='["bastille", "marie antoinette", "estates"]'),
            Topic(name='Mitosis', category='Biology', keywords='["cell division", "chromosomes", "cell cycle"]'),
            Topic(name='Water Cycle', category='Earth Science', keywords='["evaporation", "precipitation", "condensation"]')
        ]
        
        for topic in default_topics:
            existing = Topic.query.filter_by(name=topic.name).first()
            if not existing:
                db.session.add(topic)
        
        try:
            db.session.commit()
        except:
            db.session.rollback()
    
    return app
