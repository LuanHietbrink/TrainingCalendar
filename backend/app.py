from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
import os
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production!
jwt = JWTManager(app)

# MongoDB setup (local)
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client['training_calendar']
users_col = db['users']
calendar_col = db['calendar']

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

@app.route('/api/greet', methods=['GET'])
def greet():
    return jsonify({'message': 'Hello from Flask backend!'}), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'msg': 'Missing email or password'}), 400
    if users_col.find_one({'email': email}):
        return jsonify({'msg': 'User already exists'}), 400
    users_col.insert_one({'email': email, 'password': password})
    return jsonify({'msg': 'Registration successful'}), 200

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = users_col.find_one({'email': email})
    if not user or user['password'] != password:
        return jsonify({'msg': 'Bad credentials'}), 401
    access_token = create_access_token(identity=email)
    return jsonify({'access_token': access_token, 'email': email}), 200

@app.route('/api/calendar', methods=['GET'])
@jwt_required()
def get_calendar():
    email = get_jwt_identity()
    # Get all sessions for this user
    sessions = calendar_col.find({'email': email})
    calendar = {}
    for s in sessions:
        date = s['date']
        if date not in calendar:
            calendar[date] = []
        calendar[date].append({
            'type': s['type'],
            'exercises': s.get('exercises', [])
        })
    return jsonify(calendar), 200

@app.route('/api/calendar/<date>', methods=['GET'])
@jwt_required()
def get_day_sessions(date):
    email = get_jwt_identity()
    sessions = list(calendar_col.find({'email': email, 'date': date}))
    result = [{'type': s['type'], 'exercises': s.get('exercises', [])} for s in sessions]
    return jsonify(result), 200

@app.route('/api/calendar/<date>', methods=['POST'])
@jwt_required()
def add_session(date):
    email = get_jwt_identity()
    session = request.get_json()
    calendar_col.insert_one({
        'email': email,
        'date': date,
        'type': session.get('type'),
        'exercises': session.get('exercises', [])
    })
    return jsonify({'msg': 'Session added'}), 200

@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    user = get_jwt_identity()
    return jsonify({'msg': f'Hello, {user}!'}), 200

@app.route('/api/calendar/<date>/<int:idx>', methods=['PUT'])
@jwt_required()
def update_session(date, idx):
    email = get_jwt_identity()
    new_session = request.get_json()
    # Find all sessions for this user and date, sorted by _id
    sessions = list(calendar_col.find({'email': email, 'date': date}))
    if idx < 0 or idx >= len(sessions):
        return jsonify({'msg': 'Session not found'}), 404
    session_id = sessions[idx]['_id']
    calendar_col.update_one({'_id': session_id}, {'$set': {
        'type': new_session.get('type'),
        'exercises': new_session.get('exercises', [])
    }})
    return jsonify({'msg': 'Session updated'}), 200

@app.route('/api/calendar/<date>/<int:idx>', methods=['DELETE'])
@jwt_required()
def delete_session(date, idx):
    email = get_jwt_identity()
    # Find all sessions for this user and date, sorted by _id
    sessions = list(calendar_col.find({'email': email, 'date': date}))
    if idx < 0 or idx >= len(sessions):
        return jsonify({'msg': 'Session not found'}), 404
    session_id = sessions[idx]['_id']
    calendar_col.delete_one({'_id': session_id})
    return jsonify({'msg': 'Session deleted'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 