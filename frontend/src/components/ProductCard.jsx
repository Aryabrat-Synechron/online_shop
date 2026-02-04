export default function ProductCard({ product, onAdd }) {
  return (
    <div className="col">
      <div className="card card-product h-100 shadow-sm">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text flex-grow-1">{product.description || "—"}</p>
          <div className="d-flex align-items-center justify-content-between">
            <span className="fw-bold">₹ {Number(product.price).toFixed(2)}</span>
            <button className="btn btn-primary btn-sm" onClick={() => onAdd(product)}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}