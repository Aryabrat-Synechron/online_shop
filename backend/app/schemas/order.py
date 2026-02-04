from pydantic import BaseModel
from typing import List

class OrderItemOut(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class OrderOut(BaseModel):
    id: int
    total_amount: float
    items: List[OrderItemOut]