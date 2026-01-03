import "./giftcard.css";

export function Giftcard({
  image,
  value,
  discount,
  store,
  code,
}) {
  return (
    <div className="giftcard">
      <div className="giftcard-image">
        <img src={image} alt={store} />
      </div>

      <div className="giftcard-info">
        <span className="giftcard-value">{value}</span>

        <div className="giftcard-text">
          <strong>{discount}</strong>
          <p>{store}</p>
        </div>

        <span className="giftcard-code">Cod: {code}</span>
      </div>
    </div>
  );
}


