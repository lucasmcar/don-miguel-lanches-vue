<template>
    <div>
        <h3>Cardápio</h3>
        <ul class="list-group">
            <li v-for="lanche in lanches" :key="lanche.id" class="list-group-item d-flex justify-content-between">
                {{ lanche.nome }} - R$ {{ lanche.preco }}
                <button class="btn btn-success btn-sm" @click="add(lanche)">Adicionar</button>
            </li>
        </ul>
    </div>
</template>

<script setup>
const emit = defineEmits(['add-lanche']);
const lanches = [
    { id: 1, nome: 'X-Burguer', preco: 15 },
    { id: 2, nome: 'X-Salada', preco: 18 },
    { id: 3, nome: 'X-Bacon', preco: 20 },
    { id: 4, nome: 'Batata Frita', preco: 10 }
];

function add(lanche) {
    emit('add-lanche', lanche);
}
</script>
