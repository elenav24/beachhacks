import os
from backend.app.api.v1 import api
from wikirate4py import API

WIKIRATE_API_KEY = os.getenv("WIKIRATE_API_KEY")
wiki_client = API(WIKIRATE_API_KEY)

def get_all_companies():
    return wiki_client.get_companies()

def get_all_scores(brand_name):
    pass

def get_labor_score(brand_name):
    score = 0
    data = []
    
    company = wiki_client.get_companies(name=brand_name)
    if not company:
        return None
    
    company_id = company[0].id
    
    wage = wiki_client.get_answers(
        company_id=company_id,
        metric_id=20297487  # metric id for Supply Chain Wage Data Disclosure
    )

    if wage:
        latest_answer = sorted(wage, key=lambda x: x.year, reverse=True)[0]
        wage_value = 100 if str(latest_answer.value).strip().lower() == "yes" else 0
        score += wage_value * 20
        data.append(("Wage Data Disclosure", wage_value))
    
    slavery_statement = wiki_client.get_answers(
        company_id=company_id,
        metric_id=19856250  # metric id for Modern Slavery Statement
    )
    
    if slavery_statement:
        latest_answer = sorted(slavery_statement, key=lambda x: x.year, reverse=True)[0]
        slavery_statement_value = 100 if str(latest_answer.value).strip().lower() == "yes" else 0
        score += slavery_statement_value * 15
        data.append(("Modern Slavery Statement", slavery_statement_value))
        
    transparency = wiki_client.get_answers(
        company_id=company_id,
        metric_id=5780639  # metric id for Supply Chain Transparency
    )
    
    if transparency:
        latest_answer = sorted(transparency, key=lambda x: x.year, reverse=True)[0]
        transparency_value = int(latest_answer.value).strip().lower() * 10 # convert 0-10 to 0-100 and weight it
        score += transparency_value * 30
        data.append(("Supply Chain Transparency", transparency_value))
        
    gender_pay_gap = wiki_client.get_answers(
        company_id=company_id,
        metric_id=19856249  # metric id for Gender Pay Gap Reporting
    )
    
    if gender_pay_gap:
        latest_answer = sorted(gender_pay_gap, key=lambda x: x.year, reverse=True)[0]
        gender_pay_gap_value = 100 - abs(int(latest_answer.value))
        score += gender_pay_gap_value * 20
        data.append(("Mean Gender Pay Gap", gender_pay_gap_value))
        
    labor_union = wiki_client.get_answers(
        company_id=company_id,
        metric_id=4710572  # metric id for Labor Union Recognition
    )

    if labor_union:
        latest_answer = sorted(labor_union, key=lambda x: x.year, reverse=True)[0]
        labor_union_value = 100 if str(latest_answer.value).strip().lower() == "yes" else 0
        score += labor_union_value * 15
        data.append(("Labor Union Recognition", labor_union_value))
        
    data.append(("Total Score", (score / len(data)) / 100 if data else 0))

    return data

def get_latest_answers(brand_name, metric_name, designer="Fashion Revolution"):
    # 1. Get Company
    companies = wiki_client.get_companies(name=brand_name)
    if not companies: return None
    
    # 2. Get ALL answers for this metric (don't specify a year)
    answers = wiki_client.get_answers(
        company_id=companies[0].id,
        metric_designer=designer,
        metric_name=metric_name
    )
    
    if not answers:
        return None

    # 3. Sort answers by year in descending order (Newest first)
    sorted_answers = sorted(answers, key=lambda x: x.year, reverse=True)
    
    # Now you can easily access the latest two years
    latest = sorted_answers[0]
    previous = sorted_answers[1] if len(sorted_answers) > 1 else None
    
    return {
        "latest": {"year": latest.year, "value": latest.value},
        "previous": {"year": previous.year, "value": previous.value} if previous else None
    }

def get_climate_transparency_data(brand_name: str):
    companies = wiki_client.get_companies(name=brand_name)
    if not companies:
        return None
    
    company_id = companies[0].id
    
    metrics = {
        "decarbonization": "2. Decarbonisation Score (revised)",
        "energy": "3. Energy Procurement Score (revised)",
        "traceability": "1.2 Traceability (revised)",
        "accountability": "1. Accountability Score (revised)"
    }
    
    results = {}
    for key, metric_name in metrics.items():
        ans = wiki_client.get_answers(
            company_id=company_id,
            metric_designer="Fashion Revolution",
            metric_name=metric_name,
            year=2025
        )
        ans = sorted(answers, key=lambda x: x.year, reverse=True)
        # Convert to float, default to 0.0 if missing
        results[key] = float(ans[0].value) if ans else 0.0
        
    return results