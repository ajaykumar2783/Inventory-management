from flask import Blueprint, request, jsonify
from models import db, Material

materials_bp = Blueprint("materials", __name__)


@materials_bp.route("/materials", methods=["GET"])
def get_materials():
    materials = Material.query.order_by(Material.id.desc()).all()
    return jsonify([m.to_dict() for m in materials])


@materials_bp.route("/materials/<int:id>", methods=["GET"])
def get_material(id):
    material = Material.query.get_or_404(id)
    return jsonify(material.to_dict())


@materials_bp.route("/materials", methods=["POST"])
def add_material():
    data = request.get_json()

    material = Material(
        material_name=data.get("material_name"),
        material_type=data.get("material_type"),
        unit=data.get("unit"),
        quantity=float(data.get("quantity", 0)),
        min_stock=float(data.get("min_stock", 0)),
        unit_price=float(data.get("unit_price", 0)),
        supplier_id=data.get("supplier_id"),
        remarks=data.get("remarks", "")
    )

    db.session.add(material)
    db.session.commit()

    return jsonify({
        "message": "Material added successfully",
        "material": material.to_dict()
    }), 201


@materials_bp.route("/materials/<int:id>", methods=["PUT"])
def update_material(id):
    material = Material.query.get_or_404(id)
    data = request.get_json()

    material.material_name = data.get("material_name", material.material_name)
    material.material_type = data.get("material_type", material.material_type)
    material.unit = data.get("unit", material.unit)
    material.quantity = float(data.get("quantity", material.quantity))
    material.min_stock = float(data.get("min_stock", material.min_stock))
    material.unit_price = float(data.get("unit_price", material.unit_price))
    material.supplier_id = data.get("supplier_id", material.supplier_id)
    material.remarks = data.get("remarks", material.remarks)

    db.session.commit()

    return jsonify({
        "message": "Material updated successfully",
        "material": material.to_dict()
    })


@materials_bp.route("/materials/<int:id>", methods=["DELETE"])
def delete_material(id):
    material = Material.query.get_or_404(id)

    db.session.delete(material)
    db.session.commit()

    return jsonify({"message": "Material deleted successfully"})