import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const adicionarLanche = async (lanche) => {
  await addDoc(collection(db, 'cardapio'), lanche);
};

export const getLanches = async () => {
  const lanchesRef = collection(db, 'cardapio');
  const snapshot = await getDocs(lanchesRef);
  const lista = [];
  snapshot.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
  return lista;
};
