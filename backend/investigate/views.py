from django.http import StreamingHttpResponse
import json
from orchestrator.agent_graph import run_pipeline_stream


def investigate_stream(request):

    claim = request.GET.get("claim")

    def event_stream():

        for event in run_pipeline_stream(claim):

            yield f"data: {json.dumps(event)}\n\n"

    response = StreamingHttpResponse(
        event_stream(),
        content_type="text/event-stream"
    )

    response["Cache-Control"] = "no-cache"

    return response