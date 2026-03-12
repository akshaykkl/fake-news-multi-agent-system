import json
import os

GRAPH_FILE = "graph_data/graph.json"

# load graph
if os.path.exists(GRAPH_FILE):
    with open(GRAPH_FILE, "r") as f:
        graph = json.load(f)
else:
    graph = {
        "entities": {},
        "claims": {}
    }


def add_entity_relation(entity, relation, target):

    if entity not in graph["entities"]:
        graph["entities"][entity] = []

    graph["entities"][entity].append({
        "relation": relation,
        "target": target
    })

from datetime import datetime


def save_graph():

    os.makedirs("graph_data", exist_ok=True)

    with open(GRAPH_FILE, "w") as f:
        json.dump(graph, f, indent=2)

def get_entity_info(entity):

    return graph["entities"].get(entity, [])
      
def add_claim(claim, verdict, entities=None, topic=None):

    graph["claims"][claim] = {
        "verdict": verdict,
        "entities": entities or [],
        "topic": topic,
        "timestamp": datetime.utcnow().isoformat()
    }

    save_graph()