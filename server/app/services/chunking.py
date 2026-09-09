def chunk_text(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> list[str]:
    """
    Split text into overlapping chunks.

    Args:
        text: Text to split.
        chunk_size: Maximum characters per chunk.
        chunk_overlap: Characters shared between chunks.

    Returns:
        List of text chunks.
    """

    if not text.strip():
        return []

    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0")

    if chunk_overlap < 0:
        raise ValueError("chunk_overlap cannot be negative")

    if chunk_overlap >= chunk_size:
        raise ValueError(
            "chunk_overlap must be smaller than chunk_size"
        )

    chunks = []

    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= text_length:
            break

        start = end - chunk_overlap

    return chunks


def create_document_chunks(
    pages: list[dict],
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> list[dict]:
    """
    Create chunks while preserving the original PDF page number.

    Returns:
        [
            {
                "page_number": 1,
                "chunk_index": 0,
                "content": "..."
            },
            ...
        ]
    """

    chunks = []
    chunk_index = 0

    for page in pages:
        page_chunks = chunk_text(
            text=page["content"],
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

        for content in page_chunks:
            chunks.append(
                {
                    "page_number": page["page_number"],
                    "chunk_index": chunk_index,
                    "content": content,
                }
            )

            chunk_index += 1

    return chunks
