'use client';
type CardProps = {
  title: string;
  value: number | string;
};

export default function Card({ title, value }: CardProps) {
  return (
    <div className="bg-gray-700 p-6 rounded shadow hover:bg-gray-600 transition">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
