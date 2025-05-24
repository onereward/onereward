from flask import Flask, send_file, jsonify
import qrcode
import io
from datetime import datetime
import base64

app = Flask(__name__)

@app.route('/')
def home():
    return "QR Code Generator - Visit /generate_qr to create a QR code with current timestamp."

@app.route('/generate_qr', methods=['GET'])
def generate_qr():
    try:
        timestamp = datetime.utcnow().isoformat()

        qr = qrcode.make(f"User QR @ {timestamp}")
        buffer = io.BytesIO()
        qr.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return jsonify({
            "success": True,
            "qr_base64": img_base64
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
