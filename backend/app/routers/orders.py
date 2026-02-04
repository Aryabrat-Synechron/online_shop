from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.order import Order
from app.schemas.order import OrderOut, OrderItemOut
from app.routers.deps import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.id.desc()).all()
    out = []
    for o in orders:
        items = [OrderItemOut(product_id=oi.product_id, quantity=oi.quantity, unit_price=float(oi.unit_price)) for oi in o.items]
        out.append(OrderOut(id=o.id, total_amount=float(o.total_amount), items=items))
    return out

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    o = db.query(Order).get(order_id)
    if not o or o.user_id != user.id:
        raise HTTPException(404, "Order not found")
    items = [OrderItemOut(product_id=oi.product_id, quantity=oi.quantity, unit_price=float(oi.unit_price)) for oi in o.items]
    return OrderOut(id=o.id, total_amount=float(o.total_amount), items=items)