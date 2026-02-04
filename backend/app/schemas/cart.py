from pydantic import BaseModel, Field
from typing import List

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)

class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)

class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float

class CartOut(BaseModel):
    id: int
    status: str
    items: List[CartItemOut]
    total: float