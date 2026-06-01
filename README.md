# Maçã Clicker Ultra V3

Versão completa em HTML, CSS e JavaScript para GitHub Pages.

## O que tem nesta versão

- Visual preto e branco premium melhorado.
- Frutas evolutivas por prestígio:
  - 0: Maçã Prata
  - 10: Maçã Bronze
  - 20: Maçã de Ouro
  - 30: Maçã de Rubi
  - 40: Maçã de Cristal
- Cada fruta tem bônus próprio.
- Evento 2x automático a cada 30 minutos.
- Melhoria "Relógio 2x" aumenta a duração do evento.
- Melhoria "Chamado do Evento" reduz a espera do evento.
- Eventos raros aleatórios:
  - Chuva Infinita
  - Crítico Dobrado
  - Auto Farm 3x
  - Fruta Lendária temporária
- Loja com abas:
  - Clique
  - Auto
  - Eventos
  - Prestígio
- Novas melhorias:
  - Mão Rápida
  - Colheitadeira
  - Sorte Suprema
  - Crítico Supremo
  - Relógio 2x
  - Chamado do Evento
- Aba de conquistas com recompensas.
- Aba de estatísticas.
- Ranking local salvo no navegador.
- Temas preto e branco:
  - Preto Puro
  - Cinza Luxo
  - Cristal
  - Ouro B&W
  - Rubi Escuro
- Sons opcionais.
- Melhorias mobile.
- Salvamento automático no navegador.

## Como testar

Abra o `index.html` no navegador.

## Como atualizar no GitHub Pages sem apagar nada

Substitua apenas estes arquivos no seu repositório:

- `index.html`
- `style.css`
- `script.js`
- `README.md`

Depois faça commit.

## Observação sobre save

O save fica no navegador usando `localStorage`.

Se você já tinha save antigo, o jogo tenta importar automaticamente das versões anteriores.


## V3 Visual Fix

Esta versão corrige principalmente aparência e responsividade:

- Corrige elementos sobrepostos no celular.
- Corrige painel lateral apertado.
- Corrige botões de abas cortando texto.
- Corrige contador e cards quebrando com números grandes.
- Ajusta tamanho da fruta, anéis e botões no mobile.
- Melhora contraste e espaçamento.
- Mantém todas as funções da Ultra V3.


## Evento semanal Welison 5x

Adicionado nesta versão:

- Todo sábado acontece o evento **Welison 5x**.
- O evento dura 1 hora.
- Durante o evento, todos os ganhos recebem multiplicador 5x.
- O tema muda automaticamente para azul enquanto o evento estiver ativo.
- Quando o evento termina, o tema volta ao estilo normal escolhido pelo jogador.
- O evento aparece no painel superior com contador de tempo.


## Correção do horário do Welison 5x

O evento **Welison 5x** agora acontece exatamente:

- Todo sábado;
- Começa às **15:30**;
- Termina às **16:30**;
- Dura 1 hora;
- Durante esse período, o tema fica azul e os ganhos ficam 5x.


## Efeito visual do evento 2x

Atualização adicionada:

- Quando o evento 2x normal começa, aparecem maçãs caindo no fundo.
- Durante o evento 2x, a fruta principal fica com aparência meio dourada.
- Quando o evento 2x termina, o efeito para automaticamente.
- O evento Welison 5x continua com prioridade e tema azul separado.


## Organização lógica dos multiplicadores

Atualização adicionada:

- Ao clicar durante evento 2x, Welison 5x, crítico ou evento raro, o jogo mostra a conta do ganho.
- Exemplo: `100 × x2 = 200`.
- Se tiver Welison 5x + fruta + prestígio, aparece separado no texto.
- O painel principal mostra a fórmula lógica do clique atual.
- O ganho automático também mostra a conta quando aparece o texto flutuante.
- A lógica agora separa:
  - base do clique;
  - bônus de fruta;
  - bônus de prestígio;
  - evento 2x;
  - Welison 5x;
  - evento raro;
  - crítico;
  - chuva.


# Maçã Clicker Ultra V4 Full

Adicionado sem remover o sistema antigo:

- Missões diárias;
- Sistema de códigos/cupons;
- Calendário de eventos;
- Inventário de itens;
- Loja visual;
- Boss / Fruta Gigante;
- Exportar, copiar e importar save;
- Barra mobile inferior;
- Novos itens e recompensas.

Códigos disponíveis:
- WELISON5X
- SABADO1530
- ULTRA
- FREEBOOST
- CRISTAL
