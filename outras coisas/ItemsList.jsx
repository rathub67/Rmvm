import { useEffect, useState } from 'react';

import ItemCard from "./ItemCard";

function ItemList() {
  const [alunos, setAlunos] = useState([]);

  // hook useEffect -> carrega automaticamente ao renderizar
  useEffect(() => {

      async function fetchData() {        
        const url = 'http://127.0.0.1:8000/alunos';
        const options = {method: 'GET'};

        try {
          const response = await fetch(url, options);
          const data = await response.json();
          console.log(data);
          setAlunos(data.alunos);

        } catch (error) {
          console.error(error);
        }
      }
      fetchData();
  }, [])

  // Dados vindos do backend

  // mock de dados
  const items = [
    { id: 1, name: "Notebook", info: "Modelo 2026" },
    { id: 2, name: "Monitor", info: "Wild 30" }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Alunos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alunos.map((item) => (
          <ItemCard
            key={item.id}
            name={item.nome}
            info={`${item.curso} - ${item.ano}` }
          />
        ))}
      </div>
    </div>
  );
}
export default ItemList;