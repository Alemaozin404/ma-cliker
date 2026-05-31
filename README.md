# Maçã Clicker Black & White

Jogo clicker feito em HTML, CSS e JavaScript, pronto para subir no GitHub Pages.

## Arquivos

- `index.html`
- `style.css`
- `script.js`

## Como testar no PC

Abra o arquivo `index.html` no navegador.

## Como subir no GitHub Pages

1. Crie um repositório no GitHub, por exemplo:
   `maca-clicker`

2. Envie estes arquivos para a raiz do repositório:
   - `index.html`
   - `style.css`
   - `script.js`

3. No GitHub, entre em:
   `Settings > Pages`

4. Em `Build and deployment`, escolha:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`

5. Clique em salvar.

Depois o site fica em um link parecido com:

`https://SEU_USUARIO.github.io/maca-clicker/`

## Salvamento automático

O jogo salva automaticamente no navegador usando `localStorage`.

Isso significa:
- se abrir no mesmo navegador, o progresso volta;
- se abrir em outro celular/PC, começa um save novo;
- limpar dados do navegador apaga o progresso.
