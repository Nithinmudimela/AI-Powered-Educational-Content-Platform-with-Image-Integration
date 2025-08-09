def _extract_text_from_response(self, response: Dict[str, Any]) -> str:
    """Extract text content from Gemini API response with robust handling."""
    # 1) API-level error
    if isinstance(response, dict) and 'error' in response:
        msg = response['error'].get('message', 'Unknown API error')
        raise ValueError(f"API Error: {msg}")

    candidates = response.get('candidates', [])
    if not candidates:
        raise ValueError("No candidates found in response (content may have been blocked).")

    candidate = candidates[0]

    # 2) Check finish reason (safety/blocked/etc.)
    finish_reason = candidate.get('finishReason') or candidate.get('finish_reason')
    if finish_reason in ('SAFETY', 'RECITATION', 'OTHER'):
        raise ValueError(f"Content blocked by safety/finishReason={finish_reason}. Try a simpler topic or rephrase.")

    content = candidate.get('content', {})
    if not content:
        raise ValueError("No content found in candidate.")

    parts = content.get('parts', [])
    if not parts:
        raise ValueError("No parts found in response content.")

    # Prefer first text part
    for part in parts:
        if 'text' in part and part['text'].strip():
            return part['text'].strip()

    raise ValueError("Response parts exist but contain no text.")
