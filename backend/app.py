import os
import re
import uuid
import sqlite3
import smtplib
import mimetypes

from datetime import datetime, timezone
from pathlib import Path
from contextlib import closing
from email.message import EmailMessage

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename


# =========================================================
# CONFIGURATION
# =========================================================

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "database" / "swacch_connect.db"
UPLOAD_DIR = ROOT / "backend" / "private_uploads"

load_dotenv(ROOT / "backend" / ".env")

app = Flask(__name__)

app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024

origins = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:5173,http://localhost:5174,"
    "http://localhost:5175,http://127.0.0.1:5173,"
    "http://127.0.0.1:5174,http://127.0.0.1:5175"
).split(",")

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [origin.strip() for origin in origins]
        }
    }
)

MAX_IMAGE_SIZE = 5 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp"
}


# =========================================================
# COMPLAINT CATEGORIES
# =========================================================

CATEGORY_OPTIONS = {
    "Garbage & Waste": [
        "Garbage dumps",
        "Overflowing bins",
        "Plastic waste",
        "Illegal dumping",
    ],
    "Roads & Infrastructure": [
        "Potholes",
        "Damaged roads",
        "Broken footpaths",
    ],
    "Drainage & Sewage": [
        "Blocked drains",
        "Overflowing sewage",
        "Waterlogging",
        "Open manholes",
    ],
    "Water Supply": [
        "Water leakage",
        "Contaminated water",
        "Irregular water supply",
    ],
    "Streetlights & Electricity": [
        "Non-working streetlights",
        "Damaged electric poles",
        "Exposed wires",
    ],
    "Public Sanitation": [
        "Dirty public toilets",
        "Unhygienic public spaces",
    ],
    "Environmental Issues": [
        "Air pollution",
        "Noise pollution",
        "Tree damage",
        "Open burning",
    ],
    "Public Property": [
        "Damaged benches",
        "Damaged bus stops",
        "Damaged parks",
        "Damaged public facilities",
    ],
    "Animal-related Issues": [
        "Stray animal concerns",
        "Animal waste",
    ],
    "Other Civic Issues": [
        "Other civic problem",
    ],
}

STATUSES = {
    "Received",
    "In Progress",
    "Resolved",
    "Rejected",
}


# =========================================================
# DATABASE
# =========================================================

def connect_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    return conn


