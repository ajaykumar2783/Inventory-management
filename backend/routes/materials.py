from flask import Blueprint, request, jsonify
from models import db, Material, StockMovement

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


@materials_bp.route("/dashboard", methods=["GET"])
def dashboard_data():
    materials = Material.query.all()
    movements = StockMovement.query.order_by(StockMovement.created_at.desc()).limit(8).all()

    total_materials = len(materials)
    low_stock_count = sum(1 for m in materials if m.quantity <= m.min_stock and m.quantity > 0)
    out_of_stock_count = sum(1 for m in materials if m.quantity <= 0)
    in_stock_count = sum(1 for m in materials if m.quantity > m.min_stock)
    total_stock_value = round(sum(m.quantity * m.unit_price for m in materials), 2)

    type_summary = {}
    material_names = []
    material_quantities = []
    material_values = []
    material_ids = []

    for m in materials:
        type_summary[m.material_type] = type_summary.get(m.material_type, 0) + 1
        material_names.append(m.material_name)
        material_quantities.append(m.quantity)
        material_values.append(round(m.quantity * m.unit_price, 2))
        material_ids.append(m.id)

    stock_status_summary = {
        "In Stock": in_stock_count,
        "Low Stock": low_stock_count,
        "Out of Stock": out_of_stock_count
    }

    return jsonify({
        "total_materials": total_materials,
        "in_stock_count": in_stock_count,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "total_stock_value": total_stock_value,
        "type_summary": type_summary,
        "stock_status_summary": stock_status_summary,
        "material_names": material_names,
        "material_quantities": material_quantities,
        "material_values": material_values,
        "material_ids": material_ids,
        "recent_movements": [mv.to_dict() for mv in movements]
    })