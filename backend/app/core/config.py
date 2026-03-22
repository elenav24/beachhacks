import os
from dotenv import load_dotenv

load_dotenv()

RAINFOREST_API_KEY = os.getenv("RAINFOREST_API_KEY")
CLIMATIQ_API_KEY = os.getenv("CLIMATIQ_API_KEY")
WIKIRATE_API_KEY = os.getenv("WIKIRATE_API_KEY")

