# mate0s · instrucciones de montaje

Landing personal en forma de manual de montaje: lista de piezas (el stack), cinco pasos (formación, experiencia, stack, intereses y contacto) y un dibujo que se monta a medida que haces scroll.

Diseñada con la skill [mate0s-design](https://github.com/mate0sdev/mate0s-design). Tipografía Schibsted Grotesk, tinta `#16181C` sobre `#F5F5F3` y marcador amarillo `#FFD23F`.

## Editar

- **Piezas y contacto:** bloques `PIEZAS` y `CONTACTO` al principio del `<script>` de `index.html`. El email y LinkedIn están vacíos; rellénalos y aparecerán solos.
- **Textos de los pasos:** directamente en el HTML (secciones `data-step`).

## Probar en local

```bash
npx serve .
```

## Publicar en GitHub Pages

```powershell
git init
git add .
git commit -m "Landing mate0s"
gh repo create mate0sdev.github.io --public --source . --push
```

Quedará en https://mate0sdev.github.io.

La carpeta `exploraciones/` guarda los diseños de la fase de exploración. Si no quieres publicarla, bórrala o añádela a `.gitignore` antes del commit.

## Logo

`m0s.svg` es la versión vectorial plana de tu logo (un solo color, `currentColor`). En la página está incrustado como `<symbol>`: `#m0s` (logo completo, en la cabecera y el pie) y `#m0s-zero` (solo el 0 octogonal, en el titular y el favicon).
