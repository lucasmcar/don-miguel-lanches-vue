import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Adicionar um lanche à coleção 'cardapio'
export const adicionarLanche = async (lanche) => {
  await addDoc(collection(db, 'cardapio'), lanche);
};

// Obter todos os lanches da coleção 'cardapio'
export const getLanches = async () => {
  const lanchesRef = collection(db, 'cardapio');
  const snapshot = await getDocs(lanchesRef);
  const lista = [];
  snapshot.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
  return lista;
};

// Adicionar uma bebida à coleção 'bebidas'
export const adicionarBebida = async (bebida) => {
  await addDoc(collection(db, 'bebidas'), bebida);
};

// Obter todas as bebidas da coleção 'bebidas'
export const getBebidas = async () => {
  const bebidasRef = collection(db, 'bebidas');
  const snapshot = await getDocs(bebidasRef);
  const lista = [];
  snapshot.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
  return lista;
};

// Adicionar um adicional à coleção 'adicionais'
export const adicionarAdicional = async (adicional) => {
  await addDoc(collection(db, 'adicionais'), adicional);
};

// Obter todos os adicionais da coleção 'adicionais'
export const getAdicionais = async () => {
  const adicionaisRef = collection(db, 'adicionais');
  const snapshot = await getDocs(adicionaisRef);
  const lista = [];
  snapshot.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
  return lista;
};