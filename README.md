# ZILO_TrialMode
<img width="650" height="858" alt="image" src="https://github.com/user-attachments/assets/8714d5dd-8e24-4bbe-ac38-ee7ed2d76bcf" />
<img width="872" height="862" alt="Screenshot 2026-04-26 042201" src="https://github.com/user-attachments/assets/62a65086-fc42-4961-a4d1-0511179b19d1" />


**A working prototype built for ZILO's open Product Engineering role.**
 
## The Problem I'm Solving
 
When a ZILO delivery partner arrives at a customer's door, the next 30 minutes are the most valuable interaction in your entire product — a customer physically holding your curated items, making real-time purchase decisions.
The return data exists — but there's no layer turning it into curation decisions automatically.
 
Right now, nothing captures that moment digitally.
 
- No structured keep/return flow in the app
- No reason collected when an item is returned  
- No data feeding back into curation
- A delivery partner waiting, with no visibility into what's happening
Every return is a cost. It should be a data point.

**The Dashboard
Auto-flags every SKU after enough trial data:

PULL — keep rate < 35% → exact action generated
WATCH — keep rate 35–55% → reason flagged, team alerted
BOOST — keep rate ≥ 75% → increase inventory + visibility

**The Trial Flow
Customer-facing screen that activates when delivery arrives. Keep or return per item, one-tap reason, confirms. Data hits the backend instantly. The 30-minute window finally has a product on top of it.

**Stack: React · Node.js · Express · MongoDB
bashcd backend && npm install && npm start
cd frontend && npm install && npm start

localhost:3000 → dashboard · localhost:3000/trial/ZL-20482 → trial flow

No MongoDB? Loads with demo data automatically.

Built in a day for ZILO's Product Engineering role.
Nausheen 
HIT Kolkata 2026 
nausheen.rabbani08@gmail.com
