from datetime import datetime
from config import db, ma

class Delivery(db.Model):
    __tablename__ = "deliveries"
    id = db.Column(db.Integer, primary_key=True)
    # Date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    Date = db.Column(db.String(32))
    Company = db.Column(db.String(32))
    MyHouse = db.Column(db.String(32))

class DeliverySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Delivery
        sqla_session = db.session
        include_relationships = True
        load_instance = True