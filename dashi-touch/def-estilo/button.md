
# Padrão Visual de Botão (Quadrado)

Este é o padrão oficial para botões na plataforma:

- **Cor de fundo:** gradiente rosa/magenta (`bg-gradient-to-r from-[#FF0066] to-[#C8008F]`)
- **Cor do texto:** branco `#FFFFFF`
- **Fonte:** semibold, caixa alta ou capitalização normal
- **Borda:** quadrada (sem arredondamento, `border-radius: 0`)
- **Padding:** espaçamento interno horizontal e vertical (`px-4 py-2`)
- **Transição:** efeito suave ao passar o mouse (`hover:from-[#FF0066]/80 hover:to-[#C8008F]/80`, `transition-colors`)
- **Efeito de elevação:** sombra sutil e leve aumento no hover (`shadow-lg hover:shadow-xl transform hover:scale-105`)
- **Tamanho:** altura média, largura ajustada ao texto

## Exemplo Tailwind

```tsx
<button className="bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold px-4 py-2 rounded-none transition-colors shadow-lg hover:from-[#FF0066]/80 hover:to-[#C8008F]/80 hover:shadow-xl transform hover:scale-105">
  Atualizado
</button>
```

## Observações
- Use `rounded-none` para garantir bordas quadradas.
- O botão deve ser visualmente destacado, responsivo ao hover e com efeito de elevação.
- Adapte o texto conforme a ação do botão.

## Classe Alternativa (Compacta)

Se for necessário um botão compacto com cor sólida e padding reduzido (ex: "Mostrar Debug"), use a classe abaixo:

```tsx
<button className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-3 py-1 rounded-md text-xs">
  Mostrar Debug
</button>
```

Essa classe é intencionalmente distinta do padrão principal (gradiente + elevação). Use-a em contextos onde um botão menor e menos chamativo é desejado.