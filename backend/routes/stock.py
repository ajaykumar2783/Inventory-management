from flask import Blueprint, request, jsonify
from models import db, Material, StockMovement

stock_bp = Blueprint("stock", __name__)


@stock_bp.route("/stock-movements", methods=["GET"])
def get_stock_movements():
    movements = StockMovement.query.order_by(StockMovement.created_at.desc()).all()
    return jsonify([m.to_dict() for m in movements])


@stock_bp.route("/stock-movements", methods=["POST"])
def add_stock_movement():
    data = request.get_json()

    material_id = data.get("material_id")
    movement_type = data.get("movement_type")
    quantity = float(data.get("quantity", 0))
    remarks = data.get("remarks", "")

    material = Material.query.get_or_404(material_id)

    previous_quantity = material.quantity

    if movement_type in ["IN", "RETURNED"]:
        new_quantity = previous_quantity + quantity
    elif movement_type in ["OUT", "DAMAGED"]:
        if quantity > previous_quantity:
            return jsonify({"message": "Not enough stock available"}), 400
        new_quantity = previous_quantity - quantity
    else:
        return jsonify({"message": "Invalid movement type"}), 400

    material.quantity = new_quantity

    movement = StockMovement(
        material_id=material.id,
        movement_type=movement_type,
        quantity=quantity,
        previous_quantity=previous_quantity,
        new_quantity=new_quantity,
        remarks=remarks
    )

    db.session.add(movement)
    db.session.commit()

    return jsonify({
        "message": "Stock movement saved successfully",
        "movement": movement.to_dict()
    }), 201