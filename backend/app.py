
from models import db, Material, Supplier, StockMovement
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///inventory.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()

    if Supplier.query.count() == 0:
        s1 = Supplier(supplier_name='ABC Papers', phone='9876543210', email='abc@example.com', address='Bengaluru')
        s2 = Supplier(supplier_name='Color Ink Traders', phone='9988776655', email='ink@example.com', address='Chikkaballapur')
        db.session.add_all([s1, s2])
        db.session.commit()
    if Material.query.count() == 0:
        suppliers = Supplier.query.all()
        sample = [
            Material(material_name='A4 Inner Pages', material_type='Inner Pages', unit='ream', quantity=50, min_stock=10, unit_price=250, remarks='White paper', supplier_id=suppliers[0].id),
            Material(material_name='Glossy Outer Cover', material_type='Outer Pages', unit='bundle', quantity=8, min_stock=10, unit_price=500, remarks='For notebooks', supplier_id=suppliers[0].id),
            Material(material_name='Black Ink', material_type='Ink', unit='litre', quantity=20, min_stock=5, unit_price=900, remarks='Offset print', supplier_id=suppliers[1].id),
            Material(material_name='Binding Gum', material_type='Shared Material', unit='kg', quantity=0, min_stock=3, unit_price=300, remarks='Shared usage', supplier_id=suppliers[1].id),
        ]
        db.session.add_all(sample)
        db.session.commit()
@app.route('/')
def home():
    return jsonify({'message': 'Inventory API Running'})
@app.route('/api/dashboard', methods=['GET'])

def dashboard_data():
    materials = Material.query.all()
    movements = StockMovement.query.order_by(StockMovement.created_at.desc()).limit(8).all()

    total_materials = len(materials)
    low_stock_count = 0
    out_of_stock_count = 0
    in_stock_count = 0
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

        "recent_movements": [mv.to_dict() for mv in movements]
    })
@app.route('/api/materials', methods=['GET'])
def get_materials():
    search = request.args.get('search', '').strip()
    material_type = request.args.get('material_type', '').strip()

    query = Material.query

    if search:
        query = query.filter(Material.material_name.ilike(f'%{search}%'))
    if material_type:
        query = query.filter(Material.material_type == material_type)

    materials = query.order_by(Material.id.desc()).all()
    return jsonify([m.to_dict() for m in materials])

@app.route('/api/materials/<int:material_id>', methods=['GET'])
def get_material(material_id):
    material = Material.query.get_or_404(material_id)
    return jsonify(material.to_dict())

@app.route('/api/materials', methods=['POST'])
def add_material():
    data = request.get_json()

    material = Material(
        material_name=data.get('material_name'),
        material_type=data.get('material_type'),
        unit=data.get('unit'),
        quantity=float(data.get('quantity', 0)),
        min_stock=float(data.get('min_stock', 0)),
        unit_price=float(data.get('unit_price', 0)),
        remarks=data.get('remarks', ''),
        supplier_id=data.get('supplier_id')
    )
    db.session.add(material)
    db.session.commit()
    return jsonify({'message': 'Material added successfully', 'material': material.to_dict()}), 201
@app.route('/api/materials/<int:material_id>', methods=['PUT'])
def update_material(material_id):
    material = Material.query.get_or_404(material_id)
    data = request.get_json()

    material.material_name = data.get('material_name', material.material_name)
    material.material_type = data.get('material_type', material.material_type)
    material.unit = data.get('unit', material.unit)
    material.quantity = float(data.get('quantity', material.quantity))
    material.min_stock = float(data.get('min_stock', material.min_stock))
    material.unit_price = float(data.get('unit_price', material.unit_price))
    material.remarks = data.get('remarks', material.remarks)
    material.supplier_id = data.get('supplier_id', material.supplier_id)

    db.session.commit()
    return jsonify({'message': 'Material updated successfully', 'material': material.to_dict()})
@app.route('/api/materials/<int:material_id>', methods=['DELETE'])
def delete_material(material_id):
    material = Material.query.get_or_404(material_id)
    db.session.delete(material)
    db.session.commit()
    return jsonify({'message': 'Material deleted successfully'})


@app.route('/api/suppliers', methods=['GET'])
def get_suppliers():
    suppliers = Supplier.query.order_by(Supplier.id.desc()).all()
    return jsonify([s.to_dict() for s in suppliers])
@app.route('/api/suppliers', methods=['POST'])
def add_supplier():
    data = request.get_json()

    supplier = Supplier(
        supplier_name=data.get('supplier_name'),
        phone=data.get('phone', ''),
        email=data.get('email', ''),
        address=data.get('address', '')
    )
    db.session.add(supplier)
    db.session.commit()
    return jsonify({'message': 'Supplier added successfully', 'supplier': supplier.to_dict()}), 201
@app.route('/api/stock-movements', methods=['GET'])
def get_stock_movements():
    movements = StockMovement.query.order_by(StockMovement.created_at.desc()).all()
    return jsonify([m.to_dict() for m in movements])

@app.route('/api/stock-movements', methods=['POST'])
def create_stock_movement():
    data = request.get_json()
    material_id = data.get('material_id')
    movement_type = data.get('movement_type')
    quantity = float(data.get('quantity', 0))
    remarks = data.get('remarks', '')

    material = Material.query.get_or_404(material_id)
    previous_quantity = material.quantity

    if movement_type in ['IN', 'RETURNED']:
        new_quantity = previous_quantity + quantity
    elif movement_type in ['OUT', 'DAMAGED']:
        if quantity > previous_quantity:
            return jsonify({'message': 'Not enough stock available'}), 400
        new_quantity = previous_quantity - quantity
    else:
        return jsonify({'message': 'Invalid movement type'}), 400

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

    return jsonify({'message': 'Stock movement recorded successfully', 'movement': movement.to_dict()})
@app.route('/api/low-stock', methods=['GET'])
def get_low_stock():
    materials = Material.query.all()
    low_stock = [m.to_dict() for m in materials if m.quantity <= m.min_stock]
    return jsonify(low_stock)


if __name__ == '__main__':
    app.run(debug=True)