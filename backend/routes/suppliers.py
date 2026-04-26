from flask import Blueprint, request, jsonify
from models import db, Supplier

suppliers_bp = Blueprint("suppliers", __name__)


@suppliers_bp.route("/suppliers", methods=["GET"])
def get_suppliers():
    suppliers = Supplier.query.order_by(Supplier.id.desc()).all()
    return jsonify([s.to_dict() for s in suppliers])


@suppliers_bp.route("/suppliers", methods=["POST"])
def add_supplier():
    data = request.get_json()

    supplier = Supplier(
        supplier_name=data.get("supplier_name"),
        phone=data.get("phone", ""),
        email=data.get("email", ""),
        address=data.get("address", "")
    )

    db.session.add(supplier)
    db.session.commit()

    return jsonify({
        "message": "Supplier added successfully",
        "supplier": supplier.to_dict()
    }), 201


@suppliers_bp.route("/suppliers/<int:id>", methods=["PUT"])
def update_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    data = request.get_json()

    supplier.supplier_name = data.get("supplier_name", supplier.supplier_name)
    supplier.phone = data.get("phone", supplier.phone)
    supplier.email = data.get("email", supplier.email)
    supplier.address = data.get("address", supplier.address)

    db.session.commit()

    return jsonify({
        "message": "Supplier updated successfully",
        "supplier": supplier.to_dict()
    })


@suppliers_bp.route("/suppliers/<int:id>", methods=["DELETE"])
def delete_supplier(id):
    supplier = Supplier.query.get_or_404(id)

    db.session.delete(supplier)
    db.session.commit()

    return jsonify({"message": "Supplier deleted successfully"})