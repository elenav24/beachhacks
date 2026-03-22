import os
from pydantic import BaseModel, Field
from langchain_cohere import ChatCohere
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.agents import create_agent

# 1. Setup Tools
tavily_api_key = os.getenv("TAVILY_API_KEY")
cohere_api_key = os.getenv("COHERE_API_KEY")

internet_search = TavilySearchResults(max_results=5)
internet_search.name = "internet_search"
internet_search.description = "Search for specific factory locations and logistics hubs."

class TavilySearchInput(BaseModel):
    query: str = Field(description="Query to search the internet with")

internet_search.args_schema = TavilySearchInput
tools = [internet_search]

# 2. Define the Model
# Command A (03-2025) is the 2026 standard for high-speed tool use.
llm = ChatCohere(model="command-a-03-2025", api_key=cohere_api_key)

# 3. Define your Instructions (The "System Prompt")
# In v1.0, we pass the prompt as a string or SystemMessage to state_modifier.
INSTRUCTIONS = """Role: Supply Chain Intelligence Agent (v2026)
Task: Generate a precise logistics trace and CO2 impact for [COMPANY].

LOGISTICS LOGIC:
1. Origin: Default to major 2026 manufacturing hubs (e.g., H&M -> Vietnam/China, Apple -> Vietnam/India, Zara -> Spain/Turkey).
2. Primary DC: Route through the closest major regional hub (e.g., West Coast US -> Long Beach/CA Hubs; Midwest -> Columbus/Chicago).
3. Physics: Product mass = 0.5kg. CO2 = (Distance_km * Weight_tonnes * Emission_Factor). 
4. Factors (g CO2/tonne-km): Ship: 19 | Truck: 243 | Rail: 16 | Air: 1054.

OUTPUT FORMAT: Return ONLY the raw JSON object. Do not include Markdown code blocks (```json) or introductory text.
{
  "company": "Name",
  "product_path": [
    {
      "stage": "Stage Name",
      "location": "City, Country",
      "type": "origin|manufacturing|distribution|destination",
      "transport": {
        "mode": "ship|truck|rail|air",
        "distance_km": 0,
        "co2_kg": 0.000
      }
    }
  ],
  "totals": {
    "distance_km": 0,
    "transit_days": 0,
    "co2_kg_total": 0.000
  }
}"""

agent_executor = create_agent(
    model=llm, 
    tools=tools, 
    system_prompt=INSTRUCTIONS
)

def get_supply_chain_map(company_name, delivery_city):
    """
    Fetches the supply chain journey and formats it for the receipt.
    """
    # In v1.0, agents expect a list of messages.
    user_input = f"Map the 2026 supply chain for '{company_name}' ending in {delivery_city}."
    
    response = agent_executor.invoke({
        "messages": [("user", user_input)]
    })
    
    # Extracting the content from the last AI Message in the graph state
    return response["messages"][-1].content
