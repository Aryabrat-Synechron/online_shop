from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal

from app.db.session import get_db
from app.models.cart import Cart, CartItem, CartStatus
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartOut, CartItemOut
from app.routers.deps import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])

def get_or_create_active_cart(db: Session, user_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id, Cart.status == CartStatus.active).first()
    if not cart:
        cart = Cart(user_id=user_id, status=CartStatus.active)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def calc_total(cart: Cart) -> float:
    total = Decimal("0.00")
    for it in cart.items:
        total += Decimal(it.unit_price) * it.quantity
    return float(total)

@router.get("/", response_model=CartOut)
def fetch_cart(db: Session = Depends(get_db), user=Depends(get_current_user)):
    cart = get_or_create_active_cart(db, user.id)
    items = [CartItemOut(id=i.id, product_id=i.product_id, quantity=i.quantity, unit_price=float(i.unit_price)) for i in cart.items]
    return CartOut(id=cart.id, status=cart.status.value, items=items, total=calc_total(cart))

@router.post("/add", response_model=CartOut)
def add_item(payload: CartItemAdd, db: Session = Depends(get_db), user=Depends(get_current_user)):
    cart = get_or_create_active_cart(db, user.id)
    product = db.query(Product).get(payload.product_id)
    if not product or product.stock < payload.quantity:
        raise HTTPException(400, "Product not available or insufficient stock")
    # if item exists, increase quantity
    item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == product.id).first()
    if item:
        new_qty = item.quantity + payload.quantity
        if product.stock < new_qty:
            raise HTTPException(400, "Insufficient stock")
        item.quantity = new_qty
    else:
        item = CartItem(cart_id=cart.id, product_id=product.id, quantity=payload.quantity, unit_price=product.price)
        db.add(item)
    db.commit()
    db.refresh(cart)
    return fetch_cart(db, user)

@router.patch("/item/{item_id}", response_model=CartOut)
def update_item(item_id: int, payload: CartItemUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    cart = get_or_create_active_cart(db, user.id)
    item = db.query(CartItem).get(item_id)
    if not item or item.cart_id != cart.id:
        raise HTTPException(404, "Cart item not found")
    product = db.query(Product).get(item.product_id)
    if product.stock < payload.quantity:
        raise HTTPException(400, "Insufficient stock")
    item.quantity = payload.quantity
    db.commit()
    return fetch_cart(db, user)

@router.delete("/item/{item_id}", response_model=CartOut)
def remove_item(item_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    cart = get_or_create_active_cart(db, user.id)
    item = db.query(CartItem).get(item_id)
    if not item or item.cart_id != cart.id:
        raise HTTPException(404, "Cart item not found")
    db.delete(item)
    db.commit()
    return fetch_cart(db, user)

@router.post("/checkout")
def checkout(db: Session = Depends(get_db), user=Depends(get_current_user)):
    cart = get_or_create_active_cart(db, user.id)
    if not cart.items:
        raise HTTPException(400, "Cart is empty")

    # stock check
    for it in cart.items:
        product = db.query(Product).get(it.product_id)
        if product.stock < it.quantity:
            raise HTTPException(400, f"Insufficient stock for product {product.id}")

    total = calc_total(cart)
    order = Order(user_id=user.id, total_amount=total)
    db.add(order)
    db.commit()
    db.refresh(order)

    # create order items and reduce stock
    for it in cart.items:
        product = db.query(Product).get(it.product_id)
        product.stock -= it.quantity
        db.add(OrderItem(order_id=order.id, product_id=it.product_id, quantity=it.quantity, unit_price=it.unit_price))
    cart.status = CartStatus.checked_out
    db.commit()
    return {"message": "Order placed", "order_id": order.id, "total_amount": total}