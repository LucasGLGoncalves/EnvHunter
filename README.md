# env-terminal-hacker

Esta aplicação existe para **praticar ConfigMap, env e Secret no Kubernetes** (além de `.env` local).

O front foi “rebrandado” para um visual de **terminal hacker** (fundo preto + texto verde) e exibe **chave e valor** das variáveis de ambiente.

Quando uma variável não está configurada (inexistente ou vazia), a aplicação mostra:

`erro de configuração, valor nao encontrado`

---

## Como rodar localmente

```bash
cd src
npm install
npm start
````

Edite o arquivo `src/.env` para simular chaves ausentes (deixe o valor vazio).

---

## Variáveis esperadas (fixas)

As chaves abaixo sempre aparecem na tela (mesmo se faltarem):

### ConfigMap / env (não sensíveis)

* `APP_NAME`
* `APP_VERSION`
* `APP_AUTHOR`
* `APP_ENV`
* `APP_PORT` (ou `PORT`)
* `APP_DEBUG`
* `APP_REGION`
* `APP_TIMEZONE`
* `APP_LOG_LEVEL`
* `APP_ALLOWED_IPS`
* `APP_FEATURE_FLAGS`
* `APP_BUILD_ID`
* `APP_COMMIT_SHA`
* `APP_DEPLOYMENT_ID`
* `APP_DB_HOST`
* `APP_DB_PORT`
* `APP_DB_NAME`
* `APP_DB_USER`
* `APP_REDIS_URL`
* `APP_PUBLIC_NOTE`
* `APP_REDACT_SECRETS` (se `true`, mascara valores marcados como secret)

### Secrets (sensíveis)

* `APP_PASSWORD`
* `APP_DB_PASSWORD`
* `APP_API_KEY`
* `APP_JWT_SECRET`
* `APP_WEBHOOK_TOKEN`
* `APP_ENCRYPTION_KEY`
* `APP_OAUTH_CLIENT_SECRET`
* `APP_SSH_PRIVATE_KEY`

> Dica: por padrão, a aplicação mostra tudo (até secrets) porque a ideia é validar se foram configuradas. Se quiser mascarar, defina `APP_REDACT_SECRETS=true`.

---

## Auto-detecção de chaves extras

Além da lista fixa acima, a tela também mostra automaticamente:

* qualquer env var que comece com `APP_` ou `LEAK_` (exceto as já listadas)

Assim você consegue inventar novas chaves para testar sem alterar código.

---

## Endpoints úteis

* `/` -> painel terminal (HTML)
* `/api/env` -> dump em JSON com status por chave
* `/healthz` -> healthcheck simples

---

## Kubernetes (manifests prontos)

Na pasta `k8s/` há exemplos para:

* `ConfigMap` (não sensíveis)
* `Secret` (sensíveis)
* `Deployment` usando **envFrom** (ConfigMap + Secret)
* `Service`

Aplicar:

```bash
kubectl apply -f k8s/
```

Depois, faça port-forward:

```bash
kubectl port-forward svc/env-terminal-hacker 3000:3000
```

Abra `http://localhost:3000`.

---

## Docker

```bash
docker build -t env-terminal-hacker:local ./src
docker run --rm -p 3000:3000 env-terminal-hacker:local
```
