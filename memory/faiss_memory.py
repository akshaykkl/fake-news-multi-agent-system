import faiss
import json
import os
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

INDEX_FILE = "memory/faiss_index.bin"
DATA_FILE = "memory/facts.json"

dimension = 384


if os.path.exists(INDEX_FILE):
    index = faiss.read_index(INDEX_FILE)
else:
    index = faiss.IndexFlatL2(dimension)


if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r") as f:
        facts = json.load(f)
else:
    facts = []



def add_memory(claim, verdict):

    vector = model.encode([claim])
    vector = np.array(vector).astype("float32")

    index.add(vector)

    facts.append({
        "claim": claim,
        "verdict": verdict
    })

    faiss.write_index(index, INDEX_FILE)

    with open(DATA_FILE, "w") as f:
        json.dump(facts, f, indent=2)


def search_memory(claim, threshold=0.85):

    if index.ntotal == 0:
        return None

    vector = model.encode([claim])
    vector = np.array(vector).astype("float32")

    distances, ids = index.search(vector, 1)

    if ids[0][0] == -1:
        return None

    similarity = 1 / (1 + distances[0][0])

    if similarity > threshold:
        return facts[ids[0][0]]

    return None