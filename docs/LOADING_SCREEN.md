# 🌟 Tela de Carregamento EPIC

Uma tela de carregamento espetacular que reflete o estilo único do projeto EPIC Project Spark.

## ✨ Características

### 🎨 **Design Visual**
- **Efeito Nebuloso Completo**: Utiliza o `LivingNebulaShader` em tela completa
- **Logo Central Animado**: Logo EPIC em 500x500px com animações épicas
- **Gradiente de Fundo**: Cores que combinam com a paleta do projeto
- **Partículas Flutuantes**: Efeitos visuais dinâmicos

### 🎭 **Animações**
- **Entrada do Logo**: Rotação + escala + opacidade suave
- **Flutuação Contínua**: Movimento vertical sutil do logo
- **Glow Pulsante**: Efeito de brilho atrás do logo
- **Círculos Rotativos**: Bordas animadas ao redor do logo
- **Barra de Progresso**: Preenchimento gradual com gradiente colorido
- **Texto Pulsante**: Animação do texto de carregamento
- **Pontos de Loading**: Animação sequencial dos pontos

### 🛠️ **Funcionalidades**
- **Duração Personalizável**: Controle total do tempo de exibição
- **Callback de Conclusão**: Execução de função ao finalizar
- **Hook Personalizado**: `useLoadingScreen` para facilitar integração
- **Responsivo**: Adaptável a diferentes tamanhos de tela
- **Performance Otimizada**: Animações GPU-accelerated

## 🚀 Como Usar

### **Básico**
```tsx
import LoadingScreen from '@/components/ui/LoadingScreen';

<LoadingScreen 
  isVisible={isLoading}
  onComplete={() => setIsLoading(false)}
  duration={3000}
/>
```

### **Com Hook Personalizado**
```tsx
import { useLoadingScreen } from '@/hooks/useLoadingScreen';
import LoadingScreen from '@/components/ui/LoadingScreen';

const MyComponent = () => {
  const { isLoading, showLoading, hideLoading } = useLoadingScreen({
    duration: 4000,
    autoShow: true,
    onComplete: () => console.log('Carregamento finalizado!')
  });

  return (
    <>
      <LoadingScreen 
        isVisible={isLoading}
        onComplete={hideLoading}
        duration={4000}
      />
      
      {!isLoading && (
        <div>Conteúdo da aplicação</div>
      )}
    </>
  );
};
```

### **Integração no App Principal**
```tsx
// No App.tsx ou componente principal
import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';

const App = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Simula carregamento inicial da aplicação
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LoadingScreen 
        isVisible={isInitialLoading}
        onComplete={() => setIsInitialLoading(false)}
        duration={3000}
      />
      
      {!isInitialLoading && (
        // Resto da aplicação
        <Router>
          <Routes>
            {/* Suas rotas */}
          </Routes>
        </Router>
      )}
    </>
  );
};
```

## ⚙️ Props

### **LoadingScreen**
| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `isVisible` | `boolean` | - | Controla a visibilidade da tela |
| `onComplete` | `() => void` | - | Callback executado ao finalizar |
| `duration` | `number` | `3000` | Duração em milissegundos |

### **useLoadingScreen Hook**
| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `duration` | `number` | `3000` | Duração automática |
| `autoShow` | `boolean` | `false` | Exibe automaticamente |
| `onComplete` | `() => void` | - | Callback de conclusão |

**Retorna:**
- `isLoading`: Estado atual do carregamento
- `showLoading`: Função para exibir
- `hideLoading`: Função para ocultar
- `setIsLoading`: Setter direto do estado

## 🎨 Customização

### **Alterando Cores**
As cores seguem a paleta do projeto definida em `src/index.css`. Para customizar:

```css
/* Em seu CSS personalizado */
.custom-loading-gradient {
  background: linear-gradient(135deg, #custom1 0%, #custom2 50%, #custom3 100%);
}
```

### **Modificando Animações**
As animações estão definidas em `src/index.css`:

```css
@keyframes epic-glow {
  /* Personalize conforme necessário */
}
```

### **Logo Personalizado**
Para usar um logo diferente, substitua o caminho:

```tsx
<img src="/seu-logo.png" alt="Seu Logo" />
```

## 🎯 Casos de Uso

1. **Carregamento Inicial**: Primeira entrada na aplicação
2. **Transições**: Entre páginas ou seções
3. **Processamento**: Durante operações pesadas
4. **Importação**: Ao carregar dados externos
5. **Autenticação**: Durante login/logout

## 🔧 Dependências

- `framer-motion`: Animações suaves
- `react`: Framework base
- `LivingNebulaShader`: Efeito nebuloso de fundo
- `tailwindcss`: Estilização

## 🌟 Resultado Final

Uma tela de carregamento que é verdadeiramente **ÉPICA**:
- ✅ Efeito nebuloso em tela completa
- ✅ Logo central com animações cinematográficas  
- ✅ Barra de progresso estilizada
- ✅ Partículas flutuantes
- ✅ Texto animado
- ✅ Transições suaves de entrada/saída
- ✅ Performance otimizada
- ✅ Totalmente responsiva

**O charme visual do projeto em uma tela de carregamento inesquecível!** 🚀✨
