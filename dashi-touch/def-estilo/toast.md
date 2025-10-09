# Toasts (Padrão Visual EPIC)

Este guia define o padrão oficial para todos os toasts do projeto, replicando o visual e o comportamento utilizado na página "/settings".

## Objetivo
- Visual consistente em toda a aplicação.
- Feedback claro e rápido (3s) com opção de fechar.
- Suporte a ícones e variações (sucesso, erro, info).

## Tokens visuais
- Posição: canto inferior direito (via Toaster/Viewport padrão do projeto).
- Fundo: gradiente roxo → rosa `bg-gradient-to-r from-[#6A0DAD] to-[#FF0066]`.
- Texto: branco `text-white`.
- Borda: remover `border-none`.
- Forma: `rounded-md`.
- Sombra: `shadow-lg`.
- Duração: `3000ms`.

Observação: O componente `<Toaster />` já está incluído em `src/App.tsx`. Não é necessário adicioná-lo novamente.

---

## Uso rápido (recomendado)
Use a função `toast` do hook já existente e aplique a classe padrão para o visual EPIC.

```tsx
// Em qualquer componente React
import { toast } from "@/hooks/use-toast";
import { Award } from "lucide-react";

export function exemploSalvar() {
  const onSave = () => {
    toast({
      // Título com ícone (opcional)
      title: (
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Configurações salvas com sucesso!
        </div>
      ),
      description: "Suas alterações foram aplicadas.",

      // Padrão visual EPIC (mesmo do /settings)
      className:
        "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",

      // Comportamento
      duration: 3000,
    });
  };

  return (
    <button onClick={onSave}>Salvar</button>
  );
}
```

Dicas:
- O botão de fechar (X) já é renderizado pelo `<Toaster />` e herda o tema.
- Você pode passar qualquer `ReactNode` em `title` e `description`.

---

## Helpers opcionais (centralizar variações)
Se quiser padronizar mensagens de sucesso/erro/info em um só lugar, crie um util como abaixo.

```tsx
// Sugerido em: src/utils/epicToast.ts
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Info } from "lucide-react";

const baseClass =
  "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg";

function withTitle(icon: React.ReactNode, text: string) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </div>
  );
}

export const epicToast = {
  success(message: string, description?: string) {
    toast({
      title: withTitle(<CheckCircle2 className=\"h-5 w-5\" />, message),
      description,
      className: baseClass,
      duration: 3000,
    });
  },
  error(message: string, description?: string) {
    toast({
      title: withTitle(<XCircle className=\"h-5 w-5\" />, message),
      description,
      className: baseClass,
      duration: 3000,
    });
  },
  info(message: string, description?: string) {
    toast({
      title: withTitle(<Info className=\"h-5 w-5\" />, message),
      description,
      className: baseClass,
      duration: 3000,
    });
  },
};
```

Uso:

```tsx
import { epicToast } from "@/utils/epicToast";

// Sucesso
epicToast.success("Configurações salvas!", "Suas alterações foram aplicadas.");

// Erro
epicToast.error("Falha ao salvar", "Verifique sua conexão e tente novamente.");

// Info
epicToast.info("Atualização disponível", "Recarregue a página para aplicar.");
```

---

## Boas práticas
- Use frases curtas e objetivas.
- Prefira um único toast por ação (o projeto já limita a 1 simultâneo).
- Evite toasts persistentes; use `duration: 3000` como padrão.
- Para ações que requerem confirmação do usuário, considere um `action` no toast ou um modal.

## Checklist de integração
- [x] `<Toaster />` presente em `src/App.tsx` (já está).
- [x] Usar `toast({...})` com `className` padrão EPIC.
- [x] Opcional: adicionar `src/utils/epicToast.ts` e importar `epicToast` onde necessário.

---

## Referência
- Implementação base: `src/components/ui/toast.tsx`, `src/components/ui/toaster.tsx`, `src/hooks/use-toast.ts`.
- Estilo de referência: toast da página `/settings` (gradiente roxo → rosa, texto branco, 3s, X para fechar).
