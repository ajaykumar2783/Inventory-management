@app.route('/api/dashboard', methods=['GET'])
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

    for m in materials:
        type_summary[m.material_type] = type_summary.get(m.material_type, 0) + 1
        material_names.append(m.material_name)
        material_quantities.append(m.quantity)
        material_values.append(round(m.quantity * m.unit_price, 2))

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
        "recent_movements": [mv.to_dict() for mv in movements]
    })