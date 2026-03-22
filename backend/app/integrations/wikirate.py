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

def get_climate_score(company_name):
    companies = wiki_client.get_companies(name=company_name)
    if not companies:
        return None
    
    company_id = companies[0].id
  
    result = []
    score = 0
    
    ans = wiki_client.get_answers(
        company=company_id,
        metric_designer="Fashion Revolution",
        metric_name="Fashion Transparency Index"
    )
    val = 0.0
    if ans:
        latest = sorted(ans, key=lambda x: x.year, reverse=True)[0]
        try:
            val = float(str(latest.value).replace('%', ''))
            if val <= 10: val = val * 10 
        except: val = 0.0
        
    score += val

    result.append(("Fashion Transparency Score", score))
    
    return result

def get_wikirate_report(company_name):
    """
    Returns a combined Labor and Climate score with transparency warnings.
    """
    companies = wiki_client.get_companies(name=company_name)
    if not companies:
        return None
    
    final_report = {"company": company_name, "scores": [], "warnings": []}
    
    # 1. LABOR SECTION
    labor_data = get_labor_score(company_name)
    labor_score = labor_data[-1][1] if labor_data else None
    if labor_data:
        # Check for transparency warning (usually the first item in our list)
        transparency_score = next((item[1] for item in labor_data if "Transparency" in item[0]), 100)
        if transparency_score == 0:
            final_report["warnings"].append("ALERT: This brand provides ZERO supply chain transparency.")
        
        final_report["scores"].append({"Labor Ethics": labor_score})

    # 2. CLIMATE SECTION
    climate_data = get_climate_score(company_name)
    if climate_data:
        climate_final = next(item[1] for item in climate_data if "Fashion Transparency Score" in item[0])
        if climate_final <= 50:
            final_report["warnings"].append("ALERT: This brand has POOR climate transparency.")
        
        final_report["scores"].append({"category": "Fashion Transparency", "data": climate_data})
        
    if not final_report["scores"]:
        return None

    return final_report