from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[ProductOut])
def list_products(db: Session = Depends(get_db), skip: int = 0, limit: int = Query(50, le=100)):
    items = db.query(Product).offset(skip).limit(limit).all()
    return [ProductOut(id=i.id, name=i.name, description=i.description, price=float(i.price), stock=i.stock) for i in items]

@router.post("/", response_model=ProductOut)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    p = Product(name=data.name, description=data.description, price=data.price, stock=data.stock)
    db.add(p)
    db.commit()
    db.refresh(p)
    return ProductOut(id=p.id, name=p.name, description=p.description, price=float(p.price), stock=p.stock)

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).get(product_id)
    if not p:
        raise HTTPException(404, "Product not found")
    return ProductOut(id=p.id, name=p.name, description=p.description, price=float(p.price), stock=p.stock)

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    p = db.query(Product).get(product_id)
    if not p:
        raise HTTPException(404, "Product not found")
    upd = data.model_dump(exclude_unset=True)
    for k, v in upd.items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    return ProductOut(id=p.id, name=p.name, description=p.description, price=float(p.price), stock=p.stock)

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).get(product_id)
    if not p:
        raise HTTPException(404, "Product not found")
    db.delete(p)
    db.commit()
    return {"message": "Deleted"}