from g4f.client import Client


g4f_client = Client(
    timeout=300,
    max_retries=5,
)
