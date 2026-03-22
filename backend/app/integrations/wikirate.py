import os
from wikirate4py import API

WIKIRATE_API_KEY = os.getenv("WIKIRATE_API_KEY")
wiki_client = API(WIKIRATE_API_KEY)

def get_all_companies():
    return wiki_client.get_companies()

def get_labor_score(company_name):
    score = 0
    data = []
    
    companies = wiki_client.get_companies(name=company_name)
    if not companies:
        return None
    
    company_id = companies[0].id
    
    labor_metrics = [
        {
            "label": "Supply Chain Transparency",
            "designer": "Clean Clothes Campaign",
            "name": "Supply Chain Transparency Score",
            "weight": 30,
            "type": "scale_10"
        },
        {
            "label": "Labour Union Recognition",
            "designer": "Clean Clothes Campaign",
            "name": "Labour Union",
            "weight": 15,
            "type": "binary"
        },
        {
            "label": "Mean Gender Pay Gap",
            "designer": "GreenDex",
            "name": "Mean Gender Pay Gap (Hourly Pay)",
            "weight": 20,
            "type": "percent_gap"
        },
        {
            "label": "Modern Slavery Statement",
            "designer": "Business & Human Rights Resource Centre", 
            "name": "Modern Slavery Statement",
            "weight": 15,
            "type": "binary"
        },
        {
            "label": "Wage Data Disclosure",
            "designer": "Fashion Revolution",
            "name": "Supply Chain Wage Data Disclosure",
            "weight": 20,
            "type": "binary"
        }
    ]

    total_weight = 0

    for m in labor_metrics:
        answers = wiki_client.get_answers(
            company=company_id,
            metric_designer=m["designer"],
            metric_name=m["name"]
        )

        points = 0
        if answers:
            latest = sorted(answers, key=lambda x: x.year, reverse=True)[0]
            print(latest)
            val = str(latest.value).strip().lower()
            
            if m["type"] == "binary":
                points = 100 if "yes" in val else 0
            
            elif m["type"] == "scale_10":
                try:
                    points = float(val) * 10
                except: points = 0
                
            elif m["type"] == "percent_gap":
                try:
                    gap = abs(float(val.replace('%', '')))
                    points = max(0, 100 - gap)
                except: points = 0

            data.append((m["label"], points))
            score += (points * m["weight"])
            total_weight += m["weight"]
        else:
            pass


    # Add the final result
    data.append(("Total Labor Ethics Score", round((score / total_weight) if total_weight else 0, 2)))
    return data

def get_climate_transparency_data(company_name):
    companies = wiki_client.get_companies(name=company_name)
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
            company=company_id,
            metric_designer="Fashion Revolution",
            metric_name=metric_name,
            year=2025
        )
        ans = sorted(ans, key=lambda x: x.year, reverse=True)
        # Convert to float, default to 0.0 if missing
        results[key] = float(ans[0].value) if ans else 0.0
        
    return results