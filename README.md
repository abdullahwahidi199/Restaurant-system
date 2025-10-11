git clone https://github.com/abdullahwahidi199/RMS
cd RMS

Backend Setup (Django + DRF)
cd backend
python -m venv venv
.\venv\Scripts\Activate

cd backend
pip install -r requirements.txt
pip install djangorestframework
python manage.py migrate
python manage.py runserver






Frontend Setup (React)
cd frontend
npm install 
npm install lucide-react
npm insall framer-motion
npm install @tanstack/react-query #for caching, frequent identical API calls

npm run dev



Starting to Work on the Project
Always work on a separate branch (never directly on main):
git checkout -b feature/<your-feature-name>

Make your changes, then commit and push:

git add .
git commit -m "Describe your changes"
git push origin feature/<your-feature-name>