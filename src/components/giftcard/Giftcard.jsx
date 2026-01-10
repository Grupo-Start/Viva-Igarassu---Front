import "./giftcard.css";
import defaultImg from "../../assets/livraria igarassu.jpg";

export function Giftcard({ image, title, description, store, code, value }) {
  const handleImgError = (e) => {
    try {
      e.currentTarget.onerror = null;
      e.currentTarget.src = defaultImg;
    } catch (err) {}
  };

  return (
    <div className="giftcard">
      <div className="giftcard-image">
        <img src={image || defaultImg} alt={store || title || 'Recompensa'} onError={handleImgError} />
      </div>

      <div className="giftcard-info">
        {value && <span className="giftcard-value">{value}</span>}
        {title && <h4 className="giftcard-title">{title}</h4>}
        {description && <p className="giftcard-description">{description}</p>}

        <div className="giftcard-text">
          <p>{store}</p>
        </div>

        <span className="giftcard-code">Cod: {code}</span>
      </div>
    </div>
  );
}


