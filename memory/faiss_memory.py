import faiss
import json
import os
import numpy as np
from datetime import datetime
from sentence_transformers import SentenceTransformer

# embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEMORY_DIR = os.path.join(BASE_DIR, "memory")

os.makedirs(MEMORY_DIR, exist_ok=True)
# storage files
INDEX_FILE = os.path.join(MEMORY_DIR, "faiss.index")
DATA_FILE = os.path.join(MEMORY_DIR, "facts.json")

dimension = 384

# load or create FAISS index
if os.path.exists(INDEX_FILE):
    index = faiss.read_index(INDEX_FILE)
else:
    index = faiss.IndexFlatL2(dimension)

# load stored metadata
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r") as f:
        facts = json.load(f)
else:
    facts = []


def add_memory(claim, verdict, confidence=None, sources=None, explanation=None):

    vector = model.encode([claim])
    vector = np.array(vector).astype("float32")

    index.add(vector)

    fact = {
        "claim": claim,
        "verdict": verdict,
        "confidence": confidence,
        "sources": sources,
        "explanation": explanation,
        "timestamp": datetime.utcnow().isoformat()
    }

    facts.append(fact)

    # save index
    faiss.write_index(index, INDEX_FILE)

    # save metadata
    with open(DATA_FILE, "w") as f:
        json.dump(facts, f, indent=2)


def search_memory(claim, threshold=0.80):

    if index.ntotal == 0:
        return None

    vector = model.encode([claim])
    vector = np.array(vector).astype("float32")

    distances, ids = index.search(vector, 1)

    idx = ids[0][0]

    if idx == -1:
        return None

    similarity = 1 / (1 + distances[0][0])

    if similarity > threshold:
        print("this is a match")
        return facts[idx]

    return None