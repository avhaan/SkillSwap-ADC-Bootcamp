import pytest


@pytest.mark.parametrize("query", ["page=0", "limit=0", "limit=49", "page=abc", "search=" + "x" * 101])
def test_browse_query_validation(client, query):
    assert client.get(f"/api/users/?{query}").status_code == 422


@pytest.mark.parametrize("payload", [{}, {"rating": 0, "comment": "ok"},
    {"rating": 6, "comment": "ok"}, {"rating": 3, "comment": ""},
    {"rating": 3, "comment": "x" * 501}])
def test_review_body_validation(client, payload):
    from .test_matches import headers, SENDER, RECEIVER
    response = client.post(f"/api/reviews/{RECEIVER}", json=payload, headers=headers(SENDER))
    assert response.status_code == 422
