from datetime import datetime
from flask import make_response, abort
from config import db
from models import (
    Delivery,
    DeliverySchema,
)

def get_timestamp():
    return datetime.now().strftime(("%Y-%m-%d %H:%M:%S"))
    

def read_all():
    """
    This function responds to a request for /api/DELIVERIES
    with the complete list of DELIVERIES
    
    :return:        sorted list of DELIVERIES     
    """
    deliveries = Delivery.query.order_by(Delivery.created_at.desc()).all()
    delivery_schema = DeliverySchema(many=True)
    return delivery_schema.dump(deliveries)

def read_one(id):
    """
    This function responds to a request for /api/DELIVERIES/{id}
    with one matching delivery with that id.

    :param id:   ID of the company to find
    :returns:       the delivery with that ID
    """
    delivery = Delivery.query.filter(Delivery.id == id).one_or_none()

    if delivery is not None:
        delivery_schema = DeliverySchema()
        return delivery_schema.dump(delivery).data
    else:
        abort(
            404, f"Delivery with ID '{id}' could not be found"
        )
    return delivery

def create(delivery):
    """
    This function creates a new delivery in the DELIVERIES list
    based on the data

    :param: delivery
    :return: 201 on success
    """

    date = delivery.get("created_at", None)
    if not date:
        date = get_timestamp()
    company = delivery.get("Company", None)
    is_myhouse = delivery.get("MyHouse", None)

    print("Here is the date print:", date)

    try:
        schema = DeliverySchema()
        new_delivery = schema.load(delivery, session=db.session)
        print(new_delivery)
        # Add the delivery to the db
        db.session.add(new_delivery)
        db.session.commit()

        # serialize the new delivery in the response
        return schema.dump(new_delivery), 201

    except Exception as ex:
        abort(
            409,
            f"Error adding delivery {ex}"
        )
        print(ex)

def update(id, delivery):
    """
    This function updates a delivery in the deliveries list

    :param id:      ID of the row
    :param Company: Name of the company
    :param MyHouse: Did it come to my house?
    :param Date:    Date of the delivery
    :return:        Update delivery in the deliveries list
    """
    update_delivery = Delivery.query.filter( Delivery.id == int(id)).one_or_none()
    delivery_id = delivery.get("id")
       
    existing_delivery = Delivery.query.filter(Delivery.id == int(id)).one_or_none()
    if update_delivery is None:
        abort(
            404, f"Delivery with id ({id}) not found"
        )
    elif (existing_delivery is not None and existing_delivery.id != delivery_id):
        abort(
            409, f"Delivery with id ({delivery_id}) exists already"
        )
    else:
        schema = DeliverySchema()
        update = schema.load(delivery, session=db.session)
        update.id = update_delivery.id

        db.session.merge(update)
        db.session.commit()

        # return updated delivery in the response
        data = schema.dump(update_delivery)
        return data, 200

def delete(id):
    """
    This function deletes a delivery from the DELIVERIES list
    :param id:   ID of delivery in DELIVERIES list
    :return:        200 on successful delete, 404 if not found
    """

    # Get the delivery requested
    delivery = Delivery.query.filter(Delivery.id == id).one_or_none()

    # Did we find a person?
    if delivery is not None:
        db.session.delete(delivery)
        db.session.commit()
        return make_response(
            f"Delivery {id} deleted", 200
        )

    # Otherwise, nope, didn't find that person
    else:
        abort(
            404,
            f"Delivery not found for Id: {id}"
        )