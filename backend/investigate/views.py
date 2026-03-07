from rest_framework.decorators import api_view
from rest_framework.response import Response

from orchestrator.agent_graph import run_pipeline


@api_view(['POST'])
def investigate(request):

    claim = request.data.get("claim")

    result = run_pipeline(claim)

    return Response({
        "result": result
    })