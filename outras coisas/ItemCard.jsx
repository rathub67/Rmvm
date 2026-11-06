function ItemCard({ name, info }) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="font-semibold">{name}</h2>
      <p className="text-gray-600">{info}</p>
    </div>
  );
}

export default ItemCard;