import requests
from datetime import datetime

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from tortoise import timezone
from tortoise import fields
from tortoise.models import Model
from tortoise.contrib.fastapi import register_tortoise, HTTPNotFoundError
from tortoise.contrib.pydantic import pydantic_model_creator

app = FastAPI(title="2020-2021 Covid-19 Neighborhood Deliveries")

class Deliveries(Model):
    """
    This represents a neighborhood delivery truck event
    """
    oid = fields.IntField(pk=True, source_field="id")
    Company = fields.CharField(15)
    MyHouse = fields.CharField(3)
    created_at = fields.DatetimeField()

Deliveries_Pydantic = pydantic_model_creator(Deliveries, name="Deliveries")
DeliveriesIn_Pydantic = pydantic_model_creator(Deliveries, name="DeliveriesIn", exclude_readonly=True)

@app.get("/")
def index():
    return {"key": "value"}

@app.get("/deliveries")
async def get_deliveries():
    """ Get all neighborhood deliveries """
    print(Deliveries.all().sql())
    return await Deliveries_Pydantic.from_queryset(Deliveries.all())

@app.get("/deliveries/{delivery_id}")
async def get_delivery(delivery_id: int):
    """ Get a single neighborhood delivery by its ID """
    return await Deliveries_Pydantic.from_queryset_single(Deliveries.get(oid=delivery_id))

@app.post("/deliveries")
async def create_delivery(delivery: DeliveriesIn_Pydantic):
    """ Add a neighborhood delivery """
    delivery_obj = await Deliveries.create(**delivery.dict(exclude_unset=True))
    return await Deliveries_Pydantic.from_tortoise_orm(delivery_obj)

@app.delete("/deliveries/{delivery_id}")
async def delete_delivery(delivery_id: int):
    """ Delete a neighborhood delivery """
    deleted_count = await Deliveries.filter(oid=delivery_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail=f"Delivery {delivery_id} not found")
    return f"Deleted delivery {delivery_id}"

register_tortoise(app, 
                    db_url="sqlite://deliveries.sqlite", 
                    modules={"models": ["main_fastapi"]},
                    generate_schemas=True,
                    add_exception_handlers=True)

''' Fix prod db
alter table deliveries add created_at TEXT
update deliveries
set created_at = (select Date from deliveries)
'''
