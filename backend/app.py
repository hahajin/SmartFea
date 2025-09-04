from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import requests
import json
import os
from dotenv import load_dotenv
import time

load_dotenv()  # 加载.env文件中的环境变量

app = Flask(__name__)
CORS(app)

print("\nAI Agent Starting application...")
print("--------------------------------------------------\n")
# print(f"Environment Variables: {os.environ}\n")
print(f"HF_API_KEY is: {'set' if os.environ.get('HF_API_KEY') else 'not set'}")
print(f"RENDER is: {'set' if os.environ.get('RENDER') else 'not set'}")
print(f"DATABASE_URL is: {'set' if os.environ.get('DATABASE_URL') else 'not set'}")
print(f"DEBUG is: {'set' if os.environ.get('DEBUG') else 'not set'}")
print(f"Current Working Directory: {os.getcwd()}")
print(f"App Directory: {os.path.abspath(os.path.dirname(__file__))}")
print(f"List of files in App Directory: {os.listdir(os.path.abspath(os.path.dirname(__file__)))}")
print(f"List of files in Current Working Directory: {os.listdir(os.getcwd())}")
print(f"Python Executable: {os.sys.executable}")
print(f"Python Version: {os.sys.version}")
# print(f"Flask Version: {Flask.__version__}")
# print(f"SQLAlchemy Version: {SQLAlchemy.__version__}")
# print(f"Requests Version: {requests.__version__}\n")
print(f"JSON Module: {json.__version__ if hasattr(json, '__version__') else 'built-in module'}\n")
print("Initialization complete.\n")
print("--------------------------------------------------\n")

# 数据库配置 - 根据环境选择数据库
if os.environ.get('RENDER'):  # 在Render部署环境中
    # 使用Render提供的PostgreSQL数据库
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url

    print(f"Using database URL: {app.config['SQLALCHEMY_DATABASE_URI']}")
else:  # 本地开发环境
    # 使用SQLite数据库
    base_dir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(base_dir, "app.db")}'

    print(f"Using SQLite database at: {app.config['SQLALCHEMY_DATABASE_URI']}")

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 数据库模型
class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    truss_data = db.Column(db.Text)  # 存储桁架结构数据
    created_at = db.Column(db.DateTime, server_default=db.func.now())

# Hugging Face API配置
HF_API_KEY = os.environ.get('HF_API_KEY')
# HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"
# HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-small"

headers = {"Authorization": f"Bearer {HF_API_KEY}"}


def query_huggingface(payload, max_retries=5):
    for attempt in range(max_retries):
        try:
            # 增加超时时间到60秒
            response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Attempt {attempt+1} failed: {e}")
            if attempt < max_retries - 1:
                # 等待时间指数增长
                wait_time = (2 ** attempt) * 10
                print(f"Waiting {wait_time} seconds before retrying...")
                time.sleep(wait_time)
            else:
                print("All retries failed.")
                return None

# 桁架生成函数 - 根据AI响应生成桁架数据
def generate_truss_data(description):
    # 这里简化处理，实际应用中可以使用更复杂的算法
    # 或者使用专门的桁架生成模型
    span = 18  # 默认跨度
    height = 3  # 默认高度
    
    # 从描述中提取数值
    import re
    span_match = re.search(r'(\d+)m跨度', description)
    height_match = re.search(r'(\d+)m高度', description)
    
    if span_match:
        span = int(span_match.group(1))
    if height_match:
        height = int(height_match.group(1))
    
    # 生成简单的平面桁架数据
    nodes = []
    elements = []
    
    # 根据跨度和高度生成节点
    num_segments = max(6, span // 3)  # 每3米一个段
    for i in range(num_segments + 1):
        x = i * span / num_segments
        nodes.append([x, 0, 0])  # 下弦节点
        nodes.append([x, height, 0])  # 上弦节点
    
    # 生成构件
    for i in range(num_segments):
        # 下弦杆
        elements.append([i*2, (i+1)*2])
        # 上弦杆
        elements.append([i*2+1, (i+1)*2+1])
        # 腹杆
        if i % 2 == 0:
            elements.append([i*2, i*2+1])
        else:
            elements.append([i*2+1, (i+1)*2])
    
    return {
        "nodes": nodes,
        "elements": elements,
        "span": span,
        "height": height
    }

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_id = data.get('user_id', 'default_user')
        message = data.get('message', '')

        print(f"Received message from user {user_id}: {message}")
        print(f"Hugging Face API Key: {HF_API_KEY is {'set' if HF_API_KEY else 'not set'}}")
        
        # 调用Hugging Face API
        hf_response = query_huggingface({
            "inputs": f"用户请求: {message}。请以桁架设计专家的身份回应，并确认跨度、高度等参数。",
            "parameters": {"return_full_text": False, "max_length": 200}
        })
        
        # 提取生成的文本
        if isinstance(hf_response, list) and len(hf_response) > 0:
            generated_text = hf_response[0].get('generated_text', '抱歉，我无法处理这个请求。')
        else:
            generated_text = "抱歉，AI服务暂时不可用。"
        
        # 生成桁架数据
        truss_data = generate_truss_data(message)
        
        # 保存到数据库
        conversation = Conversation(
            user_id=user_id,
            message=message,
            response=generated_text,
            truss_data=json.dumps(truss_data)
        )
        db.session.add(conversation)
        db.session.commit()
        
        return jsonify({
            "response": generated_text,
            "truss_data": truss_data
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/history/<user_id>', methods=['GET'])
def get_history(user_id):
    conversations = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.created_at.desc()).limit(10).all()
    
    history = []
    for conv in conversations:
        history.append({
            "message": conv.message,
            "response": conv.response,
            "truss_data": json.loads(conv.truss_data) if conv.truss_data else None,
            "created_at": conv.created_at.isoformat()
        })
    
    return jsonify(history)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    print("Testing Hugging Face API call...")

    # 等待几秒钟让模型加载（如果需要）
    time.sleep(10)

    output = query_huggingface({
        "inputs": "Hello, how are you?",
        "parameters": {"max_length": 50}
    })

    print(f"Hugging Face API response: {output}")

    app.run(debug=os.environ.get('DEBUG', False))
