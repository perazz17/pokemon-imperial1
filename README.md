# Pokémon Imperial

Runtime modulare recuperato dalla baseline V78.

## Avvio locale

    npm test
    npm run smoke
    npm start

Poi apri http://localhost:4173/.

La baseline Pokemon_Imperial_V78.html resta conservata separatamente. Il runtime modulare usa ES modules in src/.

## Stato

- Overworld e mappe V78 estratti.
- Battaglie, cattura, fuga e KO integrati.
- Prima e seconda città/palestra giocabili.
- Salvataggio/restore serializzato e validato.
- Renderer pixel-art procedurale sostituibile.
- Test smoke/integration presenti.

MT/Laboratorio mosse e Pensione/Uova restano legacy nella baseline e non sono ancora migrati nel runtime modulare.
