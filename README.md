# A Princesa de Santa Teresa 🏰✨

Um mini-jogo 3D (estilo "casa de arquitetura" em corte, tipo maquete/dollhouse)
feito para rodar direto no navegador — funciona no celular e no PC.
Baseado no roteiro "A Princesa de Santa Teresa" e nos sprites que você enviou.

Tecnologia: **Three.js puro**, carregado via CDN. Não precisa de build, npm, nem
Node — é só HTML/CSS/JS estático. Isso significa que hospedar é literalmente
arrastar a pasta pro Netlify.

---

## 🚀 Como hospedar no Netlify (2 minutos)

### Opção A — Arrastar e soltar (mais fácil)
1. Acesse https://app.netlify.com/drop
2. Arraste esta pasta inteira (a pasta `game`, com o `index.html` dentro) para a
   área de upload.
3. Pronto — o Netlify te dá uma URL tipo `https://algum-nome.netlify.app`.
   Você pode renomear o site em **Site settings → Change site name**.

### Opção B — Netlify CLI
```bash
npm install -g netlify-cli
cd game
netlify deploy --prod
```

### Opção C — Conectar um repositório Git
1. Suba esta pasta para um repositório no GitHub.
2. No Netlify: **Add new site → Import an existing project**.
3. Build command: (deixe em branco)
4. Publish directory: `.`

Não existe nenhuma variável de ambiente ou chave de API necessária — é 100%
estático.

---

## 🎮 Como jogar

- **PC:** `WASD` ou setas para andar, `E` (ou barra de espaço) para interagir,
  arraste o mouse para girar a câmera ao redor da casa.
- **Celular:** manete virtual no canto inferior esquerdo para andar, botão
  "agir" no canto inferior direito para interagir, arraste a tela para girar
  a câmera.

### Roteiro do jogo
1. **Sala de estar** — encontre a chave de latão sobre a mesinha de centro.
2. **Corredor das memórias** — use seu "poder das flores" para afastar os
   cipós que bloqueiam o caminho, veja os 3 quadros de memória, e pegue a
   chave em forma de coração.
3. **Porta de vidro** — com as duas chaves, abra a porta mágica. A
   protagonista se transforma no vestido de princesa e o céu vira entardecer.
4. **Mirante** — converse com o namorado e depois abra o presente sobre a
   mesa.
5. **Final** — a câmera sobe revelando o Rio de Janeiro ao fundo, com a
   mensagem "TO BE CONTINUED...".

---

## ✏️ Como personalizar

Praticamente todo o texto do jogo está em **`js/config.js`** — é só editar
esse arquivo (nenhum conhecimento de programação necessário além de mexer em
texto entre aspas):

- `nomeEle` / `nomeEla`: nomes exibidos nas caixas de diálogo.
- `dialogoVaranda`: as falas da cena do mirante.
- `mensagemPresente`: o texto que aparece quando o presente é aberto.
- `textoFinal`, `textoFinal2`, `textoFinal3`: os textos da tela final.
- `bilheteChave1`: o bilhete que aparece ao pegar a primeira chave.
- `memorias`: os textos que aparecem ao passar pelos 3 quadros do corredor.

Depois de editar, é só re-hospedar (ou, se estiver usando Git + Netlify,
simplesmente commitar e dar push — o deploy é automático).

### Trocar as cores da casa
As cores (ocre, turquesa, terracota, dourado etc.) estão centralizadas no
objeto `MAT` no topo de `js/main.js`, e também em `:root` no `style.css` para
a interface.

### Trocar os sprites da personagem
Os 10 quadros usados pela personagem estão em `assets/sprites/`. Se quiser
trocar por outros recortes das suas próprias artes, é só substituir os PNGs
mantendo os mesmos nomes de arquivo (fundo transparente, quadrado, ancorado
na base).

---

## 🗂 Estrutura de arquivos

```
game/
├── index.html          → página principal
├── style.css            → toda a interface (HUD, diálogos, telas)
├── netlify.toml          → configuração de deploy/headers
├── js/
│   ├── config.js         → TEXTOS EDITÁVEIS (nomes, falas, mensagens)
│   └── main.js           → o jogo em si (Three.js: cenário, personagem,
│                            colisões, diálogos, áudio, câmera)
└── assets/
    └── sprites/           → os 10 quadros de sprite (vestido tropical +
                              vestido de princesa) já recortados com fundo
                              transparente a partir das imagens que você
                              enviou
```

---

## Detalhes técnicos

- **Motor 3D:** Three.js r160, carregado via CDN (unpkg) usando import maps —
  não precisa instalar nada.
- **Câmera:** estilo "dollhouse"/maquete arquitetônica, com `OrbitControls`
  seguindo a personagem, ângulo restrito para manter a leitura isométrica.
- **Personagem:** sprite 2D (bilboard) sempre de frente pra câmera, com
  troca de quadros para andar/parada/ações especiais, sobre o cenário 3D.
- **Áudio:** trilha ambiente e efeitos sonoros são **sintetizados via Web
  Audio API** (osciladores) — não há arquivos de música, então não existe
  problema de direitos autorais nem arquivos pesados para carregar.
- **Sem dependências de build:** tudo roda direto do navegador, então
  qualquer hospedagem de arquivo estático funciona (Netlify, Vercel, GitHub
  Pages, etc.) — Netlify foi só a que você pediu.

Feito com carinho para uma comemoração especial. 🎂💛
