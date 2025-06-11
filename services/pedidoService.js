import { db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot, addDoc, updateDoc, doc, Timestamp, orderBy } from 'firebase/firestore';

// Monitorar pedidos em tempo real
export const getPedidos = (callback) => {
  const pedidosRef = collection(db, 'pedidos');
  const pedidosQuery = query(pedidosRef, orderBy("dataCriacao", "asc"));

  return onSnapshot(pedidosQuery, (snapshot) => {
    const lista = [];
    snapshot.forEach((doc) => {
      lista.push({ id: doc.id, ...doc.data() });
    });
    callback(lista);
  });
};


export const ouvirStatusPedido = (pedidoId, callback) => {
    const pedidoDoc = doc(db, "pedidos", pedidoId);
    return onSnapshot(pedidoDoc, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().status);
      }
    });
  }


// Cria um novo pedido
export const criarPedido = async (pedido) => {
  const pedidoComData = {
    ...pedido,
    dataCriacao: Timestamp.now(), // grava data e hora do servidor
  };
  await addDoc(collection(db, 'pedidos'), pedidoComData);
};

// Atualizar status do pedido
export const atualizarStatusPedido = async (pedidoId, novoStatus) => {
  const pedidoRef = doc(db, 'pedidos', pedidoId);
  await updateDoc(pedidoRef, { status: novoStatus });
};

// Obter pedidos em tempo real
export function getPedido(callback) {
  onSnapshot(collection(db, "pedidos"), (snapshot) => {
    const pedidos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(pedidos);
  });
}

// Atualizar pedido (status ou pagamento)
export async function atualizarPedido(id, data) {
  const pedidoRef = doc(db, "pedidos", id);
  await updateDoc(pedidoRef, data);
}

// Buscar pedido por numeroPedido
export async function buscarPedidoPorNumero(numeroPedido) {
  const pedidosRef = collection(db, "pedidos");
  const q = query(pedidosRef, where("numeroPedido", "==", numeroPedido));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } else {
    throw new Error("Pedido não encontrado.");
  }
}