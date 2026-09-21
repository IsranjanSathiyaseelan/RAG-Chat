import fitz

def extract_text_from_pdf(file_path: str) -> list[dict]:
    """
    Extract text from a PDF while preserving page numbers.

    Returns:
        [
            {
                "page_number": 1,
                "content": "..."
            },
            ...
        ]
    """

    pages = []

    document = fitz.open(file_path)

    try:
        for page_number, page in enumerate(document, start=1):
            content = page.get_text("text").strip()

            if not content:
                continue

            pages.append(
                {
                    "page_number": page_number,
                    "content": content,
                }
            )

    finally:
        document.close()

    return pages
