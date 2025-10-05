from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

app = FastAPI()

# === MongoDB connection ===
client = MongoClient("mongodb://localhost:27017")
db = client["Agrimitra_db"]
users = db["users"]

# === CORS setup (allow frontend) ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow any frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Models ===
class SignupModel(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str

class LoginModel(BaseModel):
    email: str
    password: str

# === Routes ===

@app.post("/signup")
def signup(data: SignupModel):
    if users.find_one({"email": data.email}):
        return {"status": "error", "message": "Email already exists!"}
    users.insert_one(data.dict())
    return {"status": "success", "message": "Account created successfully!"}

@app.post("/login")
def login(data: LoginModel):
    user = users.find_one({"email": data.email, "password": data.password})
    if user:
        return {"status": "success", "message": "Login successful!"}
    return {"status": "error", "message": "Invalid credentials."}

@app.get("/")
def root():
    return {"message": "Agrimitra Backend Running ✅"}

@app.get("/users")
def get_users():
    all_users = list(users.find({}, {"_id": 0}))  # exclude _id for clean output
    return {"status": "success", "data": all_users}
