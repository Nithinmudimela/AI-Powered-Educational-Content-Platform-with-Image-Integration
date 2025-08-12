import requests
from typing import Dict, Any
from config import Config

class ExplanationService:
    def __init__(self):
        self.api_key = Config.GEMINI_API_KEY
        self.base_url = Config.GEMINI_BASE_URL.rstrip("/")
        self.model = Config.GEMINI_MODEL
        
    def generate_explanation(self, topic: str, depth: str, analogy: str) -> Dict[str, Any]:
        """Generate explanation using Gemini API."""
        prompt = self._build_prompt(topic, depth, analogy)
        
        headers = {
            'x-goog-api-key': self.api_key,
            'Content-Type': 'application/json'
        }
        
        payload = {
            'contents': [
                {
                    'parts': [
                        {'text': prompt}
                    ]
                }
            ],
            'generationConfig': {
                'temperature': Config.GEMINI_TEMPERATURE,
                'maxOutputTokens': Config.GEMINI_MAX_OUTPUT_TOKENS,
                'topP': 0.8,
                'topK': 40
            }
        }
        
        try:
            response = requests.post(
                f'{self.base_url}/models/{self.model}:generateContent',
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            result = response.json()

            explanation_text = self._extract_text_from_response(result)
            return self._parse_explanation(explanation_text)
        
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Network/API error: {e}")
        except ValueError as e:
            raise RuntimeError(f"Parsing error: {e}")

    def _extract_text_from_response(self, response: Dict[str, Any]) -> str:
        """Extract text content from Gemini API response."""
        candidates = response.get('candidates')
        if not candidates:
            raise ValueError("No candidates found in API response.")
        
        first_candidate = candidates[0]
        content = first_candidate.get('content', {})
        parts = content.get('parts', [])
        
        if not parts or 'text' not in parts[0]:
            raise ValueError("No text found in Gemini response parts.")
        
        return parts[0]['text'].strip()

    def _build_prompt(self, topic: str, depth: str, analogy: str) -> str:
        """Build prompt based on parameters."""
        depth_instructions = {
            'beginner': 'Use simple language, avoid jargon, explain concepts as if to a middle school student.',
            'intermediate': 'Use moderate technical detail, include some scientific terms with explanations.',
            'advanced': 'Use technical language, include equations and detailed scientific processes.'
        }
        analogy_instructions = {
            'simple': 'Use everyday analogies that relate to common experiences.',
            'moderate': 'Use technical but relatable analogies.',
            'complex': 'Use sophisticated analogies that demonstrate advanced understanding.',
            'none': 'Do not use analogies.'
        }
        
        return (
            f'You are an expert educational content generator. Explain the topic "{topic}" with the following requirements:\n\n'
            f'Depth Level: {depth} - {depth_instructions.get(depth, "")}\n'
            f'Analogy Level: {analogy} - {analogy_instructions.get(analogy, "")}\n\n'
            "Structure your response exactly as follows:\n\n"
            "INTRODUCTION:\n[1-2 sentences providing a brief overview]\n\n"
            "CORE CONCEPTS:\n[Key concepts explained at the specified depth level]\n\n"
            "ANALOGY:\n[Analogy section if requested, otherwise skip this section]\n\n"
            "SUMMARY:\n[3-5 bullet points of key takeaways]\n\n"
            "Keep the explanation accurate, educational, and aligned with academic standards. "
            "Ensure the content is factually correct and age-appropriate for the specified depth level."
        )

    def _parse_explanation(self, text: str) -> Dict[str, Any]:
        """Parse the structured explanation response."""
        sections = {
            'introduction': '',
            'core_concepts': '',
            'analogy': '',
            'summary': []
        }
        current_section = None
        
        for line in text.splitlines():
            line = line.strip()
            if not line:
                continue
            
            upper_line = line.upper()
            if upper_line.startswith("INTRODUCTION:"):
                current_section = 'introduction'
                sections['introduction'] = line[len("INTRODUCTION:"):].strip()
                continue
            elif upper_line.startswith("CORE CONCEPTS:"):
                current_section = 'core_concepts'
                sections['core_concepts'] = line[len("CORE CONCEPTS:"):].strip()
                continue
            elif upper_line.startswith("ANALOGY:"):
                current_section = 'analogy'
                sections['analogy'] = line[len("ANALOGY:"):].strip()
                continue
            elif upper_line.startswith("SUMMARY:"):
                current_section = 'summary'
                continue
            
            if current_section == 'summary':
                if line[0] in {'•', '-', '*'}:
                    sections['summary'].append(line[1:].strip())
                else:
                    sections['summary'].append(line)
            elif current_section:
                sections[current_section] = (sections[current_section] + '\n' + line).strip()
        
        return sections

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current Gemini model."""
        return {
            'model_name': self.model,
            'provider': 'Google Gemini',
            'max_tokens': Config.GEMINI_MAX_OUTPUT_TOKENS,
            'temperature': Config.GEMINI_TEMPERATURE
        }
