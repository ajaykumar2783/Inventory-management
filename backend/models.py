from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Supplier(db.Model):
    __tablename__ = 'suppliers'

    id = db.Column(db.Integer, primary_key=True)
    supplier_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    materials = db.relationship('Material', backref='supplier_ref', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'supplier_name': self.supplier_name,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }
class Material(db.Model):
    __tablename__ = 'materials'

    id = db.Column(db.Integer, primary_key=True)
    material_name = db.Column(db.String(100), nullable=False)
    material_type = db.Column(db.String(50), nullable=False)
    unit = db.Column(db.String(30), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=0)
    min_stock = db.Column(db.Float, nullable=False, default=0)
    unit_price = db.Column(db.Float, nullable=False, default=0)
    remarks = db.Column(db.String(200))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    stock_movements = db.relationship('StockMovement', backref='material_ref', lazy=True)
    def stock_status(self):
        if self.quantity <= 0:
            return 'Out of Stock'
        if self.quantity <= self.min_stock:
            return 'Low Stock'
        return 'In Stock'

    def total_value(self):
        return round(self.quantity * self.unit_price, 2)
    def to_dict(self):
        return {
            'id': self.id,
            'material_name': self.material_name,
            'material_type': self.material_type,
            'unit': self.unit,
            'quantity': self.quantity,
            'min_stock': self.min_stock,
            'unit_price': self.unit_price,
            'remarks': self.remarks,
            'supplier_id': self.supplier_id,
            'supplier_name': self.supplier_ref.supplier_name if self.supplier_ref else '',
            'stock_status': self.stock_status(),
            'total_value': self.total_value(),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }
class StockMovement(db.Model):
    __tablename__ = 'stock_movements'

    id = db.Column(db.Integer, primary_key=True)
    material_id = db.Column(db.Integer, db.ForeignKey('materials.id'), nullable=False)
    movement_type = db.Column(db.String(30), nullable=False)  # IN / OUT / DAMAGED / RETURNED
    quantity = db.Column(db.Float, nullable=False)
    previous_quantity = db.Column(db.Float, nullable=False)
    new_quantity = db.Column(db.Float, nullable=False)
    remarks = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    def to_dict(self):
        return {
            'id': self.id,
            'material_id': self.material_id,
            'material_name': self.material_ref.material_name if self.material_ref else '',
            'movement_type': self.movement_type,
            'quantity': self.quantity,
            'previous_quantity': self.previous_quantity,
            'new_quantity': self.new_quantity,
            'remarks': self.remarks,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }
        
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), nullable=False, default="user")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role
        }