def initialize_db():
    with closing(connect_db()) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS complaints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reference_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                location TEXT NOT NULL,
                priority TEXT NOT NULL DEFAULT 'Normal',
                status TEXT NOT NULL DEFAULT 'Received',
                created_at TEXT NOT NULL,
                email TEXT,
                mobile TEXT,
                subcategory TEXT,
                state TEXT,
                city TEXT,
                area TEXT,
                street TEXT,
                landmark TEXT,
                latitude REAL,
                longitude REAL,
                consent INTEGER NOT NULL DEFAULT 0,
                evidence_path TEXT
            )
        """)

        existing = {
            row["name"]
            for row in conn.execute(
                "PRAGMA table_info(complaints)"
            ).fetchall()
        }

        new_columns = {
            "email": "TEXT",
            "mobile": "TEXT",
            "subcategory": "TEXT",
            "state": "TEXT",
            "city": "TEXT",
            "area": "TEXT",
            "street": "TEXT",
            "landmark": "TEXT",
            "latitude": "REAL",
            "longitude": "REAL",
            "consent": "INTEGER NOT NULL DEFAULT 0",
            "evidence_path": "TEXT",
        }

        for column, definition in new_columns.items():
            if column not in existing:
                conn.execute(
                    f"ALTER TABLE complaints ADD COLUMN "
                    f"{column} {definition}"
                )

        conn.commit()

        conn.commit()

    app.logger.info("Database initialized successfully.")


# =========================================================
# HELPERS
# =========================================================

def current_time():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def clean_text(value):
    if value is None:
        return ""
    return str(value).strip()


def generate_reference_id():
    date_part = datetime.now().strftime("%Y%m%d")
    random_part = uuid.uuid4().hex[:8].upper()

    return f"SWC-{date_part}-{random_part}"


def serialize_complaint(row):
    return {
        "reference_id": row["reference_id"],
        "category": row["category"],
        "subcategory": row["subcategory"],
        "description": row["description"],
        "location": row["location"],
        "priority": row["priority"],
        "status": row["status"],
        "created_at": row["created_at"],
    }


def error_response(message, status_code=400):
    return jsonify({
        "success": False,
        "error": message,
    }), status_code


# =========================================================
# EMAIL NOTIFICATION
# =========================================================

def send_email_notification(subject, body, attachment_path=None):
    sender = os.getenv("MAIL_USERNAME")
    password = os.getenv("MAIL_PASSWORD")
    recipient = os.getenv("MAIL_RECEIVER")

    if not all([sender, password, recipient]):
        app.logger.error("Email configuration is incomplete.")
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender
    message["To"] = recipient
    message.set_content(body)

    if attachment_path:
        try:
            path = Path(attachment_path)

            if path.is_file():
                mime_type = mimetypes.guess_type(path.name)[0]

                if mime_type:
                    main_type, sub_type = mime_type.split("/", 1)

                    with path.open("rb") as file:
                        message.add_attachment(
                            file.read(),
                            maintype=main_type,
                            subtype=sub_type,
                            filename=path.name,
                        )

        except (OSError, ValueError):
            app.logger.exception("Photo attachment failed.")

    try:
        with smtplib.SMTP_SSL(
            "smtp.gmail.com",
            465,
            timeout=20
        ) as server:
            server.login(sender, password)
            server.send_message(message)

        app.logger.info("Email notification sent successfully.")
        return True

    except Exception:
        app.logger.exception("Email notification failed.")
        return False


# =========================================================
# PHOTO VALIDATION AND STORAGE
# =========================================================

def valid_image_signature(data, extension):
    if extension in {".jpg", ".jpeg"}:
        return data.startswith(b"\xff\xd8\xff")

    if extension == ".png":
        return data.startswith(b"\x89PNG\r\n\x1a\n")

    if extension == ".webp":
        return (
            len(data) >= 12
            and data[:4] == b"RIFF"
            and data[8:12] == b"WEBP"
        )

    return False


def save_evidence(file):
    if not file or not file.filename:
        return None

    filename = secure_filename(file.filename)
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        )

    data = file.read(MAX_IMAGE_SIZE + 1)

    if not data:
        raise ValueError("Uploaded image is empty.")

    if len(data) > MAX_IMAGE_SIZE:
        raise ValueError("Image size cannot exceed 5 MB.")

    if not valid_image_signature(data, extension):
        raise ValueError("Uploaded file is not a valid image.")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    destination = UPLOAD_DIR / (
        uuid.uuid4().hex + extension
    )

    with destination.open("xb") as output:
        output.write(data)

    return destination


# =========================================================
# VALIDATION
# =========================================================

def validate_complaint(data):
    fields = [
        "name",
        "email",
        "mobile",
        "category",
        "subcategory",
        "state",
        "city",
        "area",
        "street",
        "landmark",
        "description",
    ]

    values = {
        field: clean_text(data.get(field))
        for field in fields
    }

    for field in fields:
        if not values[field]:
            raise ValueError(
                f"{field.replace('_', ' ').title()} is required."
            )

    if not 2 <= len(values["name"]) <= 100:
        raise ValueError("Name must contain 2 to 100 characters.")

    if not re.fullmatch(
        r"[^@\s]+@[^@\s]+\.[^@\s]+",
        values["email"]
    ):
        raise ValueError("Enter a valid email address.")

    mobile = re.sub(r"[\s-]", "", values["mobile"])

    if mobile.startswith("+91"):
        mobile = mobile[3:]
    elif mobile.startswith("91") and len(mobile) == 12:
        mobile = mobile[2:]

    if not re.fullmatch(r"[6-9]\d{9}", mobile):
        raise ValueError("Enter a valid 10-digit Indian mobile number.")

    values["mobile"] = mobile

    category = values["category"]
    subcategory = values["subcategory"]

    if category not in CATEGORY_OPTIONS:
        raise ValueError("Select a valid complaint category.")

    if subcategory not in CATEGORY_OPTIONS[category]:
        raise ValueError("Select a valid problem subcategory.")

    if not 10 <= len(values["description"]) <= 3000:
        raise ValueError(
            "Description must contain 10 to 3000 characters."
        )

    consent = clean_text(data.get("consent")).lower()

    if consent not in {"true", "1", "yes", "on"}:
        raise ValueError("Consent declaration is required.")

    try:
        latitude = float(data.get("latitude"))
        longitude = float(data.get("longitude"))
    except (TypeError, ValueError):
        raise ValueError("Valid GPS coordinates are required.")

    if not -90 <= latitude <= 90:
        raise ValueError("Invalid latitude.")

    if not -180 <= longitude <= 180:
        raise ValueError("Invalid longitude.")

    values["latitude"] = latitude
    values["longitude"] = longitude

    address = [
        values["area"],
        values["street"],
        values["landmark"],
        values["city"],
        values["state"],
    ]

    values["location"] = ", ".join(address)
    values["location"] += f" | GPS: {latitude}, {longitude}"

    return values


# =========================================================
# BASIC API ROUTES
# =========================================================

@app.get("/")
def home():
    return jsonify({
        "name": "SWACCH CONNECT API",
        "tagline": "Report • Track • Clean • Together",
        "status": "running",
    })


@app.get("/api/health")
def health():
    try:
        with closing(connect_db()) as conn:
            conn.execute("SELECT 1")

        return jsonify({
            "success": True,
            "status": "healthy",
            "database": "connected",
        })

    except sqlite3.Error:
        app.logger.exception("Health check failed.")
        return error_response("Database unavailable.", 500)


# =========================================================
# SUBMIT COMPLAINT
# =========================================================

@app.post("/api/complaints")
def create_complaint():
    data = request.form

    if not data:
        return error_response(
            "Complaint details are required."
        )

    evidence_path = None

    try:
        complaint = validate_complaint(data)

        evidence_file = request.files.get("evidence")

        if evidence_file and evidence_file.filename:
            evidence_path = save_evidence(evidence_file)

        reference_id = generate_reference_id()
        created_at = current_time()

        with closing(connect_db()) as conn:
            conn.execute("""
                INSERT INTO complaints (
                    reference_id,
                    name,
                    category,
                    description,
                    location,
                    priority,
                    status,
                    created_at,
                    email,
                    mobile,
                    subcategory,
                    state,
                    city,
                    area,
                    street,
                    landmark,
                    latitude,
                    longitude,
                    consent,
                    evidence_path
                )
                VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            """, (
                reference_id,
                complaint["name"],
                complaint["category"],
                complaint["description"],
                complaint["location"],
                "Normal",
                "Received",
                created_at,
                complaint["email"],
                complaint["mobile"],
                complaint["subcategory"],
                complaint["state"],
                complaint["city"],
                complaint["area"],
                complaint["street"],
                complaint["landmark"],
                complaint["latitude"],
                complaint["longitude"],
                1,
                str(evidence_path) if evidence_path else None,
            ))

            conn.commit()

        email_body = f"""
