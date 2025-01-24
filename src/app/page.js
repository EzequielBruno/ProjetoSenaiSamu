'use client'
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import * as XLSX from 'xlsx'; // Importando a biblioteca XLSX

const Home = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [streets, setStreets] = useState(() => JSON.parse(Cookies.get('streets') || '[]'));
  const [selectedStreet, setSelectedStreet] = useState('');
  const [selectedLot, setSelectedLot] = useState('');
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState(0);
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
        if (newLot) street.lots.push({ name: newLot, product: '', quantity: 0, sold: 0, depreciated: 0 });
      }
      return street;
    });
    setStreets(updatedStreets);
  };

  const handleAssignProduct = () => {
    if (!selectedStreet || !selectedLot || !productName || productQuantity <= 0) {
      alert('Please select a street, a lot, enter a product name, and set a valid quantity.');
      return;
    }
    const updatedStreets = streets.map((street) => {
      if (street.name === selectedStreet) {
        street.lots = street.lots.map((lot) => {
          if (lot.name === selectedLot) {
            lot.product = productName;
            lot.quantity = productQuantity;
            lot.sold = 0; // Inicializa como 0 vendido
            lot.depreciated = 0; // Inicializa como 0 depreciado
          }
          return lot;
        });
      }
      return street;
    });
    setStreets(updatedStreets);
    setProductName('');
    setProductQuantity(0);
  };

  const handleUserSearch = (product) => {
    for (const street of streets) {
      const foundLot = street.lots.find((lot) => lot.product === product);
      if (foundLot) {
        setUserView({ street: street.name, lot: foundLot.name, quantity: foundLot.quantity });
        return;
      }
    }
    setUserView({ error: 'Produto não encontrado' });
  };

  const handleEditProduct = (streetName, lotName) => {
    const newProduct = prompt('Enter the new product name:');
    const newQuantity = parseInt(prompt('Enter the new quantity:'), 10);
    if (newProduct && newQuantity > 0) {
      const updatedStreets = streets.map((street) => {
        if (street.name === streetName) {
          street.lots = street.lots.map((lot) => {
            if (lot.name === lotName) {
              lot.product = newProduct;
              lot.quantity = newQuantity;
            }
            return lot;
          });
        }
        return street;
      });
      setStreets(updatedStreets);
    }
  };

  const handleDeleteProduct = (streetName, lotName) => {
    const updatedStreets = streets.map((street) => {
      if (street.name === streetName) {
        street.lots = street.lots.map((lot) => {
          if (lot.name === lotName) {
            return { ...lot, product: '', quantity: 0, sold: 0, depreciated: 0 }; // Resetando tudo
          }
          return lot;
        });
      }
      return street;
    });
    setStreets(updatedStreets);
  };

  // Função para marcar um produto como vendido
  const handleMarkSold = (streetName, lotName) => {
    const updatedStreets = streets.map((street) => {
      if (street.name === streetName) {
        street.lots = street.lots.map((lot) => {
          if (lot.name === lotName) {
            lot.sold = lot.sold + 1; // Incrementa a quantidade vendida
            lot.quantity = lot.quantity - 1; // Decrementa a quantidade disponível
          }
          return lot;
        });
      }
      return street;
    });
    setStreets(updatedStreets);
  };

  // Função para depreciar um produto
  const handleMarkDepreciated = (streetName, lotName) => {
    const updatedStreets = streets.map((street) => {
      if (street.name === streetName) {
        street.lots = street.lots.map((lot) => {
          if (lot.name === lotName) {
            lot.depreciated = lot.depreciated - 1; // Decrementa a quantidade depreciada
            lot.quantity = lot.quantity - 1; // Decrementa a quantidade disponível
          }
          return lot;
        });
      }
      return street;
    });
    setStreets(updatedStreets);
  };

  const generateReport = () => {
    // Criação de dados para exportação
    let data = [['Rua', 'Lote', 'Produto', 'Quantidade', 'Vendido', 'Depreciado']];

    streets.forEach((street) => {
      street.lots.forEach((lot) => {
        data.push([
          street.name,
          lot.name,
          lot.product || 'Vazio',
          lot.quantity + lot.depreciated, // Quantidade incluindo depreciados como negativos
          lot.sold,
          lot.depreciated,
        ]);
      });
    });

    // Criação do arquivo Excel com os dados
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Product Report');

    // Exportação do arquivo Excel
    XLSX.writeFile(wb, 'product_report.xlsx');
  };

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url("/Images/Wallpepar projetoSenai.jpg")' }}>
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
                      <div key={lot.name} className="text-gray-700 flex justify-between">
                        <span>
                          {lot.name} -{' '}
                          <span className="font-semibold">{lot.product || 'Vazio'}</span> ({lot.quantity} unidades)
                        </span>
                        <div className="space-x-2">
                          <button
                            className="bg-yellow-500 text-white px-2 py-1 rounded"
                            onClick={() => handleEditProduct(street.name, lot.name)}
                          >
                            Editar
                          </button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded"
                            onClick={() => handleDeleteProduct(street.name, lot.name)}
                          >
                            Excluir
                          </button>
                          <button
                            className="bg-blue-500 text-white px-2 py-1 rounded"
                            onClick={() => handleMarkSold(street.name, lot.name)}
                          >
                            Vendido
                          </button>
                          <button
                            className="bg-orange-500 text-white px-2 py-1 rounded"
                            onClick={() => handleMarkDepreciated(street.name, lot.name)}
                          >
                            Depreciar
                          </button>
                        </div>
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
                placeholder="Nome do Produto"
                className="block w-full p-2 border rounded"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Quantidade"
                className="block w-full p-2 border rounded"
                value={productQuantity}
                onChange={(e) => setProductQuantity(e.target.value)}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={handleAssignProduct}
              >
                Cadastrar Produto
              </button>
            </div>

            {/* Botão para gerar relatório */}
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mt-6"
              onClick={generateReport}
            >
              Gerar Relatório (Excel)
            </button>
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
                Encontrado na rua: {userView.street}, Lote: {userView.lot} ({userView.quantity} unidades)
              </p>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
