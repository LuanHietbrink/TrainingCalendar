from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
import os
from bson.objectid import ObjectId
from passlib.hash import bcrypt

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
exercises_col = db['exercises']
session_types_col = db['session_types']


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
    hashed_password = bcrypt.hash(password)
    users_col.insert_one({'email': email, 'password': hashed_password})
    return jsonify({'msg': 'Registration successful'}), 200

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = users_col.find_one({'email': email})
    if not user or not bcrypt.verify(password, user['password']):
        return jsonify({'msg': 'Bad credentials'}), 401
    access_token = create_access_token(identity=email)
    return jsonify({'access_token': access_token, 'email': email}), 200

@app.route('/api/calendar', methods=['GET'])
@jwt_required()
def get_calendar():
    email = get_jwt_identity()
    sessions = calendar_col.find({'email': email})
    calendar = {}
    for s in sessions:
        date = s['date']
        if date not in calendar:
            calendar[date] = []
        calendar[date].append({
            'type': s['type'],
            'exercises': s.get('exercises', []),
            'commentary': s.get('commentary', '')
        })
    return jsonify(calendar), 200

@app.route('/api/calendar/<date>', methods=['GET'])
@jwt_required()
def get_day_sessions(date):
    email = get_jwt_identity()
    sessions = list(calendar_col.find({'email': email, 'date': date}))
    result = [
        {
            'type': s['type'],
            'exercises': s.get('exercises', []),
            'commentary': s.get('commentary', '')
        }
        for s in sessions
    ]
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
        'exercises': session.get('exercises', []),
        'commentary': session.get('commentary', '')
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
    sessions = list(calendar_col.find({'email': email, 'date': date}))
    if idx < 0 or idx >= len(sessions):
        return jsonify({'msg': 'Session not found'}), 404
    session_id = sessions[idx]['_id']
    calendar_col.update_one({'_id': session_id}, {'$set': {
        'type': new_session.get('type'),
        'exercises': new_session.get('exercises', []),
        'commentary': new_session.get('commentary', '')
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

@app.route('/api/exercises', methods=['GET'])
@jwt_required()
def get_exercises():
    email = get_jwt_identity()
    exercises = list(exercises_col.find({'email': email}))
    return jsonify([
        {'_id': str(e['_id']), 'name': e['name'], 'type': e['type']} for e in exercises
    ]), 200

@app.route('/api/exercises', methods=['POST'])
@jwt_required()
def create_exercise():
    email = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    type_ = data.get('type')
    if not name or not type_:
        return jsonify({'msg': 'Missing name or type'}), 400
    result = exercises_col.insert_one({'email': email, 'name': name, 'type': type_})
    return jsonify({'_id': str(result.inserted_id), 'name': name, 'type': type_}), 201

@app.route('/api/exercises/<exercise_id>', methods=['PUT'])
@jwt_required()
def update_exercise(exercise_id):
    email = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    type_ = data.get('type')
    if not name or not type_:
        return jsonify({'msg': 'Missing name or type'}), 400
    result = exercises_col.update_one({'_id': ObjectId(exercise_id), 'email': email}, {'$set': {'name': name, 'type': type_}})
    if result.matched_count == 0:
        return jsonify({'msg': 'Exercise not found'}), 404
    return jsonify({'_id': exercise_id, 'name': name, 'type': type_}), 200

@app.route('/api/exercises/<exercise_id>', methods=['DELETE'])
@jwt_required()
def delete_exercise(exercise_id):
    email = get_jwt_identity()
    result = exercises_col.delete_one({'_id': ObjectId(exercise_id), 'email': email})
    if result.deleted_count == 0:
        return jsonify({'msg': 'Exercise not found'}), 404
    return jsonify({'msg': 'Exercise deleted'}), 200

@app.route('/api/session_types', methods=['GET'])
@jwt_required()
def get_session_types():
    email = get_jwt_identity()
    session_types = list(session_types_col.find({'email': email}))
    return jsonify([
        {'_id': str(st['_id']), 'value': st['value'], 'label': st['label']} for st in session_types
    ]), 200

@app.route('/api/session_types', methods=['POST'])
@jwt_required()
def create_session_type():
    email = get_jwt_identity()
    data = request.get_json()
    value = data.get('value')
    label = data.get('label')
    if not value or not label:
        return jsonify({'msg': 'Missing value or label'}), 400
    # Prevent duplicate value for this user
    if session_types_col.find_one({'email': email, 'value': value}):
        return jsonify({'msg': 'Session type already exists'}), 400
    result = session_types_col.insert_one({'email': email, 'value': value, 'label': label})
    return jsonify({'_id': str(result.inserted_id), 'value': value, 'label': label}), 201

@app.route('/api/session_types/<session_type_id>', methods=['PUT'])
@jwt_required()
def update_session_type(session_type_id):
    email = get_jwt_identity()
    data = request.get_json()
    value = data.get('value')
    label = data.get('label')
    if not value or not label:
        return jsonify({'msg': 'Missing value or label'}), 400
    result = session_types_col.update_one({'_id': ObjectId(session_type_id), 'email': email}, {'$set': {'value': value, 'label': label}})
    if result.matched_count == 0:
        return jsonify({'msg': 'Session type not found'}), 404
    return jsonify({'_id': session_type_id, 'value': value, 'label': label}), 200

@app.route('/api/session_types/<session_type_id>', methods=['DELETE'])
@jwt_required()
def delete_session_type(session_type_id):
    email = get_jwt_identity()
    result = session_types_col.delete_one({'_id': ObjectId(session_type_id), 'email': email})
    if result.deleted_count == 0:
        return jsonify({'msg': 'Session type not found'}), 404
    return jsonify({'msg': 'Session type deleted'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 