SWACCH CONNECT - NEW CIVIC COMPLAINT

REFERENCE ID: {reference_id}

CITIZEN DETAILS
Name: {complaint['name']}
Email: {complaint['email']}
Mobile: {complaint['mobile']}

COMPLAINT DETAILS
Category: {complaint['category']}
Subcategory: {complaint['subcategory']}

LOCATION
State: {complaint['state']}
City: {complaint['city']}
Area: {complaint['area']}
Street: {complaint['street']}
Landmark: {complaint['landmark']}

GPS
Latitude: {complaint['latitude']}
Longitude: {complaint['longitude']}

DESCRIPTION
{complaint['description']}

SUBMITTED: {created_at}
STATUS: Received

SWACCH CONNECT
Report • Track • Clean • Together
"""

        email_sent = send_email_notification(
            subject=f"New Complaint - {reference_id}",
            body=email_body,
            attachment_path=evidence_path,
        )

        return jsonify({
            "success": True,
            "message": "Complaint submitted successfully.",
            "reference_id": reference_id,
            "status": "Received",
            "created_at": created_at,
            "email_notification": (
                "sent" if email_sent else "not_sent"
            ),
        }), 201

    except ValueError as error:
        if evidence_path and evidence_path.exists():
            evidence_path.unlink(missing_ok=True)

        return error_response(str(error))

    except sqlite3.Error:
        if evidence_path and evidence_path.exists():
            evidence_path.unlink(missing_ok=True)

        app.logger.exception("Complaint database error.")

        return error_response(
            "Unable to save complaint. Please try again.",
            500,
        )

    except OSError:
        if evidence_path and evidence_path.exists():
            evidence_path.unlink(missing_ok=True)

        app.logger.exception("Complaint file storage error.")

        return error_response(
            "Unable to process the uploaded image.",
            500,
        )


# =========================================================
# PUBLIC COMPLAINT LIST
# =========================================================

@app.get("/api/complaints")
def list_complaints():
    try:
        with closing(connect_db()) as conn:
            rows = conn.execute("""
                SELECT
                    reference_id,
                    category,
                    subcategory,
                    description,
                    location,
                    priority,
                    status,
                    created_at
                FROM complaints
                ORDER BY id DESC
                LIMIT 200
            """).fetchall()

        return jsonify({
            "success": True,
            "complaints": [
                serialize_complaint(row)
                for row in rows
            ],
        })

    except sqlite3.Error:
        app.logger.exception("Complaint listing failed.")

        return error_response(
            "Unable to retrieve complaints.",
            500,
        )


# =========================================================
# TRACK COMPLAINT
# =========================================================

@app.get("/api/complaints/<reference_id>")
def track_complaint(reference_id):
    reference_id = reference_id.upper()

    if not re.fullmatch(
        r"SWC-\d{8}-[A-F0-9]{8}",
        reference_id
    ):
        return error_response(
            "Enter a valid complaint reference number."
        )

    try:
        with closing(connect_db()) as conn:
            row = conn.execute("""
                SELECT
                    reference_id,
                    category,
                    subcategory,
                    description,
                    location,
                    priority,
                    status,
                    created_at
                FROM complaints
                WHERE reference_id = ?
            """, (reference_id,)).fetchone()

        if row is None:
            return error_response(
                "Complaint not found.",
                404,
            )

        return jsonify({
            "success": True,
            "complaint": serialize_complaint(row),
        })

    except sqlite3.Error:
        app.logger.exception("Complaint tracking failed.")

        return error_response(
            "Unable to track complaint.",
            500,
        )


# =========================================================
# ERROR HANDLERS
# =========================================================

@app.errorhandler(413)
def file_too_large(error):
    return error_response(
        "Upload too large. Maximum image size is 5 MB.",
        413,
    )


@app.errorhandler(404)
def not_found(error):
    return error_response(
        "API endpoint not found.",
        404,
    )


# =========================================================
# STARTUP
# =========================================================

initialize_db()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False,
    )
