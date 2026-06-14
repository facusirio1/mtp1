# Schema MongoDB — 8 colecciones

| Colección | Propósito | Campos clave |
|---|---|---|
| `users`           | Cuentas + KYC + reputación + wallet | email · role · membership · reputation · kyc_status · wallet_address |
| `documents`       | Documentos cargados con análisis IA | title · doc_type · file_hash · status · ai_risk · assigned_to |
| `validations`     | Dictámenes de verificadores | verifier_id · result (aprobado/observado/rechazado) · score_impact · opinion |
| `scoring_history` | Historial inmutable de cambios de reputación | prev_score · new_score · delta · reason |
| `activity_log`    | Auditoría estructural | action · entity · entity_id · details · ip_address |
| `nfts`            | NFTs minteados en ETTIOS | token_id · tx_hash · contract_address · chain_id · metadata_uri |
| `legal_consents`  | Auditoría SEPRELAD (Terms+Privacy+KYC) | document_type · version · ip_address · user_agent |
| `payments`        | Órdenes Redsys/Bizum | order_id · method · concept · amount · status · response_code |

## Score impact

| Resultado | Δ score |
|---|---|
| aprobado  | +8 |
| observado | −3 |
| rechazado | −10 |
| KYC verificado | +5 (vía admin) |
