"""
Seed the knowledge base with real Cameroonian law articles.
Usage:
  python scripts/seed_cameroon_laws.py [--url http://localhost:8003]
"""
import sys
import httpx

KB_URL = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:8003"

LAWS = [
    {
        "code": "LABOUR",
        "name": "Cameroon Labour Code (Law No. 92/007)",
        "jurisdiction": "cameroon",
        "language": "en",
        "version": "1992",
        "articles": [
            {
                "article_number": "Art. 23",
                "chapter": "Employment Contracts",
                "title": "Types of Employment Contracts",
                "full_text": (
                    "Every employment contract shall be either for a fixed term or for an indefinite period. "
                    "A fixed-term contract must not exceed two years; it may be renewed once. "
                    "After two renewals or after the maximum duration has been reached, a fixed-term contract "
                    "automatically becomes an indefinite-term contract. "
                    "Any clause intended to restrict the conversion of a fixed-term contract into an indefinite-term "
                    "contract shall be null and void."
                ),
                "plain_summary": "Employment contracts are either fixed-term (max 2 years, renewable once) or indefinite. Exceeding limits converts the contract to indefinite.",
                "domain": "labor",
                "language": "en",
            },
            {
                "article_number": "Art. 34",
                "chapter": "Working Hours",
                "title": "Maximum Working Hours and Overtime",
                "full_text": (
                    "The normal working week shall not exceed 40 hours for non-agricultural enterprises. "
                    "Hours worked beyond 40 hours per week constitute overtime and shall be remunerated at "
                    "increased rates: 20% supplement for the first 8 overtime hours per week, "
                    "30% supplement for the following overtime hours. "
                    "Night work performed between 10 p.m. and 6 a.m. shall be paid at a 25% supplement over "
                    "the normal rate. Work performed on Sundays and public holidays shall be paid at double the normal rate."
                ),
                "plain_summary": "Normal work week is 40 hours. Overtime is paid at +20% (first 8 hours) or +30%. Night work +25%, Sunday/holidays double pay.",
                "domain": "labor",
                "language": "en",
            },
            {
                "article_number": "Art. 40",
                "chapter": "Wages",
                "title": "Minimum Wage (SMIG)",
                "full_text": (
                    "A guaranteed inter-professional minimum wage (SMIG) is fixed by decree after consultation "
                    "with the National Labour Advisory Board. No employer shall pay any worker a wage below "
                    "the SMIG applicable to the sector. The SMIG for the private sector is currently set at "
                    "41,875 CFA francs per month. Any clause in a contract paying below the SMIG is void, "
                    "and the worker retains the right to claim the difference plus interest."
                ),
                "plain_summary": "The minimum wage (SMIG) is 41,875 FCFA/month. Any contract below this is void and workers can claim the difference.",
                "domain": "labor",
                "language": "en",
            },
            {
                "article_number": "Art. 69",
                "chapter": "Termination of Employment",
                "title": "Grounds for Dismissal",
                "full_text": (
                    "An employer may dismiss an employee only for a real and serious cause. "
                    "Dismissal without real and serious cause entitles the employee to: full notice pay, "
                    "severance pay calculated at one month's salary per year of service (capped at 15 months), "
                    "damages for unfair dismissal of between 3 and 15 months' salary depending on length of service. "
                    "Dismissal for economic reasons (retrenchment) requires prior authorisation from the labour inspector "
                    "and payment of severance indemnity at the same rate."
                ),
                "plain_summary": "Dismissal requires real cause. Unfair dismissal triggers notice pay, severance (1 month/year, max 15 months), and damages of 3–15 months' salary.",
                "domain": "labor",
                "language": "en",
            },
            {
                "article_number": "Art. 84",
                "chapter": "Maternity and Parental Leave",
                "title": "Maternity Leave Rights",
                "full_text": (
                    "Female workers are entitled to 14 weeks of maternity leave: 4 weeks before the expected date of "
                    "delivery and 10 weeks after delivery. During maternity leave the employment contract is suspended "
                    "and the employer must maintain the employee's full salary. "
                    "It is unlawful to dismiss a female worker during maternity leave or during the 4 weeks following "
                    "her return to work. Dismissal during this period is automatically void."
                ),
                "plain_summary": "14 weeks maternity leave (4 pre, 10 post) with full pay. Dismissal during or 4 weeks after maternity leave is automatically void.",
                "domain": "labor",
                "language": "en",
            },
        ],
    },
    {
        "code": "CIVIL",
        "name": "Cameroon Civil Status Ordinance and Family Law",
        "jurisdiction": "cameroon",
        "language": "en",
        "version": "2011",
        "articles": [
            {
                "article_number": "Art. 52",
                "chapter": "Marriage",
                "title": "Legal Requirements for Marriage",
                "full_text": (
                    "To contract a valid marriage in Cameroon the following conditions must be met: "
                    "both parties must be at least 18 years of age (men) or 15 years (women, with parental consent); "
                    "both parties must give free and full consent; "
                    "there must be no existing undissolved marriage (monogamy applies under civil law, though customary "
                    "law may permit polygamy if registered); "
                    "the marriage must be celebrated before a civil registrar. "
                    "A customary marriage may be recognised if registered within 90 days at the civil registry. "
                    "Failure to register does not automatically invalidate the union but affects inheritance rights."
                ),
                "plain_summary": "Civil marriage requires age 18 (men) or 15 (women with consent), free consent, no prior marriage, and celebration before a civil registrar.",
                "domain": "family",
                "language": "en",
            },
            {
                "article_number": "Art. 68",
                "chapter": "Divorce",
                "title": "Grounds for Divorce",
                "full_text": (
                    "Divorce may be granted by a court on the following grounds: "
                    "(1) Adultery by either spouse; "
                    "(2) Cruelty or serious ill-treatment making cohabitation unbearable; "
                    "(3) Conviction of either spouse to a custodial sentence of more than 5 years; "
                    "(4) Desertion for a continuous period exceeding 2 years without reasonable cause; "
                    "(5) Mutual consent after at least 2 years of marriage, provided both spouses are in agreement "
                    "and have made provision for any children. "
                    "The court may refuse to grant a divorce if it finds it would cause excessive hardship to the other spouse."
                ),
                "plain_summary": "Divorce grounds include adultery, cruelty, long-term imprisonment, 2-year desertion, or mutual consent. Courts may refuse if divorce causes excessive hardship.",
                "domain": "family",
                "language": "en",
            },
            {
                "article_number": "Art. 79",
                "chapter": "Child Custody",
                "title": "Custody and Best Interests of the Child",
                "full_text": (
                    "In all matters relating to the custody of children following separation or divorce, "
                    "the court shall be guided exclusively by the best interests of the child. "
                    "In principle, children under 5 years of age are placed with the mother unless there is "
                    "a compelling reason to the contrary. "
                    "For older children, the court considers the child's own wishes (if they are old enough), "
                    "each parent's ability to provide care, education, and stability, and any history of domestic violence. "
                    "Joint custody may be ordered where both parents consent and it serves the child's interests. "
                    "The non-custodial parent retains visiting rights which may not be unreasonably denied."
                ),
                "plain_summary": "Custody is decided by the child's best interests. Children under 5 generally go to the mother. Older children's wishes are considered. Joint custody is possible.",
                "domain": "family",
                "language": "en",
            },
            {
                "article_number": "Art. 101",
                "chapter": "Succession and Inheritance",
                "title": "Intestate Inheritance",
                "full_text": (
                    "Where a person dies without a will, their estate is distributed as follows under civil law: "
                    "First order: legitimate children share equally, with adopted children having equal rights. "
                    "Second order: if there are no children, parents and siblings share. "
                    "Third order: if none of the above, the surviving spouse inherits the full estate. "
                    "Under customary law, inheritance rules may differ significantly; customary heirs may claim "
                    "property unless the deceased had a registered will expressly excluding them. "
                    "A surviving spouse is always entitled to retain the matrimonial home for at least 2 years "
                    "regardless of the inheritance order."
                ),
                "plain_summary": "Intestate succession: children first (equally), then parents/siblings, then spouse. Surviving spouse always keeps the matrimonial home for 2 years.",
                "domain": "family",
                "language": "en",
            },
        ],
    },
    {
        "code": "LAND",
        "name": "Cameroon Land Tenure Ordinance (No. 74-1)",
        "jurisdiction": "cameroon",
        "language": "en",
        "version": "1974",
        "articles": [
            {
                "article_number": "Sec. 1",
                "chapter": "State Land",
                "title": "Categories of Land in Cameroon",
                "full_text": (
                    "Land in Cameroon falls into three categories: "
                    "(1) Private land: land registered in the name of a private individual or company and evidenced "
                    "by a land certificate (titre foncier). "
                    "(2) State public land: land used for public purposes (roads, schools, government buildings) "
                    "which cannot be alienated. "
                    "(3) National land: all land not privately registered and not classified as state public land, "
                    "which is managed by the State and may be allocated to individuals upon application. "
                    "Customary occupancy of national land is recognised but does not confer ownership."
                ),
                "plain_summary": "Three land categories: private (titre foncier), state public (non-alienable), and national land. Customary occupation of national land is recognised but not full ownership.",
                "domain": "housing",
                "language": "en",
            },
            {
                "article_number": "Sec. 8",
                "chapter": "Land Registration",
                "title": "Obtaining a Land Certificate (Titre Foncier)",
                "full_text": (
                    "To obtain a land certificate (titre foncier) in Cameroon, an applicant must: "
                    "(1) File an application at the Divisional Delegation of Lands (MINDCAF); "
                    "(2) Submit proof of ownership or long-term occupancy (at least 10 years); "
                    "(3) Have a cadastral survey performed by a licensed surveyor; "
                    "(4) Publish the application in the local official gazette for 30 days; "
                    "(5) Pay the applicable registration fees. "
                    "Once issued, the titre foncier is the definitive proof of ownership and cannot be contested "
                    "after 2 years from the date of issue. It is freely transferable by sale, gift, or inheritance."
                ),
                "plain_summary": "A titre foncier requires application to MINDCAF, proof of occupancy, cadastral survey, 30-day gazette notice, and fees. Once issued it is definitive proof of ownership.",
                "domain": "housing",
                "language": "en",
            },
            {
                "article_number": "Sec. 17",
                "chapter": "Expropriation",
                "title": "Expropriation for Public Purpose",
                "full_text": (
                    "The State may expropriate private land for reasons of public utility (roads, hospitals, schools, etc.). "
                    "Expropriation requires: a declaration of public utility by decree; "
                    "prior fair and equitable compensation assessed by an administrative commission; "
                    "payment of compensation before taking possession. "
                    "An owner who contests the valuation may appeal to the competent court within 60 days. "
                    "Failure to pay compensation before possession is taken renders the expropriation illegal "
                    "and the owner may seek an injunction."
                ),
                "plain_summary": "The State can expropriate land for public use but must pay fair compensation first. Owners can challenge valuations in court within 60 days.",
                "domain": "housing",
                "language": "en",
            },
        ],
    },
    {
        "code": "PENAL",
        "name": "Cameroon Penal Code (Law No. 2016/007)",
        "jurisdiction": "cameroon",
        "language": "en",
        "version": "2016",
        "articles": [
            {
                "article_number": "Art. 318",
                "chapter": "Offences Against Property",
                "title": "Theft",
                "full_text": (
                    "Whoever dishonestly appropriates any movable property belonging to another person "
                    "without the consent of the owner commits theft and is liable to imprisonment for "
                    "between 5 and 10 years and a fine of between 25,000 and 200,000 FCFA. "
                    "Aggravated theft (with violence, at night, in a dwelling, by a person in a position of trust, "
                    "or with weapons) is punishable by 10 to 20 years' imprisonment. "
                    "Theft of essential services (water, electricity) carries a sentence of 1 to 3 years."
                ),
                "plain_summary": "Simple theft: 5–10 years + fine. Aggravated theft (violence, dwelling, weapons): 10–20 years. Theft of utilities: 1–3 years.",
                "domain": "criminal",
                "language": "en",
            },
            {
                "article_number": "Art. 337",
                "chapter": "Fraud",
                "title": "Swindling and Fraud",
                "full_text": (
                    "Whoever by false pretences, fraudulent concealment, or deceitful manoeuvres induces "
                    "another person to hand over money, property, or a document is guilty of swindling "
                    "and liable to imprisonment of 1 to 10 years and a fine of 100,000 to 2,000,000 FCFA. "
                    "Online fraud and fraud using electronic communications are treated as aggravated swindling "
                    "carrying a maximum of 20 years' imprisonment under the Cybercrime Act."
                ),
                "plain_summary": "Fraud (false pretences causing financial loss): 1–10 years + fine. Online/electronic fraud is aggravated and carries up to 20 years.",
                "domain": "criminal",
                "language": "en",
            },
            {
                "article_number": "Art. 279",
                "chapter": "Offences Against Persons",
                "title": "Simple Assault and Battery",
                "full_text": (
                    "Whoever intentionally inflicts bodily harm upon another person, without intent to kill, "
                    "is guilty of assault and battery. "
                    "Simple assault causing no lasting injury: imprisonment of 10 days to 3 years and/or a fine. "
                    "Assault causing temporary incapacity of more than 30 days: 2 to 5 years. "
                    "Assault causing permanent disability or disfigurement: 5 to 10 years. "
                    "Assault on a minor under 15, or a pregnant woman, or a person with disability is aggravated "
                    "and carries a sentence of 5 to 15 years."
                ),
                "plain_summary": "Simple assault: 10 days–3 years. Causing 30-day incapacity: 2–5 years. Permanent harm: 5–10 years. Aggravated (minor, pregnant, disabled victim): 5–15 years.",
                "domain": "criminal",
                "language": "en",
            },
            {
                "article_number": "Art. 241",
                "chapter": "Defamation and Insult",
                "title": "Defamation",
                "full_text": (
                    "Whoever by any means of communication publicly attributes to a specific person a fact "
                    "that is injurious to that person's honour or reputation, and which cannot be proven true, "
                    "is guilty of defamation and liable to imprisonment of 6 months to 2 years and/or a fine "
                    "of 50,000 to 5,000,000 FCFA. "
                    "Truth is an absolute defence to a defamation claim. "
                    "Defamation of a public official or government institution carries a higher sentence. "
                    "Online defamation through social media is treated with equal severity under the Cybercrime law."
                ),
                "plain_summary": "Defamation: 6 months–2 years + fine. Truth is a full defence. Online defamation is treated equally. Defaming public officials carries heavier penalties.",
                "domain": "criminal",
                "language": "en",
            },
        ],
    },
    {
        "code": "COMMERCIAL",
        "name": "OHADA Uniform Act on Commercial Companies (AUSC)",
        "jurisdiction": "cameroon",
        "language": "en",
        "version": "2014",
        "articles": [
            {
                "article_number": "Art. 4",
                "chapter": "Business Registration",
                "title": "Requirement to Register a Business",
                "full_text": (
                    "Any natural or legal person carrying on a commercial activity in an OHADA member state "
                    "(including Cameroon) is required to register with the Trade and Personal Property Rights Register "
                    "(RCCM) within one month of starting operations. "
                    "Individual traders register as 'commerçant personne physique'. "
                    "Companies (SARL, SA, SNC, etc.) must register at incorporation. "
                    "Operating without registration is an offence and may result in fines and an order to regularise. "
                    "Registration provides the business with legal personality and the right to sue and be sued."
                ),
                "plain_summary": "All businesses in Cameroon must register with the RCCM within 1 month of starting. Operating unregistered is an offence. Registration grants legal personality.",
                "domain": "commercial",
                "language": "en",
            },
            {
                "article_number": "Art. 311",
                "chapter": "SARL",
                "title": "Private Limited Company (SARL) — Formation",
                "full_text": (
                    "A Société à Responsabilité Limitée (SARL) is a company in which the liability of each "
                    "partner is limited to their contribution. Minimum share capital is 1,000,000 FCFA, "
                    "divided into equal shares of at least 5,000 FCFA each. "
                    "A SARL requires a minimum of 1 and a maximum of 50 shareholders. "
                    "It must have at least one manager (gérant) who may be a shareholder or a third party. "
                    "A SARL may be formed by a single person (SARL unipersonnelle). "
                    "Articles of association must be notarised and registered with the RCCM."
                ),
                "plain_summary": "SARL: limited liability company. Min capital 1,000,000 FCFA. 1–50 shareholders. At least 1 manager. Can be single-person. Must be notarised and RCCM-registered.",
                "domain": "commercial",
                "language": "en",
            },
            {
                "article_number": "Art. 103",
                "chapter": "Contracts",
                "title": "Formation and Validity of Commercial Contracts",
                "full_text": (
                    "A commercial contract is validly formed when there is: "
                    "(1) Agreement between the parties (offer and acceptance); "
                    "(2) Capacity to contract (legal age, not under guardianship); "
                    "(3) A lawful object; "
                    "(4) Consideration (cause). "
                    "Commercial contracts may be concluded orally or in writing; however, contracts above "
                    "50,000 FCFA should be evidenced in writing to be enforceable in court. "
                    "An electronic contract has the same validity as a paper contract provided the signatory "
                    "can be identified and the integrity of the document is assured."
                ),
                "plain_summary": "Contracts need: agreement, capacity, lawful object, and consideration. Oral contracts are valid but written evidence is required above 50,000 FCFA. E-contracts are equally valid.",
                "domain": "commercial",
                "language": "en",
            },
        ],
    },
    {
        "code": "HOUSING",
        "name": "Cameroon Rent and Tenant Rights Law",
        "jurisdiction": "cameroon",
        "language": "en",
        "version": "2010",
        "articles": [
            {
                "article_number": "Art. 5",
                "chapter": "Lease Agreements",
                "title": "Essential Terms of a Rental Contract",
                "full_text": (
                    "A rental contract must be in writing and must specify: "
                    "the identity of the landlord and tenant; "
                    "a precise description of the property (address, surface area, number of rooms); "
                    "the monthly rent amount and the date on which it is due; "
                    "the deposit amount (caution), which may not exceed 3 months' rent; "
                    "the duration of the lease (fixed-term or open-ended). "
                    "An oral lease is valid but is treated as an open-ended lease at a rent "
                    "determined by reference to comparable properties in the area. "
                    "The tenant receives a copy of the signed contract at no cost."
                ),
                "plain_summary": "Rental contracts must be written, include rent, deposit (max 3 months), and property description. Oral leases are valid as open-ended. Tenant gets a free copy.",
                "domain": "housing",
                "language": "en",
            },
            {
                "article_number": "Art. 14",
                "chapter": "Tenant Eviction",
                "title": "Legal Eviction Procedure",
                "full_text": (
                    "A landlord may only evict a tenant by following the proper legal procedure: "
                    "(1) Issue a formal written notice to quit (mise en demeure) specifying the grounds; "
                    "(2) For non-payment of rent, give the tenant at least 30 days to pay outstanding arrears; "
                    "(3) If the tenant does not comply, file a petition with the competent court (Tribunal de Première Instance); "
                    "(4) Obtain a court eviction order (ordonnance d'expulsion); "
                    "(5) Execute the eviction through a bailiff (huissier de justice). "
                    "Self-help eviction (changing locks, removing belongings, cutting utilities) is illegal "
                    "and the landlord may be liable for damages and criminal prosecution."
                ),
                "plain_summary": "Eviction requires: written notice, 30-day cure period for non-payment, court petition, eviction order, and bailiff execution. Forced eviction without court order is illegal.",
                "domain": "housing",
                "language": "en",
            },
            {
                "article_number": "Art. 22",
                "chapter": "Rent Increases",
                "title": "Rules on Rent Increases",
                "full_text": (
                    "A landlord may not increase rent during a fixed-term lease unless the contract expressly "
                    "provides for an indexation clause. "
                    "For open-ended leases, the landlord must give the tenant at least 3 months' written notice "
                    "before implementing any rent increase. "
                    "Rent increases must be justified and proportionate; excessive increases "
                    "(above 10% in any 12-month period without material improvement to the property) "
                    "may be challenged before the Rent Tribunal (Commission d'Arbitrage des Loyers). "
                    "The Rent Tribunal can order a reduction and award damages to the tenant."
                ),
                "plain_summary": "No rent increase during fixed-term leases (unless contractual clause). Open-ended: 3-month notice required. Increases over 10%/year can be challenged at the Rent Tribunal.",
                "domain": "housing",
                "language": "en",
            },
        ],
    },
]


def main():
    base = KB_URL.rstrip("/")
    url = f"{base}/api/v1/ingest"
    print(f"Seeding knowledge base at {url}")
    with httpx.Client(timeout=120.0) as client:
        for law in LAWS:
            print(f"  Ingesting {law['code']} — {law['name']} ({len(law['articles'])} articles)...")
            resp = client.post(url, json=law)
            try:
                resp.raise_for_status()
                result = resp.json()
                print(f"    ✓ document_id={result['document_id']}, articles_ingested={result['articles_ingested']}")
            except Exception as e:
                print(f"    ✗ Failed: {e} — {resp.text[:200]}")
    print("Done.")


if __name__ == "__main__":
    main()
