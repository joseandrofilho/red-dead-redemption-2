# Brain-dump: LP Red Dead Redemption 2

## Estrutura de arquivos

```
index.html                     → marcação de todas as seções
css/style.css                  → estilos (tokens no topo, depois uma parte por seção)
js/main.js                     → navegação (link ativo), galeria
js/animacoes.js                → todas as animações GSAP (uma função por efeito)
js/personagens.js              → lista da galeria (editar só aqui para adicionar/remover)
assets/
  video/hero-cowboy-vale.mp4   → vídeo da hero
  img/
    historia/                  → seção História
    interludio/                → pôr do sol da gangue
    mundo/                     → seção Mundo aberto
    personagens/destaques/     → os 3 cards grandes (Arthur, Dutch, John)
    personagens/galeria/       → artes da galeria (nome-do-personagem.jpg)
    footer/                    → fundo do rodapé
documentos/                    → plano e anotações
_nao-usado/                    → arquivos que saíram do site (pode apagar)
```

Regra de nomes: tudo em minúsculas, sem acentos e com hífen no lugar de espaço.

## Seções

1. **Hero**: vídeo em loop infinito (autoplay, mudo). Substituiu a animação por frames, que não ficou boa.
2. **História**: Arthur e a gangue Van der Linde.
3. **Interlúdio**: pôr do sol da gangue em tela cheia.
4. **Mundo aberto**: grade com 5 imagens.
5. **Personagens**: destaques com Arthur, Dutch e John, depois a galeria com 20 artes (Kieran removido).
6. **Footer**: mensagem em homenagem a Arthur Morgan sobre a silhueta ao pôr do sol.

## Decisões de design

- **Cores**: vermelho `#ec1c24` (antes `#d7141d`, mais fiel à arte oficial, mas apagado nos textos pequenos), sobre fundo quase preto `#0b0907` e texto creme `#efe6d6`. Todas as cores ficam como variáveis em `:root`.
- **Tipografia** (Google Fonts):
  - Oswald: títulos grandes, menus e rótulos (condensada, lembra os cartazes do jogo)
  - Cormorant Garamond: títulos editoriais e destaques em itálico
  - Inter: texto corrido
- **Header**: logo à esquerda, links no centro, botão "Site oficial" à direita (leva para a página da Rockstar).
- **Bibliotecas**: GSAP 3.13 via CDN (cdnjs), com os plugins ScrollTrigger, ScrollSmoother e SplitText.
  - Intro do hero: letras do título sobem de uma máscara, vídeo faz zoom saindo, nav e textos entram em sequência
  - Scroll suave (ScrollSmoother) e barra de progresso vermelha no topo
  - Nav some ao rolar para baixo e volta ao rolar para cima
  - Títulos revelados linha a linha; imagens abrem como cortina, com zoom saindo
  - Parallax no hero e no pôr do sol do interlúdio
  - Frase do footer "acende" palavra por palavra conforme o scroll
- **Acessibilidade e segurança**: com `prefers-reduced-motion` ativo, ou se o CDN do GSAP falhar, nada é animado e a página aparece estática e completa.

## Perguntas em aberto (não implementei sem confirmação)

- [ ] Os textos das seções estão bons ou você prefere escrever os seus?
- [ ] O título do interlúdio ("Uma gangue. Um código.") está bom?
- [ ] Quer legendas nas imagens do mundo aberto (nome dos lugares)?
- [ ] Menu mobile: hoje os links somem abaixo de 640px. Quer um menu hambúrguer?

## Desempenho

- **Imagens em WebP**, redimensionadas para o tamanho em que aparecem: de ~7,7 MB para ~1,4 MB no total. Os originais estão em `_nao-usado/originais/`.
- **Preloader**: tela com a logo e a % real de carregamento (imagens, vídeo e fontes). Abre a página quando tudo chegou ou após no máximo 6s. Fica em `js/animacoes.js` (`carregarPagina` / `sairDoPreloader`).
- **Capa do vídeo** (`assets/img/hero/poster.webp`) com preload: o hero nunca fica vazio.
- **Sem `loading="lazy"`**: com o preloader, tudo já está baixado quando a pessoa rola.
- O vídeo já vem otimizado para streaming (começa a tocar antes de baixar inteiro).

## Ideias de melhoria

- Comprimir o vídeo da hero (12 MB) para 30fps ou WebM antes de publicar.
