// Next.js prototype for product location system with Tailwind CSS styling
'use client'
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [streets, setStreets] = useState(() => JSON.parse(Cookies.get('streets') || '[]'));
  const [selectedStreet, setSelectedStreet] = useState('');
  const [selectedLot, setSelectedLot] = useState('');
  const [productName, setProductName] = useState('');
  const [productLocation, setProductLocation] = useState('');
  const [userView, setUserView] = useState({});

  useEffect(() => {
    Cookies.set('streets', JSON.stringify(streets), { expires: 7 });
  }, [streets]);

  const handleAddStreet = () => {
    const newStreet = prompt('Enter the name of the new street:');
    if (newStreet) setStreets([...streets, { name: newStreet, lots: [] }]);
  };

  const handleAddLot = (streetName) => {
    const updatedStreets = streets.map((street) => {
      if (street.name === streetName) {
        const newLot = prompt(`Enter the name of the new lot for ${streetName}:`);
        if (newLot) street.lots.push({ name: newLot, product: '' });
      }
      return street;
    });
    setStreets(updatedStreets);
  };

  const handleAssignProduct = () => {
    if (!selectedStreet || !selectedLot || !productName) {
      alert('Please select a street, a lot, and enter a product name.');
      return;
    }
    const updatedStreets = streets.map((street) => {
      if (street.name === selectedStreet) {
        street.lots = street.lots.map((lot) => {
          if (lot.name === selectedLot) {
            lot.product = productName;
          }
          return lot;
        });
      }
      return street;
    });
    setStreets(updatedStreets);
    setProductName('');
  };

  const handleUserSearch = (product) => {
    for (const street of streets) {
      const foundLot = street.lots.find((lot) => lot.product === product);
      if (foundLot) {
        setUserView({ street: street.name, lot: foundLot.name });
        return;
      }
    }
    setUserView({ error: 'Produto não encontrado' });
  };

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url("/Images/Wallpepar projetoSenai.JPG")' }}>
      <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Log Organization</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => setIsAdmin(!isAdmin)}
        >
          Mudar para modo {isAdmin ? 'User' : 'Admin'}
        </button>
      </header>

      <main className="p-6">
        {isAdmin ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Painel Administrador</h2>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              onClick={handleAddStreet}
            >
              Adicionar Rua
            </button>
            <div className="space-y-4">
              {streets.map((street) => (
                <div key={street.name} className="bg-white p-4 rounded shadow-md">
                  <h3 className="text-lg font-semibold">{street.name}</h3>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 mt-2 rounded"
                    onClick={() => handleAddLot(street.name)}
                  >
                    Adicionar Lote
                  </button>
                  <div className="mt-2 space-y-1">
                    {street.lots.map((lot) => (
                      <div key={lot.name} className="text-gray-700">
                        {lot.name} - <span className="font-semibold">{lot.product || 'Empty'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <h2 className="text-xl font-bold mt-6">Cadastrar Produto</h2>
            <div className="space-y-2">
              <select
                className="block w-full p-2 border rounded"
                onChange={(e) => setSelectedStreet(e.target.value)}
              >
                <option value="">Selecionar Rua</option>
                {streets.map((street) => (
                  <option key={street.name} value={street.name}>{street.name}</option>
                ))}
              </select>
              <select
                className="block w-full p-2 border rounded"
                onChange={(e) => setSelectedLot(e.target.value)}
                disabled={!selectedStreet}
              >
                <option value="">Selecionar Lote</option>
                {streets.find((street) => street.name === selectedStreet)?.lots.map((lot) => (
                  <option key={lot.name} value={lot.name}>{lot.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Product Name"
                className="block w-full p-2 border rounded"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={handleAssignProduct}
              >
                Cadastrar Produto
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Painel de Usuário</h2>
            <input
              type="text"
              placeholder="Procurar Produto"
              className="block w-full p-2 border rounded"
              onChange={(e) => setProductLocation(e.target.value)}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => handleUserSearch(productLocation)}
            >
              Procurar
            </button>
            {userView.error ? (
              <p className="text-red-600 font-semibold">{userView.error}</p>
            ) : userView.street ? (
              <p className="text-green-600 font-semibold">
                Encontrado na rua: {userView.street}, Lote: {userView.lot}
              </p>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
