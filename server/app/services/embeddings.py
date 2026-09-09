import os

from dotenv import load_dotenv
from google import genai

load_dotenv()


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")


client = genai.Client(
    api_key=GEMINI_API_KEY
)


EMBEDDING_MODEL = "gemini-embedding-001"


def generate_embedding(text: str) -> list[float]:
    """
    Generate an embedding vector for a piece of text.
    """

    if not text.strip():
        raise ValueError("Cannot generate embedding for empty text")

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
    )

    return response.embeddings[0].values


def generate_embeddings(
    texts: list[str],
) -> list[list[float]]:
    """
    Generate embeddings for multiple pieces of text.
    """

    if not texts:
        return []

    embeddings = []

    for text in texts:
        embedding = generate_embedding(text)
        embeddings.append(embedding)

    return embeddings
