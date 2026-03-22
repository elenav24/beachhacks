from langchain_community.tools.tavily_search import TavilySearchResults

os.environ["TAVILY_API_KEY"] = <your-api-key> # you can create an API key for free on Tavily's website

internet_search = TavilySearchResults()
internet_search.name = "internet_search"
internet_search.description = "Returns a list of relevant document snippets for a textual query retrieved from the internet."


from langchain_core.pydantic_v1 import BaseModel, Field
class TavilySearchInput(BaseModel):
    query: str = Field(description="Query to search the internet with")
internet_search.args_schema = TavilySearchInput
