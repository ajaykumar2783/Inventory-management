from flask import Blueprint, jsonify
from models import Material, StockMovement

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/dashboard", methods=["GET"])
def dashboard():
    materials = Material.query.all()
    movements = StockMovement.query.order_by(StockMovement.created_at.desc()).limit(8).all()

    total_materials = len(materials)
    in_stock_count = 0
    low_stock_count = 0
    out_of_stock_count = 0
    total_stock_value = 0

    type_summary = {}
    material_names = []
    material_quantities = []
    material_values = []

    for m in materials:
        total_stock_value += m.quantity * m.unit_price

        type_summary[m.material_type] = type_summary.get(m.material_type, 0) + 1

        material_names.append(m.material_name)
        material_quantities.append(m.quantity)
        material_values.append(round(m.quantity * m.unit_price, 2))

        if m.quantity <= 0:
            out_of_stock_count += 1
        elif m.quantity <= m.min_stock:
            low_stock_count += 1
        else:
            in_stock_count += 1

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
        "total_stock_value": round(total_stock_value, 2),
        "type_summary": type_summary,
        "stock_status_summary": stock_status_summary,
        "material_names": material_names,
        "material_quantities": material_quantities,
        "material_values": material_values,
        "recent_movements": [m.to_dict() for m in movements]
    })


@reports_bp.route("/low-stock", methods=["GET"])
def low_stock():
    materials = Material.query.all()
    low_stock_items = [m.to_dict() for m in materials if m.quantity <= m.min_stock]
    return jsonify(low_stock_items)