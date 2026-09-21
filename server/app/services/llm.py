import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai.errors import ServerError


load_dotenv()


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")


client = genai.Client(
    api_key=GEMINI_API_KEY
)


MODEL_NAME = "gemini-3.1-flash-lite"

SYSTEM_INSTRUCTION = """
You are a PDF question-answering assistant.

Answer the user's question ONLY using the provided PDF context.

Rules:
- Do not use outside knowledge.
- Do not guess.
- Do not invent information.
- Do not assume information that is not present in the context.
- The provided PDF context is the only source of truth.
- If the answer cannot be found in the provided PDF context, respond exactly:

I couldn't find that information in the uploaded document.

Give a clear and concise answer.
"""


def build_context(chunks: list) -> str:
    """
    Build the document context that will be sent to Gemini.
    """

    if not chunks:
        return ""

    context_parts = []

    for chunk in chunks:
        context_parts.append(
            f"""
[Chunk ID: {chunk.id} | Page {chunk.page_number}]

{chunk.content}
"""
        )

    return "\n".join(context_parts)


def ask_llm(
    question: str,
    chunks: list | None = None,
) -> dict:
    """
    Generate an answer using Gemini.

    The LLM receives only the retrieved PDF chunks.

    Returns:
        {
            "answer": str,
            "usage": {
                "input_tokens": int,
                "output_tokens": int,
                "total_tokens": int
            }
        }
    """

    if not question.strip():
        raise ValueError("Question cannot be empty")

    chunks = chunks or []

    # No retrieved information
    if not chunks:
        return {
            "answer": (
                "I couldn't find that information "
                "in the uploaded document."
            ),
            "usage": {
                "input_tokens": 0,
                "output_tokens": 0,
                "total_tokens": 0,
            },
        }

    context = build_context(chunks)

    prompt = f"""
{SYSTEM_INSTRUCTION}

====================
PDF CONTEXT
====================

{context}

====================
USER QUESTION
====================

{question}

====================
ANSWER
====================
"""

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
            )

            usage_metadata = getattr(
                response,
                "usage_metadata",
                None,
            )

            input_tokens = 0
            output_tokens = 0
            total_tokens = 0

            if usage_metadata:
                input_tokens = (
                    getattr(
                        usage_metadata,
                        "prompt_token_count",
                        0,
                    )
                    or 0
                )

                output_tokens = (
                    getattr(
                        usage_metadata,
                        "candidates_token_count",
                        0,
                    )
                    or 0
                )

                total_tokens = (
                    getattr(
                        usage_metadata,
                        "total_token_count",
                        0,
                    )
                    or 0
                )

            return {
                "answer": response.text,
                "usage": {
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "total_tokens": total_tokens,
                },
            }

        except ServerError:
            if attempt == 2:
                raise

            time.sleep(2)


def build_references(chunks: list) -> list[dict]:
    """
    Build references from the chunks actually used
    to generate the answer.
    """

    references = []

    for chunk in chunks:
        references.append(
            {
                "chunk_id": chunk.id,
                "page_number": chunk.page_number,
                "source_text": chunk.content,
            }
        )

    return references
