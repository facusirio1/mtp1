name: Bug report
description: Reportar un error
body:
  - type: textarea
    attributes: { label: Descripción del bug, placeholder: "Qué ocurre…" }
    validations: { required: true }
  - type: textarea
    attributes: { label: Pasos para reproducir }
  - type: textarea
    attributes: { label: Comportamiento esperado }
