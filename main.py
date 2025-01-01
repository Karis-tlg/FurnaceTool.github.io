import os
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

app.run(debug=True, host="0.0.0.0", port=os.getenv("PORT", 8080))