from app.rag.retriever import RAGRetriever


retriever = RAGRetriever()


query = """
The message asks the customer to provide an OTP
and threatens to block the bank account immediately.
"""


results = retriever.search(
    query,
    top_k=3
)


print("\n========== RAG RESULTS ==========")

for i, result in enumerate(
    results,
    start=1
):

    print(f"\n--- Result {i} ---")

    print(
        "Similarity:",
        result["score"]
    )

    print(
        result["text"]
    )