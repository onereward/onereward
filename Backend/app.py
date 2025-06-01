from flask import Flask, send_file, jsonify
import qrcode
import io
from datetime import datetime
import base64

app = Flask(__name__)

@app.route('/')
def home():
    return "QR Code Generator - Visit /generate_qr to create a QR code with current timestamp."

@app.route('/generate_qr', methods=['GET', 'POST'])
def generate_qr():
    try:
        from flask import request

        # Get user email from request (for POST) or generate generic QR (for GET)
        if request.method == 'POST':
            data = request.get_json()
            user_email = data.get('email', '')
            qr_content = user_email
        else:
            timestamp = datetime.utcnow().isoformat()
            qr_content = f"User QR @ {timestamp}"

        qr = qrcode.make(qr_content)
        buffer = io.BytesIO()
        qr.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return jsonify({
            "success": True,
            "qr_base64": img_base64,
            "qr_content": qr_content
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
