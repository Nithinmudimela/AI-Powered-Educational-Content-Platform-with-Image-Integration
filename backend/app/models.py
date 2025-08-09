from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Topic(db.Model):
    __tablename__ = 'topics'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    category = db.Column(db.String(100), nullable=False)
    keywords = db.Column(db.Text)  # JSON string of related keywords
    curriculum_standard = db.Column(db.String(50))  # NGSS, Common Core, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'keywords': json.loads(self.keywords) if self.keywords else [],
            'curriculum_standard': self.curriculum_standard
        }

class CachedDiagram(db.Model):
    __tablename__ = 'cached_diagrams'
    
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    source = db.Column(db.String(50), nullable=False)  # 'shutterstock' or 'unsplash' etc.
    image_url = db.Column(db.String(500), nullable=False)
    thumbnail_url = db.Column(db.String(500))
    caption = db.Column(db.Text)
    alt_text = db.Column(db.Text)
    diagram_metadata = db.Column(db.Text)  # Changed from 'metadata' to 'diagram_metadata'
    cached_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    
    topic = db.relationship('Topic', backref='diagrams')
    
    def to_dict(self):
        return {
            'id': self.id,
            'source': self.source,
            'image_url': self.image_url,
            'thumbnail_url': self.thumbnail_url,
            'caption': self.caption,
            'alt_text': self.alt_text,
            'metadata': json.loads(self.diagram_metadata) if self.diagram_metadata else {}
        }

class ExplanationLog(db.Model):
    __tablename__ = 'explanation_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(200), nullable=False)
    depth_level = db.Column(db.String(20), nullable=False)
    analogy_level = db.Column(db.String(20), nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    response_time = db.Column(db.Float)  # in seconds
