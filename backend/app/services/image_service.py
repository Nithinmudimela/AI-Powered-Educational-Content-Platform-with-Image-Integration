import requests
import json
import base64
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from config import Config
from app.models import CachedDiagram, Topic, db

class ImageService:
    def __init__(self):
        self.shutterstock_consumer_key = Config.SHUTTERSTOCK_CONSUMER_KEY
        self.shutterstock_consumer_secret = Config.SHUTTERSTOCK_CONSUMER_SECRET
        self.unsplash_access_key = Config.UNSPLASH_ACCESS_KEY
        self.pixabay_api_key = Config.PIXABAY_API_KEY
        self.access_token = None
        self.token_expires_at = None
        
    def get_diagrams_for_topic(self, topic_name: str) -> List[Dict[str, Any]]:
        """Get relevant diagrams for a topic"""
        
        # First check cache
        cached_diagrams = self._get_cached_diagrams(topic_name)
        if cached_diagrams:
            return cached_diagrams
        
        # If not cached, fetch from APIs
        diagrams = []
        
        # Try Shutterstock first (highest quality for educational content)
        try:
            shutterstock_diagrams = self._search_shutterstock(topic_name)
            diagrams.extend(shutterstock_diagrams)
        except Exception as e:
            print(f"Shutterstock API failed: {e}")
        
        # Fallback to Unsplash if Shutterstock fails or has no results
        if not diagrams and self.unsplash_access_key:
            try:
                unsplash_diagrams = self._search_unsplash(topic_name)
                diagrams.extend(unsplash_diagrams)
            except Exception as e:
                print(f"Unsplash API failed: {e}")
        
        # Fallback to Pixabay if previous sources fail
        if not diagrams and self.pixabay_api_key:
            try:
                pixabay_diagrams = self._search_pixabay(topic_name)
                diagrams.extend(pixabay_diagrams)
            except Exception as e:
                print(f"Pixabay API failed: {e}")
        
        # Final fallback to Wikimedia Commons (always free)
        if not diagrams:
            try:
                wikimedia_diagrams = self._search_wikimedia(topic_name)
                diagrams.extend(wikimedia_diagrams)
            except Exception as e:
                print(f"Wikimedia API failed: {e}")
        
        # Cache the results
        if diagrams:
            self._cache_diagrams(topic_name, diagrams)
        
        return diagrams[:3]  # Return top 3 most relevant
    
    def _get_cached_diagrams(self, topic_name: str) -> List[Dict[str, Any]]:
        """Get cached diagrams that haven't expired"""
        
        topic = Topic.query.filter_by(name=topic_name).first()
        if not topic:
            return []
        
        now = datetime.utcnow()
        cached = CachedDiagram.query.filter(
            CachedDiagram.topic_id == topic.id,
            CachedDiagram.expires_at > now
        ).all()
        
        return [diagram.to_dict() for diagram in cached]
    
    def _get_shutterstock_access_token(self) -> str:
        """Get or refresh Shutterstock access token"""
        
        # Check if current token is still valid
        if (self.access_token and self.token_expires_at and 
            datetime.utcnow() < self.token_expires_at):
            return self.access_token
        
        # Create basic auth header with consumer key and secret
        credentials = f"{self.shutterstock_consumer_key}:{self.shutterstock_consumer_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            'Authorization': f'Basic {encoded_credentials}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'grant_type': 'client_credentials'
        }
        
        try:
            response = requests.post(
                f'{Config.SHUTTERSTOCK_BASE_URL}/oauth/access_token',
                headers=headers,
                data=data,
                timeout=10
            )
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data['access_token']
            
            # Set expiration time (usually 1 hour, subtract 5 minutes for safety)
            expires_in = token_data.get('expires_in', 3600)
            self.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in - 300)
            
            return self.access_token
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to get Shutterstock access token: {str(e)}")
    
    def _search_shutterstock(self, topic: str) -> List[Dict[str, Any]]:
        """Search Shutterstock for educational diagrams"""
        
        # Get access token
        access_token = self._get_shutterstock_access_token()
        
        # Create educational search terms
        search_terms = self._generate_search_terms(topic)
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        diagrams = []
        
        for search_term in search_terms[:2]:  # Try top 2 search terms
            params = {
                'query': f'{search_term} diagram illustration educational',
                'image_type': 'illustration',
                'category': 'education',
                'per_page': 3,
                'sort': 'relevance'
            }
            
            try:
                response = requests.get(
                    f'{Config.SHUTTERSTOCK_BASE_URL}/images/search',
                    headers=headers,
                    params=params,
                    timeout=10
                )
                response.raise_for_status()
                
                data = response.json()
                
                for item in data.get('data', []):
                    diagram = {
                        'source': 'shutterstock',
                        'image_url': item['assets']['preview']['url'],
                        'thumbnail_url': item['assets']['small_thumb']['url'],
                        'caption': f"Educational diagram: {item.get('description', topic)}",
                        'alt_text': item.get('alt', f'{topic} educational diagram'),
                        'metadata': {
                            'id': item['id'],
                            'keywords': item.get('keywords', []),
                            'contributor': item.get('contributor', {}).get('contributor', '')
                        }
                    }
                    diagrams.append(diagram)
                
            except requests.exceptions.RequestException as e:
                print(f"Shutterstock search failed for '{search_term}': {e}")
                continue
        
        return diagrams
    
    def _search_unsplash(self, topic: str) -> List[Dict[str, Any]]:
        """Search Unsplash for educational images"""
        
        headers = {
            'Authorization': f'Client-ID {self.unsplash_access_key}'
        }
        
        search_terms = self._generate_search_terms(topic)
        diagrams = []
        
        for search_term in search_terms[:2]:
            params = {
                'query': f'{search_term} diagram education illustration science',
                'per_page': 3,
                'orientation': 'landscape'
            }
            
            try:
                response = requests.get(
                    f'{Config.UNSPLASH_BASE_URL}/search/photos',
                    headers=headers,
                    params=params,
                    timeout=10
                )
                response.raise_for_status()
                
                data = response.json()
                
                for item in data.get('results', []):
                    diagram = {
                        'source': 'unsplash',
                        'image_url': item['urls']['regular'],
                        'thumbnail_url': item['urls']['thumb'],
                        'caption': f"Educational illustration: {item.get('alt_description', topic)}",
                        'alt_text': item.get('alt_description', f'{topic} educational illustration'),
                        'metadata': {
                            'id': item['id'],
                            'photographer': item['user']['name'],
                            'license': 'Unsplash License'
                        }
                    }
                    diagrams.append(diagram)
                
            except requests.exceptions.RequestException as e:
                print(f"Unsplash search failed for '{search_term}': {e}")
                continue
        
        return diagrams
    
    def _search_pixabay(self, topic: str) -> List[Dict[str, Any]]:
        """Search Pixabay for educational images"""
        
        search_terms = self._generate_search_terms(topic)
        diagrams = []
        
        for search_term in search_terms[:2]:
            params = {
                'key': self.pixabay_api_key,
                'q': f'{search_term}+diagram+education',
                'image_type': 'illustration',
                'category': 'education',
                'safesearch': 'true',
                'per_page': 3
            }
            
            try:
                response = requests.get(
                    Config.PIXABAY_BASE_URL,
                    params=params,
                    timeout=10
                )
                response.raise_for_status()
                
                data = response.json()
                
                for item in data.get('hits', []):
                    diagram = {
                        'source': 'pixabay',
                        'image_url': item['largeImageURL'],
                        'thumbnail_url': item['previewURL'],
                        'caption': f"Educational diagram: {item.get('tags', topic)}",
                        'alt_text': f"{topic} educational diagram",
                        'metadata': {
                            'id': item['id'],
                            'tags': item.get('tags', '').split(', '),
                            'license': 'Pixabay License'
                        }
                    }
                    diagrams.append(diagram)
                
            except requests.exceptions.RequestException as e:
                print(f"Pixabay search failed for '{search_term}': {e}")
                continue
        
        return diagrams
    
    def _search_wikimedia(self, topic: str) -> List[Dict[str, Any]]:
        """Search Wikimedia Commons for educational content"""
        
        search_terms = self._generate_search_terms(topic)
        diagrams = []
        
        for search_term in search_terms[:1]:  # Wikimedia can be slow, try only 1 term
            params = {
                'action': 'query',
                'format': 'json',
                'list': 'search',
                'srsearch': f'{search_term} diagram filetype:svg OR filetype:png',
                'srnamespace': 6,  # File namespace
                'srlimit': 3
            }
            
            try:
                response = requests.get(
                    Config.WIKIMEDIA_BASE_URL,
                    params=params,
                    timeout=10
                )
                response.raise_for_status()
                
                data = response.json()
                
                for item in data.get('query', {}).get('search', []):
                    # Construct image URL from title
                    filename = item['title'].replace('File:', '')
                    image_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{filename}"
                    
                    diagram = {
                        'source': 'wikimedia',
                        'image_url': image_url,
                        'thumbnail_url': f"{image_url}?width=300",
                        'caption': f"Wikimedia educational content: {item.get('snippet', topic)}",
                        'alt_text': f"{topic} educational diagram from Wikimedia Commons",
                        'metadata': {
                            'title': item['title'],
                            'snippet': item.get('snippet', ''),
                            'license': 'Creative Commons'
                        }
                    }
                    diagrams.append(diagram)
                
            except requests.exceptions.RequestException as e:
                print(f"Wikimedia search failed for '{search_term}': {e}")
                continue
        
        return diagrams
    
    def _generate_search_terms(self, topic: str) -> List[str]:
        """Generate relevant search terms for a topic"""
        
        # Topic-specific keyword mapping
        keyword_map = {
            'photosynthesis': ['chloroplast', 'light reactions', 'calvin cycle', 'plant cell'],
            'pythagorean theorem': ['right triangle', 'hypotenuse', 'geometry'],
            'french revolution': ['bastille', 'marie antoinette', 'guillotine', 'estates'],
            'mitosis': ['cell division', 'chromosomes', 'cell cycle', 'prophase'],
            'water cycle': ['evaporation', 'precipitation', 'condensation', 'atmosphere'],
            'dna': ['double helix', 'nucleotides', 'genetic', 'molecular'],
            'solar system': ['planets', 'orbit', 'sun', 'astronomy'],
            'respiration': ['cellular respiration', 'mitochondria', 'glucose', 'atp'],
            'evolution': ['natural selection', 'darwin', 'species', 'adaptation'],
            'atomic structure': ['electrons', 'protons', 'neutrons', 'nucleus'],
            'ecosystem': ['food chain', 'biodiversity', 'habitat', 'environment']
        }
        
        topic_lower = topic.lower()
        search_terms = [topic]
        
        # Add specific keywords if available
        for key, keywords in keyword_map.items():
            if key in topic_lower:
                search_terms.extend([f'{topic} {keyword}' for keyword in keywords])
                break
        
        # Add generic educational terms
        search_terms.extend([
            f'{topic} process',
            f'{topic} structure',
            f'{topic} biological',
            f'{topic} scientific'
        ])
        
        return search_terms[:5]  # Return top 5 search terms
    
    def _cache_diagrams(self, topic_name: str, diagrams: List[Dict[str, Any]]):
        """Cache diagrams in the database"""
        
        # Get or create topic
        topic = Topic.query.filter_by(name=topic_name).first()
        if not topic:
            topic = Topic(name=topic_name, category='general')
            db.session.add(topic)
            db.session.flush()
        
        # Cache each diagram
        expires_at = datetime.utcnow() + timedelta(seconds=Config.DIAGRAM_CACHE_DURATION)
        
        for diagram_data in diagrams:
            cached_diagram = CachedDiagram(
                topic_id=topic.id,
                source=diagram_data['source'],
                image_url=diagram_data['image_url'],
                thumbnail_url=diagram_data.get('thumbnail_url'),
                caption=diagram_data.get('caption'),
                alt_text=diagram_data.get('alt_text'),
                diagram_metadata=json.dumps(diagram_data.get('metadata', {})),  # Note: using diagram_metadata
                expires_at=expires_at
            )
            db.session.add(cached_diagram)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Failed to cache diagrams: {e}")
    
    def get_available_sources(self) -> Dict[str, bool]:
        """Get status of available image sources"""
        return {
            'shutterstock': bool(self.shutterstock_consumer_key and self.shutterstock_consumer_secret),
            'unsplash': bool(self.unsplash_access_key),
            'pixabay': bool(self.pixabay_api_key),
            'wikimedia': True  # Always available, no API key required
        }
