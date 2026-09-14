import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=GEMINI_API_KEY)

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSION = 768


def generate_embedding(text: str) -> list[float]:
    """Generate a 768-dimensional embedding vector."""

    if not text or not text.strip():
        raise ValueError("Cannot generate embedding for empty text")

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config={
            "output_dimensionality": EMBEDDING_DIMENSION,
        },
    )
    

    if not response.embeddings:
        raise RuntimeError("Gemini returned no embeddings")

    embedding = response.embeddings[0].values

    if len(embedding) != EMBEDDING_DIMENSION:
        raise RuntimeError(
            f"Expected {EMBEDDING_DIMENSION} dimensions, "
            f"got {len(embedding)}"
        )

    return embedding


def generate_embeddings(
    texts: list[str],
) -> list[list[float]]:
    """Generate embeddings for multiple pieces of text."""

    if not texts:
        return []

    return [generate_embedding(text) for text in texts]
