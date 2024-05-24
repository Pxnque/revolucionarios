"use client";
import React, { useState, useEffect } from 'react';
import { fetchData } from '@/app/fetchData';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

const apiData = fetchData("http://127.0.0.1:8090/api/collections/categoria/records?fields=id,nombreCat,expand.relField.name");
const apiDataComida = fetchData("http://127.0.0.1:8090/api/collections/comida/records?fields=id,nombre,ingredientes,tiempoPrep,expand.relField.name?page=1&perPage=200");
var updateData =  "";
var createData = "";

async function update(data){
  try{
    updateData = await pb.collection('comida').update(data.id, data);
    if (updateData){
      alert("Platillo actualizado con éxito");
    }else{
      alert("Hubo un problema al actualizar el platillo");
    }
  }
  catch (e){
    console.log(e);
  }
}

async function create(data){
  try{
    createData = await pb.collection('comida').create(data);
    if (createData){
      alert("Platillo agregado con éxito");
    }else{
      alert("Hubo un problema al agregar el platillo");
    }
  }
  catch (e){
    console.log(e);
  }
}

const Page = () => {
  const [data, setData] = useState(null);
  const [dataComida, setDataComida] = useState(null);
  const [selectedComida, setSelectedComida] = useState({
    id: '',
    nombre: '',
    ingredientes: '',
    tiempoPrep: ''
  });
  const [newComida, setNewComida] = useState({
    nombre: '',
    ingredientes: '',
    tiempoPrep: ''
  });
  const [selectedCategoriaId, setSelectedCategoriaId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileLoading, setIsFileLoading] = useState(false);

  useEffect(() => {
    try {
      const fetchedData = apiData.read();
      if (fetchedData && fetchedData.items) {
        setData(fetchedData.items);
      } else {
        console.error('Data is not in expected format:', fetchedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    try {
      const fetchedDataComida = apiDataComida.read();
      if (fetchedDataComida && fetchedDataComida.items) {
        setDataComida(fetchedDataComida.items);
      } else {
        console.error('Data is not in expected format:', fetchedDataComida);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  const handleSelectChangeComida = (event) => {
    const selectedRecord = dataComida.find(record => record.nombre === event.target.value);
    if (selectedRecord) {
      setSelectedComida({
        id: selectedRecord.id,
        nombre: selectedRecord.nombre,
        ingredientes: selectedRecord.ingredientes,
        tiempoPrep: selectedRecord.tiempoPrep
      });
    }
  };

  const handleSelectChangeCategoria = (event) => {
    const selectedRecord = data.find(record => record.nombreCat === event.target.value);
    if (selectedRecord) {
      setSelectedCategoriaId(selectedRecord.id);
    }
  };

  const handleIngredientesChange = (event) => {
    setSelectedComida({
      ...selectedComida,
      ingredientes: event.target.value
    });
  };

  const handleTiempoPrepChange = (event) => {
    setSelectedComida({
      ...selectedComida,
      tiempoPrep: event.target.value
    });
  };

  const handleNewIngredientesChange = (event) => {
    setNewComida({
      ...newComida,
      ingredientes: event.target.value
    });
  };

  const handleNewTiempoPrepChange = (event) => {
    setNewComida({
      ...newComida,
      tiempoPrep: event.target.value
    });
  };

  const handleNombreChange = (event) => {
    setNewComida({
      ...newComida,
      nombre: event.target.value
    });
  };

  const handleButtonClick = () => {
    const dataEditar = {
      id: selectedComida.id,
      ingredientes: selectedComida.ingredientes,
      tiempoPrep: selectedComida.tiempoPrep
    };
    update(dataEditar);
  };

  const handleButtonClickAgregar = () => {
    const dataAgregar = {
      nombre: newComida.nombre,
      ingredientes: newComida.ingredientes,
      tiempoPrep: newComida.tiempoPrep,
      idCategoria: selectedCategoriaId
    };
    create(dataAgregar);
  };

  const renderOptionsCategorias = () => {
    return data?.map(record => (
      <option key={record.id} value={record.nombreCat}>{record.nombreCat}</option>
    ));
  };

  const renderOptionsComidas = () => {
    return dataComida?.map(record => (
      <option key={record.id} value={record.nombre}>{record.nombre}</option>
    ));
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadClick = async () => {
    if (!selectedFile || !selectedCategoriaId) {
      alert("Por favor, selecciona una imagen y una categoría.");
      return;
    }

    setIsFileLoading(true);

    try {
      const formData = new FormData();
      formData.append('imagen', selectedFile); 

      const response = await pb.collection('categoria').update(selectedCategoriaId, formData);
      if (response) {
        alert("Imagen subida con éxito");
      } else {
        alert("Hubo un problema al subir la imagen");
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert("Hubo un problema al subir la imagen");
    } finally {
      setIsFileLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center my-4">
        <h1 className="font-bold text-3xl text-center mb-4 md:text-4xl">Editar Platillo</h1>
        <select 
          className="w-1/2 md:w-1/3 px-4 py-2 border border-black rounded-md text-xl text-center font-bold h-full"
          onChange={handleSelectChangeComida}
        >
          {renderOptionsComidas()}
        </select>
        <textarea
          name=""
          id="areaEditar"
          className="border border-black rounded-md m-4 w-1/2 md:w-1/3 px-4 py-2 text-xl"
          value={selectedComida.ingredientes}
          onChange={handleIngredientesChange}
        ></textarea>
        <input
          id="prepEditar"
          type="text"
          className="w-1/2 md:w-1/3 px-4 py-2 border border-black text-black rounded-sm mb-4"
          placeholder="Tiempo de preparación en min"
          value={selectedComida.tiempoPrep}
          onChange={handleTiempoPrepChange}
        />
        <button
          className="border border-black rounded-md w-1/2 md:w-1/3 px-4 py-2 hover:text-white hover:bg-red-700 font-bold text-xl"
          onClick={handleButtonClick}
        >
          Aceptar
        </button>
      </div>

      <div className="flex flex-col items-center justify-center my-4">
        <h1 className="font-bold text-3xl text-center mb-4 md:text-4xl w-full">Cambiar Imagen Categorias</h1>
        <select 
          id="Categorias-option1"
          className="w-1/2 md:w-1/3 px-4 py-2 border border-black rounded-md text-xl text-center font-bold h-full mb-4"
          onChange={handleSelectChangeCategoria}
        >
          {renderOptionsCategorias()}
        </select>
        <div className="flex flex-col items-center">
          <p className="font-semibold text-2xl px-4 py-2 mb-4">Imagen</p>
          <input 
            type="file" 
            onChange={handleFileChange} 
            className="mb-4"
          />
          {isFileLoading && <p className="text-xl text-red-500">Cargando...</p>}
        </div>
        <button 
          className="border border-black rounded-md w-1/2 md:w-1/3 px-4 py-2 hover:text-white hover:bg-red-700 font-bold text-xl"
          onClick={handleUploadClick}
        >
          Aceptar
        </button>
      </div>

      <div className="flex flex-col items-center justify-center my-4">
        <h1 className="font-bold text-3xl text-center mb-4 md:text-4xl">Agregar Platillo</h1>
        <input
          type="text"
          className="w-1/2 md:w-1/3 px-4 py-2 border border-black text-black rounded-sm mb-4"
          placeholder="Nombre"
          onChange={handleNombreChange}
        />
        <select 
          id="Categorias-option2"
          className="w-1/2 md:w-1/3 px-4 py-2 border border-black rounded-md text-xl text-center font-bold h-full"
          onChange={handleSelectChangeCategoria}
        >
          {renderOptionsCategorias()}
        </select>
        <textarea
          name=""
          id=""
          className="border border-black rounded-md m-4 w-1/2 md:w-1/3 px-4 py-2 text-xl"
          value={newComida.ingredientes}
          onChange={handleNewIngredientesChange}
        ></textarea>
        <input
          type="text"
          className="w-1/2 md:w-1/3 px-4 py-2 border border-black text-black rounded-sm mb-4"
          placeholder="Tiempo de preparación en min"
          value={newComida.tiempoPrep}
          onChange={handleNewTiempoPrepChange}
        />
        <button
          className="border border-black rounded-md w-1/2 md:w-1/3 px-4 py-2 hover:text-white hover:bg-red-700 font-bold text-xl"
          onClick={handleButtonClickAgregar}
        >
          Aceptar
        </button>
      </div>
    </>
  );
};

export default Page;
